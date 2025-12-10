'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { getCurrentUser } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'
import { calculateCO2Saved, calculateCO2Split, calculateEcoPoints } from '@/lib/utils/co2'
import { calculateDistanceKm } from '@/lib/utils/geo'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createRideSchema = z.object({
    type: z.enum(['OWN_CAR', 'SHARED_CAB', 'PUBLIC_TRANSPORT', 'WALKING', 'CYCLING', 'TWO_WHEELER']),
    destinationName: z.string().min(1),
    destinationAddress: z.string().min(1),
    destinationLat: z.number(),
    destinationLng: z.number(),
    destinationPlaceId: z.string().optional(),
    departureTime: z.string().datetime(),
    flexibilityMinutes: z.number().min(0).max(120).default(15),
    totalSeats: z.number().min(1).max(6).default(1),
    costSharingEnabled: z.boolean().default(true),
    estimatedCost: z.number().optional(),
    genderPreference: z.enum(['ANY', 'SAME_GENDER', 'MALE', 'FEMALE']).default('ANY'),
    maxDetourKm: z.number().min(0).max(5).default(1.0),
    purpose: z.string().optional(),
    notes: z.string().optional()
})

// ============================================
// CREATE RIDE
// ============================================

export async function createRide(formData: FormData) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const rawData = {
            type: formData.get('type') as string,
            destinationName: formData.get('destinationName') as string,
            destinationAddress: formData.get('destinationAddress') as string,
            destinationLat: parseFloat(formData.get('destinationLat') as string),
            destinationLng: parseFloat(formData.get('destinationLng') as string),
            destinationPlaceId: formData.get('destinationPlaceId') as string || undefined,
            departureTime: formData.get('departureTime') as string,
            flexibilityMinutes: parseInt(formData.get('flexibilityMinutes') as string) || 15,
            totalSeats: parseInt(formData.get('totalSeats') as string) || 1,
            costSharingEnabled: formData.get('costSharingEnabled') === 'true',
            estimatedCost: formData.get('estimatedCost') ? parseFloat(formData.get('estimatedCost') as string) : undefined,
            genderPreference: formData.get('genderPreference') as string || 'ANY',
            maxDetourKm: parseFloat(formData.get('maxDetourKm') as string) || 1.0,
            purpose: formData.get('purpose') as string || undefined,
            notes: formData.get('notes') as string || undefined
        }

        const validated = createRideSchema.parse(rawData)
        const userId = session.user.id

        // Create ride
        const ride = await prisma.ride.create({
            data: {
                userId,
                buildingId: session.user.buildingId,
                type: validated.type as any,
                status: 'ACTIVE',
                destinationName: validated.destinationName,
                destinationAddress: validated.destinationAddress,
                destinationLat: validated.destinationLat,
                destinationLng: validated.destinationLng,
                destinationPlaceId: validated.destinationPlaceId,
                departureTime: new Date(validated.departureTime),
                flexibilityMinutes: validated.flexibilityMinutes,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                totalSeats: validated.totalSeats,
                availableSeats: validated.totalSeats - 1,
                costSharingEnabled: validated.costSharingEnabled,
                estimatedCost: validated.estimatedCost,
                costPerPerson: validated.estimatedCost ? validated.estimatedCost / validated.totalSeats : undefined,
                genderPreference: validated.genderPreference as any,
                maxDetourKm: validated.maxDetourKm,
                purpose: validated.purpose,
                notes: validated.notes,
            }
        })

        // Create driver as first participant
        await prisma.rideParticipant.create({
            data: {
                rideId: ride.id,
                userId,
                role: 'DRIVER',
                status: 'CONFIRMED',
                joinedAt: new Date()
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/rides')

        return { success: true, rideId: ride.id, message: 'Ride created successfully!' }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Ride creation error:', error)
        return { success: false, error: 'Failed to create ride' }
    }
}

// ============================================
// GET ACTIVE RIDES
// ============================================

export async function getActiveRides() {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated', rides: [] }
        }

        const rides = await prisma.ride.findMany({
            where: {
                status: 'ACTIVE',
                buildingId: session.user.buildingId,
                expiresAt: { gt: new Date() },
                availableSeats: { gt: 0 }
            },
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
                building: {
                    select: { name: true, area: true }
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, displayName: true, photoUrl: true }
                        }
                    }
                }
            },
            orderBy: { departureTime: 'asc' },
            take: 20
        })

        return { success: true, rides }
    } catch (error) {
        console.error('Get active rides error:', error)
        return { success: false, error: 'Failed to fetch rides', rides: [] }
    }
}

// ============================================
// JOIN RIDE
// ============================================

export async function joinRide(rideId: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: { participants: true }
        })

        if (!ride) return { success: false, error: 'Ride not found' }
        if (ride.availableSeats < 1) return { success: false, error: 'No seats available' }
        if (ride.userId === session.user.id) return { success: false, error: 'Cannot join your own ride' }

        const existingParticipant = ride.participants.find((p: { userId: string }) => p.userId === session.user?.id)
        if (existingParticipant) return { success: false, error: 'Already joined this ride' }

        await prisma.rideParticipant.create({
            data: {
                rideId,
                userId: session.user.id,
                role: 'PASSENGER',
                status: 'CONFIRMED',
                joinedAt: new Date()
            }
        })

        await prisma.ride.update({
            where: { id: rideId },
            data: { availableSeats: ride.availableSeats - 1 }
        })

        revalidatePath('/dashboard')
        revalidatePath(`/rides/${rideId}`)

        return { success: true, message: 'Successfully joined ride!' }
    } catch (error) {
        console.error('Join ride error:', error)
        return { success: false, error: 'Failed to join ride' }
    }
}

// ============================================
// COMPLETE RIDE (with CO2 tracking)
// ============================================

export async function completeRide(rideId: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) return { success: false, error: 'Not authenticated' }

        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: { participants: true, building: true }
        })

        if (!ride) return { success: false, error: 'Ride not found' }
        if (ride.userId !== session.user.id) return { success: false, error: 'Only the driver can complete the ride' }

        const distanceKm = ride.routeDistance ? ride.routeDistance / 1000 : 10
        const participantCount = ride.participants.length

        const totalCO2Saved = calculateCO2Saved(distanceKm, participantCount)
        const { driver: driverCO2, passenger: passengerCO2 } = calculateCO2Split(totalCO2Saved)

        await prisma.ride.update({
            where: { id: rideId },
            data: { status: 'COMPLETED' }
        })

        for (const participant of ride.participants) {
            await prisma.rideParticipant.update({
                where: { id: participant.id },
                data: { status: 'COMPLETED' }
            })

            const isDriver = participant.role === 'DRIVER'
            const co2Earned = isDriver ? driverCO2 : passengerCO2
            const points = calculateEcoPoints(co2Earned)

            await prisma.userStatistics.upsert({
                where: { userId: participant.userId },
                create: {
                    userId: participant.userId,
                    totalCO2Saved: co2Earned,
                    totalDistanceShared: distanceKm,
                    totalRides: 1,
                    ridesAsDriver: isDriver ? 1 : 0,
                    ridesAsPassenger: isDriver ? 0 : 1,
                    points,
                    ecoScore: points,
                    monthlyRides: 1,
                    monthlyCO2Saved: co2Earned,
                    monthlyDistanceShared: distanceKm
                },
                update: {
                    totalCO2Saved: { increment: co2Earned },
                    totalDistanceShared: { increment: distanceKm },
                    totalRides: { increment: 1 },
                    points: { increment: points },
                    ecoScore: { increment: points },
                    monthlyRides: { increment: 1 },
                    monthlyCO2Saved: { increment: co2Earned },
                    monthlyDistanceShared: { increment: distanceKm }
                }
            })

            await prisma.user.update({
                where: { id: participant.userId },
                data: { totalRides: { increment: 1 } }
            })
        }

        const passengers = ride.participants.filter((p: { role: string }) => p.role === 'PASSENGER')
        for (const passenger of passengers) {
            await prisma.cO2Split.create({
                data: {
                    rideId,
                    totalCO2Saved,
                    driverUserId: ride.userId,
                    driverCO2Share: driverCO2,
                    driverPercentage: 60,
                    passengerUserId: passenger.userId,
                    passengerCO2Share: passengerCO2,
                    passengerPercentage: 40,
                    driverConfirmed: true,
                    status: 'CONFIRMED',
                    routeDistance: distanceKm,
                    emissionFactor: 0.21,
                    vehicleType: ride.type,
                    finalizedAt: new Date()
                }
            })
        }

        revalidatePath('/dashboard')
        revalidatePath(`/rides/${rideId}`)

        return {
            success: true,
            message: 'Ride completed!',
            stats: { totalCO2Saved, driverCO2, passengerCO2, pointsEarned: calculateEcoPoints(driverCO2) }
        }
    } catch (error) {
        console.error('Complete ride error:', error)
        return { success: false, error: 'Failed to complete ride' }
    }
}

// ============================================
// CANCEL RIDE
// ============================================

export async function cancelRide(rideId: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) return { success: false, error: 'Not authenticated' }

        const ride = await prisma.ride.findUnique({ where: { id: rideId } })
        if (!ride) return { success: false, error: 'Ride not found' }
        if (ride.userId !== session.user.id) return { success: false, error: 'Only the driver can cancel the ride' }

        await prisma.ride.update({
            where: { id: rideId },
            data: { status: 'CANCELLED' }
        })

        revalidatePath('/dashboard')
        revalidatePath(`/rides/${rideId}`)

        return { success: true, message: 'Ride cancelled' }
    } catch (error) {
        console.error('Cancel ride error:', error)
        return { success: false, error: 'Failed to cancel ride' }
    }
}

// ============================================
// GET RIDE DETAILS
// ============================================

export async function getRideDetails(rideId: string) {
    try {
        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: {
                user: {
                    select: {
                        id: true, displayName: true, photoUrl: true,
                        trustScore: true, totalRides: true,
                        stats: { select: { totalCO2Saved: true, level: true } }
                    }
                },
                building: { select: { name: true, area: true, city: true } },
                participants: {
                    include: {
                        user: { select: { id: true, displayName: true, photoUrl: true, trustScore: true } }
                    }
                },
                messages: { orderBy: { createdAt: 'desc' }, take: 10 }
            }
        })

        if (!ride) return { success: false, error: 'Ride not found' }
        return { success: true, ride }
    } catch (error) {
        console.error('Get ride details error:', error)
        return { success: false, error: 'Failed to fetch ride details' }
    }
}

// ============================================
// SEARCH RIDES
// ============================================

export async function searchRides(params: {
    destination?: string
    q?: string
    from?: string
    to?: string
    departureAfter?: string
    departureBefore?: string
    type?: string
}) {
    try {
        const session = await getServerSession()
        if (!session?.user) return { success: false, error: 'Not authenticated', rides: [] }

        const searchTerm = params.destination || params.q || ''

        const rides = await prisma.ride.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { gt: new Date() },
                availableSeats: { gt: 0 },
                ...(searchTerm && {
                    OR: [
                        { destinationName: { contains: searchTerm, mode: 'insensitive' } },
                        { destinationAddress: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                }),
                ...(params.departureAfter && { departureTime: { gte: new Date(params.departureAfter) } }),
                ...(params.departureBefore && { departureTime: { lte: new Date(params.departureBefore) } }),
                ...(params.type && { type: params.type as any })
            },
            include: {
                user: { select: { id: true, displayName: true, photoUrl: true, trustScore: true, totalRides: true } },
                building: { select: { name: true, area: true } }
            },
            orderBy: { departureTime: 'asc' },
            take: 30
        })

        return { success: true, rides }
    } catch (error) {
        console.error('Search rides error:', error)
        return { success: false, error: 'Failed to search rides', rides: [] }
    }
}

// ============================================
// GET RIDE HISTORY
// ============================================

export async function getRideHistory() {
    try {
        const session = await getServerSession()
        if (!session?.user) return { success: false, error: 'Not authenticated', rides: [], stats: null }

        const rides = await prisma.ride.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { participants: { some: { userId: session.user.id } } }
                ],
                status: 'COMPLETED'
            },
            include: {
                user: { select: { id: true, displayName: true, photoUrl: true, trustScore: true } },
                building: { select: { name: true, area: true } },
                co2Splits: {
                    where: {
                        OR: [
                            { driverUserId: session.user.id },
                            { passengerUserId: session.user.id }
                        ]
                    }
                }
            },
            orderBy: { departureTime: 'desc' },
            take: 50
        })

        const stats = await prisma.userStatistics.findUnique({
            where: { userId: session.user.id }
        })

        return { success: true, rides, stats }
    } catch (error) {
        console.error('Get ride history error:', error)
        return { success: false, error: 'Failed to fetch history', rides: [], stats: null }
    }
}

// ============================================
// GET USER'S RIDES
// ============================================

export async function getUserRides(status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED') {
    try {
        const session = await getServerSession()
        if (!session?.user) return { success: false, error: 'Not authenticated', rides: [] }

        const rides = await prisma.ride.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { participants: { some: { userId: session.user.id } } }
                ],
                ...(status && { status })
            },
            include: {
                user: { select: { id: true, displayName: true, photoUrl: true, trustScore: true } },
                building: { select: { name: true, area: true } },
                participants: {
                    include: { user: { select: { id: true, displayName: true, photoUrl: true } } }
                },
                co2Splits: true
            },
            orderBy: { departureTime: 'desc' },
            take: 50
        })

        return { success: true, rides }
    } catch (error) {
        console.error('Get user rides error:', error)
        return { success: false, error: 'Failed to fetch rides', rides: [] }
    }
}

// ============================================
// GET MATCHES (from matching algorithm)
// ============================================

export async function getMatches(rideId: string) {
    try {
        const matches = await prisma.match.findMany({
            where: {
                sourceRideId: rideId,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            },
            include: {
                user: {
                    select: {
                        id: true, displayName: true, photoUrl: true,
                        trustScore: true, totalRides: true,
                        building: { select: { flatNumber: true, tower: true } }
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
