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
    allowSmoking: z.boolean().default(false),
    allowPets: z.boolean().default(false),
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
            where: { phoneNumber: session.user.phone! },
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
            allowSmoking: formData.get('allowSmoking') === 'true',
            allowPets: formData.get('allowPets') === 'true',
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
                originAddress: `${user.building.street}, ${user.building.area}`,
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

export async function cancelRide(rideId: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: { participants: true, building: true }
        })

        if (!ride) {
            return { success: false, error: 'Ride not found' }
        }

        if (ride.userId !== user.id) {
            return { success: false, error: 'Not authorized' }
        }

        await prisma.ride.update({
            where: { id: rideId },
            data: { status: 'CANCELLED' }
        })

        // Notify all participants
        const participants = ride.participants.filter(p => p.userId !== user.id)
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

export async function joinRide(rideId: string, matchId?: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
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
        const existingParticipant = ride.participants.find(p => p.userId === user.id)
        if (existingParticipant) {
            return { success: false, error: 'Already joined this ride' }
        }

        // Add participant
        await prisma.rideParticipant.create({
            data: {
                rideId: ride.id,
                userId: user.id,
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
            body: `${user.displayName} joined your ride to ${ride.destinationName}`,
            data: { rideId: ride.id, type: 'participant_joined' }
        })

        revalidatePath(`/rides/${rideId}`)

        return { success: true, message: 'Successfully joined ride' }
    } catch (error) {
        console.error('Join ride error:', error)
        return { success: false, error: 'Failed to join ride' }
    }
}

export async function leaveRide(rideId: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const participant = await prisma.rideParticipant.findFirst({
            where: {
                rideId: rideId,
                userId: user.id
            },
            include: { ride: true }
        })

        if (!participant) {
            return { success: false, error: 'Not a participant of this ride' }
        }

        if (participant.role === 'DRIVER') {
            return { success: false, error: 'Driver cannot leave ride. Cancel the ride instead.' }
        }

        // Update participant status
        await prisma.rideParticipant.update({
            where: { id: participant.id },
            data: {
                status: 'LEFT',
                leftAt: new Date()
            }
        })

        // Update available seats
        await prisma.ride.update({
            where: { id: rideId },
            data: { availableSeats: { increment: 1 } }
        })

        // Notify ride organizer
        await sendPushNotification(participant.ride.userId, {
            title: 'Rider Left',
            body: `${user.displayName} left your ride to ${participant.ride.destinationName}`,
            data: { rideId: rideId, type: 'participant_left' }
        })

        revalidatePath(`/rides/${rideId}`)

        return { success: true, message: 'Successfully left ride' }
    } catch (error) {
        console.error('Leave ride error:', error)
        return { success: false, error: 'Failed to leave ride' }
    }
}

export async function getActiveRides() {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const rides = await prisma.ride.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    {
                        participants: {
                            some: { userId: user.id }
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

export async function getRideDetails(rideId: string) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

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
                },
                building: true,
                matches: {
                    where: { status: 'PENDING' },
                    take: 5
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

export async function updateRideStatus(rideId: string, status: 'IN_PROGRESS' | 'COMPLETED') {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const ride = await prisma.ride.findUnique({
            where: { id: rideId },
            include: { participants: true }
        })

        if (!ride) {
            return { success: false, error: 'Ride not found' }
        }

        if (ride.userId !== user.id) {
            return { success: false, error: 'Not authorized' }
        }

        await prisma.ride.update({
            where: { id: rideId },
            data: { status }
        })

        if (status === 'COMPLETED') {
            // Update participant statuses
            await prisma.rideParticipant.updateMany({
                where: { rideId: rideId, status: 'CONFIRMED' },
                data: { status: 'COMPLETED' }
            })

            // Update user statistics
            for (const participant of ride.participants) {
                await prisma.user.update({
                    where: { id: participant.userId },
                    data: {
                        totalRides: { increment: 1 }
                    }
                })

                if (participant.userId !== ride.userId) {
                    await prisma.userStatistics.upsert({
                        where: { userId: participant.userId },
                        update: {
                            totalRides: { increment: 1 },
                            ridesAsPassenger: { increment: 1 },
                            totalDistanceSaved: { increment: (ride.routeDistance || 0) / 1000 },
                            totalMoneySaved: { increment: participant.agreedCost || 0 },
                            totalCO2Saved: { increment: ((ride.routeDistance || 0) / 1000) * 0.21 }
                        },
                        create: {
                            userId: participant.userId,
                            totalRides: 1,
                            ridesAsPassenger: 1,
                            totalDistanceSaved: (ride.routeDistance || 0) / 1000,
                            totalMoneySaved: participant.agreedCost || 0,
                            totalCO2Saved: ((ride.routeDistance || 0) / 1000) * 0.21
                        }
                    })
                }
            }

            // Update driver statistics
            await prisma.userStatistics.upsert({
                where: { userId: ride.userId },
                update: {
                    totalRides: { increment: 1 },
                    ridesAsDriver: { increment: 1 }
                },
                create: {
                    userId: ride.userId,
                    totalRides: 1,
                    ridesAsDriver: 1
                }
            })

            // Request ratings from all participants
            for (const participant of ride.participants) {
                await sendPushNotification(participant.userId, {
                    title: 'How was your ride?',
                    body: `Rate your experience to help build trust in the community`,
                    data: { rideId: ride.id, type: 'rating_request' }
                })
            }
        }

        revalidatePath(`/rides/${rideId}`)

        return { success: true, message: `Ride marked as ${status}` }
    } catch (error) {
        console.error('Update ride status error:', error)
        return { success: false, error: 'Failed to update ride status' }
    }
}
