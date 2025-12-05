'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { triggerMatching } from '@/lib/matching/algorithm'
import { sendPushNotification } from '@/lib/notifications'

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

export async function createRide(formData: FormData) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { building: true }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const rawData = {
            type: formData.get('type'),
            destinationName: formData.get('destinationName'),
            destinationAddress: formData.get('destinationAddress'),
            destinationLat: parseFloat(formData.get('destinationLat') as string),
            destinationLng: parseFloat(formData.get('destinationLng') as string),
            destinationPlaceId: formData.get('destinationPlaceId') || undefined,
            departureTime: formData.get('departureTime'),
            flexibilityMinutes: parseInt(formData.get('flexibilityMinutes') as string || '15'),
            totalSeats: parseInt(formData.get('totalSeats') as string || '1'),
            costSharingEnabled: formData.get('costSharingEnabled') === 'true',
            estimatedCost: formData.get('estimatedCost') ? parseFloat(formData.get('estimatedCost') as string) : undefined,
            genderPreference: formData.get('genderPreference') || 'ANY',
            maxDetourKm: parseFloat(formData.get('maxDetourKm') as string || '1.0'),
            purpose: formData.get('purpose') || undefined,
            notes: formData.get('notes') || undefined
        }

        const validated = createRideSchema.parse(rawData)

        const departureTime = new Date(validated.departureTime)
        const expiresAt = new Date(departureTime.getTime() + (validated.flexibilityMinutes + 15) * 60000)

        const ride = await prisma.ride.create({
            data: {
                userId: user.id,
                buildingId: user.buildingId,
                originAddress: user.building.street + ', ' + user.building.area,
                originLat: user.building.latitude,
                originLng: user.building.longitude,
                ...validated,
                departureTime,
                expiresAt,
                availableSeats: validated.totalSeats,
                costPerPerson: validated.estimatedCost ? validated.estimatedCost / validated.totalSeats : undefined,
                isImmediate: Date.now() - departureTime.getTime() < 300000 // Within 5 minutes
            }
        })

        // Add creator as driver participant
        await prisma.rideParticipant.create({
            data: {
                rideId: ride.id,
                userId: user.id,
                role: 'DRIVER',
                status: 'CONFIRMED'
            }
        })

        // Trigger matching algorithm
        await triggerMatching(ride.id)

        revalidatePath('/dashboard')

        return {
            success: true,
            rideId: ride.id,
            message: 'Ride created successfully'
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Ride creation error:', error)
        return { success: false, error: 'Failed to create ride' }
    }
}

export async function getRideDetails(rideId: string) {
    try {
        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
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
                    select: {
                        name: true,
                        area: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                photoUrl: true,
                                trustScore: true,
                                totalRides: true
                            }
                        }
                    }
                }
            }
        })

        if (!ride) {
            return { success: false, error: 'Ride not found' }
        }

        return { success: true, ride }
    } catch (error) {
        console.error('Get ride details error:', error)
        return { success: false, error: 'Failed to fetch ride details' }
    }
}

export async function getActiveRides() {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const rides = await prisma.ride.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    {
                        participants: {
                            some: { userId: session.user.id }
                        }
                    }
                ],
                status: { in: ['ACTIVE', 'IN_PROGRESS'] },
                expiresAt: { gt: new Date() }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        photoUrl: true,
                        trustScore: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                photoUrl: true,
                                trustScore: true
                            }
                        }
                    }
                },
                building: {
                    select: {
                        name: true,
                        area: true
                    }
                }
            },
            orderBy: { departureTime: 'asc' }
        })

        return { success: true, rides }
    } catch (error) {
        console.error('Get active rides error:', error)
        return { success: false, error: 'Failed to fetch rides' }
    }
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
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        photoUrl: true,
                        trustScore: true,
                        totalRides: true,
                        building: {
                            select: {
                                flatNumber: true,
                                tower: true
                            }
                        }
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

export async function joinRide(rideId: string, matchId?: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: { participants: true }
        })

        if (!ride) {
            return { success: false, error: 'Ride not found' }
        }

        if (ride.availableSeats <= 0) {
            return { success: false, error: 'No seats available' }
        }

        // Check if already joined
        const existingParticipant = ride.participants.find(p => p.userId === session.user.id)
        if (existingParticipant) {
            return { success: false, error: 'Already joined this ride' }
        }

        // Add participant
        await prisma.rideParticipant.create({
            data: {
                rideId: ride.id,
                userId: session.user.id,
                role: 'PASSENGER',
                status: 'CONFIRMED',
                agreedCost: ride.costPerPerson
            }
        })

        // Update available seats
        await prisma.ride.update({
            where: { id: rideId },
            data: { availableSeats: { decrement: 1 } }
        })

        // Update match status if provided
        if (matchId) {
            await prisma.match.update({
                where: { id: matchId },
                data: { status: 'ACCEPTED', respondedAt: new Date() }
            })
        }

        // Notify ride organizer
        await sendPushNotification(ride.userId, {
            title: 'New Rider Joined!',
            body: `Someone joined your ride to ${ride.destinationName}`,
            data: { rideId: ride.id, type: 'participant_joined' }
        })

        revalidatePath(`/rides/${rideId}`)

        return { success: true, message: 'Successfully joined ride' }
    } catch (error) {
        console.error('Join ride error:', error)
        return { success: false, error: 'Failed to join ride' }
    }
}

export async function cancelRide(rideId: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: { participants: true }
        })

        if (!ride) {
            return { success: false, error: 'Ride not found' }
        }

        if (ride.userId !== session.user.id) {
            return { success: false, error: 'Not authorized' }
        }

        await prisma.ride.update({
            where: { id: rideId },
            data: { status: 'CANCELLED' }
        })

        // Notify all participants
        const participants = ride.participants.filter(p => p.userId !== session.user.id)
        for (const participant of participants) {
            await sendPushNotification(participant.userId, {
                title: 'Ride Cancelled',
                body: `The ride to ${ride.destinationName} has been cancelled by the organizer.`,
                data: { rideId: ride.id, type: 'ride_cancelled' }
            })
        }

        revalidatePath('/dashboard')
        revalidatePath(`/rides/${rideId}`)

        return { success: true, message: 'Ride cancelled successfully' }
    } catch (error) {
        console.error('Cancel ride error:', error)
        return { success: false, error: 'Failed to cancel ride' }
    }
}
