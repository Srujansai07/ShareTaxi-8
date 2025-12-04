import { prisma } from '@/lib/prisma'
import { sendPushNotification } from '@/lib/notifications'
import { calculateDistance, calculateTimeDifference } from '@/lib/utils/geo'

interface MatchScore {
    destinationProximity: number
    timeAlignment: number
    trustScore: number
    previousInteractions: number
    overall: number
}

const WEIGHTS = {
    destinationProximity: 0.40,
    timeAlignment: 0.30,
    trustScore: 0.20,
    previousInteractions: 0.10
}

const THRESHOLDS = {
    minimumScore: 0.60,
    highConfidence: 0.85,
    mediumConfidence: 0.70
}

export async function triggerMatching(rideId: string) {
    try {
        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: {
                user: true,
                building: true
            }
        })

        if (!ride) {
            throw new Error('Ride not found')
        }

        // Find potential matches based on:
        // 1. Same building or locality
        // 2. Similar departure time (±30 min window)
        // 3. Active rides only
        const timeWindowStart = new Date(ride.departureTime.getTime() - 30 * 60000)
        const timeWindowEnd = new Date(ride.departureTime.getTime() + 30 * 60000)

        const potentialRides = await prisma.ride.findMany({
            where: {
                id: { not: rideId },
                userId: { not: ride.userId },
                status: 'ACTIVE',
                departureTime: {
                    gte: timeWindowStart,
                    lte: timeWindowEnd
                },
                OR: [
                    { buildingId: ride.buildingId },
                    // Could add locality matching here
                ]
            },
            include: {
                user: {
                    include: {
                        preferences: true
                    }
                }
            }
        })

        const matches = []

        for (const potentialRide of potentialRides) {
            // Calculate destination proximity (in meters)
            const destinationDistance = calculateDistance(
                ride.destinationLat,
                ride.destinationLng,
                potentialRide.destinationLat,
                potentialRide.destinationLng
            )

            // Skip if destination too far
            if (destinationDistance > ride.maxDetourKm * 1000) {
                continue
            }

            // Calculate time difference (in minutes)
            const timeDifference = calculateTimeDifference(
                ride.departureTime,
                potentialRide.departureTime
            )

            // Check gender preferences
            if (ride.genderPreference === 'SAME_GENDER' &&
                ride.user.gender !== potentialRide.user.gender) {
                continue
            }

            if (potentialRide.genderPreference === 'SAME_GENDER' &&
                ride.user.gender !== potentialRide.user.gender) {
                continue
            }

            // Calculate match scores
            const scores = calculateMatchScore({
                destinationDistance,
                timeDifference,
                userTrustScore: potentialRide.user.trustScore,
                rideUserId: ride.userId,
                potentialUserId: potentialRide.userId
            })

            // Skip if below minimum threshold
            if (scores.overall < THRESHOLDS.minimumScore) {
                continue
            }

            // Determine confidence level
            let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
            if (scores.overall >= THRESHOLDS.highConfidence) {
                confidence = 'HIGH'
            } else if (scores.overall >= THRESHOLDS.mediumConfidence) {
                confidence = 'MEDIUM'
            }

            // Calculate benefits
            const estimatedSavings = ride.costPerPerson
                ? ride.costPerPerson * 0.5
                : calculateEstimatedSavings(destinationDistance)

            const co2Reduction = (destinationDistance / 1000) * 0.21 // kg CO2 per km

            // Create match record
            const match = await prisma.match.create({
                data: {
                    sourceRideId: ride.id,
                    targetUserId: potentialRide.userId,
                    targetRideId: potentialRide.id,
                    score: scores.overall,
                    confidence,
                    destinationProximityScore: scores.destinationProximity,
                    timeAlignmentScore: scores.timeAlignment,
                    trustScoreCompatibility: scores.trustScore,
                    previousInteractionsScore: scores.previousInteractions,
                    destinationDistance: Math.round(destinationDistance),
                    timeDifference: Math.round(timeDifference),
                    estimatedSavings,
                    co2Reduction: parseFloat(co2Reduction.toFixed(2)),
                    reasons: generateMatchReasons(scores, destinationDistance, timeDifference),
                    expiresAt: new Date(Date.now() + 15 * 60000) // 15 minutes
                }
            })

            matches.push(match)

            // Send notification to matched user
            await sendPushNotification(potentialRide.userId, {
                title: '🎉 Match Found!',
                body: `${ride.user.displayName} from ${ride.building.name} is going to ${ride.destinationName}`,
                data: {
                    matchId: match.id,
                    rideId: ride.id,
                    type: 'new_match'
                }
            })

            // Also notify ride creator
            await sendPushNotification(ride.userId, {
                title: '🎉 Match Found!',
                body: `${potentialRide.user.displayName} is also going to ${potentialRide.destinationName}`,
                data: {
                    matchId: match.id,
                    targetRideId: potentialRide.id,
                    type: 'new_match'
                }
            })
        }

        return { success: true, matchesFound: matches.length }
    } catch (error) {
        console.error('Matching algorithm error:', error)
        return { success: false, error: 'Matching failed' }
    }
}

function calculateMatchScore(params: {
    destinationDistance: number
    timeDifference: number
    userTrustScore: number
    rideUserId: string
    potentialUserId: string
}): MatchScore {
    const { destinationDistance, timeDifference, userTrustScore } = params

    // Destination proximity score (closer = better)
    // 0-500m: 1.0, 500-1000m: 0.8, 1000-2000m: 0.6, >2000m: 0.4
    let destScore = 1.0
    if (destinationDistance > 2000) destScore = 0.4
    else if (destinationDistance > 1000) destScore = 0.6
    else if (destinationDistance > 500) destScore = 0.8

    // Time alignment score (closer = better)
    // 0-5min: 1.0, 5-15min: 0.9, 15-30min: 0.7, >30min: 0.5
    let timeScore = 1.0
    if (timeDifference > 30) timeScore = 0.5
    else if (timeDifference > 15) timeScore = 0.7
    else if (timeDifference > 5) timeScore = 0.9

    // Trust score (normalized to 0-1)
    const trustScoreNormalized = userTrustScore / 5.0

    // Previous interactions (would need to query database)
    // For now, default to 0.7
    const previousInteractionsScore = 0.7

    // Calculate weighted overall score
    const overall =
        (destScore * WEIGHTS.destinationProximity) +
        (timeScore * WEIGHTS.timeAlignment) +
        (trustScoreNormalized * WEIGHTS.trustScore) +
        (previousInteractionsScore * WEIGHTS.previousInteractions)

    return {
        destinationProximity: destScore,
        timeAlignment: timeScore,
        trustScore: trustScoreNormalized,
        previousInteractions: previousInteractionsScore,
        overall: parseFloat(overall.toFixed(2))
    }
}

function generateMatchReasons(
    scores: MatchScore,
    distance: number,
    timeDiff: number
): string[] {
    const reasons: string[] = []

    if (scores.destinationProximity > 0.8) {
        reasons.push('destination_proximity')
    }
    if (scores.timeAlignment > 0.8) {
        reasons.push('time_match')
    }
    if (scores.trustScore > 0.85) {
        reasons.push('high_trust_score')
    }
    if (distance < 500) {
        reasons.push('same_destination')
    }
    if (timeDiff < 5) {
        reasons.push('perfect_timing')
    }

    return reasons
}

function calculateEstimatedSavings(distanceMeters: number): number {
    // Rough estimate: ₹12/km for Uber
    const costPerKm = 12
    const distanceKm = distanceMeters / 1000
    const totalCost = distanceKm * costPerKm
    return Math.round(totalCost * 0.5) // 50% savings by sharing
}

export async function getMatches(rideId: string) {
    try {
        const matches = await prisma.match.findMany({
            where: {
                sourceRideId: rideId,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            },
            include: {
                sourceRide: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                photoUrl: true,
                                trustScore: true,
                                totalRides: true
                            }
                        },
                        building: true
                    }
                }
            },
            orderBy: { score: 'desc' }
        })

        return { success: true, matches }
    } catch (error) {
        console.error('Get matches error:', error)
        return { success: false, error: 'Failed to fetch matches' }
    }
}

export async function respondToMatch(matchId: string, accept: boolean) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                sourceRide: true
            }
        })

        if (!match) {
            return { success: false, error: 'Match not found' }
        }

        const status = accept ? 'ACCEPTED' : 'DECLINED'

        await prisma.match.update({
            where: { id: matchId },
            data: {
                status,
                respondedAt: new Date()
            }
        })

        if (accept && match.targetRideId) {
            // If accepting, could automatically join the ride
            // This would call joinRide() from rides.ts
        }

        return { success: true, status }
    } catch (error) {
        console.error('Respond to match error:', error)
        return { success: false, error: 'Failed to respond to match' }
    }
}
