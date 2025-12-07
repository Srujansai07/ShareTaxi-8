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

        // MOCK MODE
        return {
            success: true,
            rideId: 'mock-ride-id-' + Date.now(),
            message: 'Ride created successfully (Mock Mode)'
        }
    } catch (error) {
        console.error('Ride creation error:', error)
        return { success: false, error: 'Failed to create ride' }
    }
}

export async function getRideDetails(rideId: string) {
    // MOCK MODE
    return {
        success: true,
        ride: {
            id: rideId,
            destinationName: 'Tech Park',
            destinationAddress: 'Whitefield, Bangalore',
            departureTime: new Date(Date.now() + 3600000), // 1 hour from now
            availableSeats: 3,
            costPerPerson: 150,
            user: {
                id: 'mock-user-id',
                displayName: 'Test User',
                photoUrl: 'https://github.com/shadcn.png',
                trustScore: 4.8,
                totalRides: 12
            },
            building: {
                name: 'Galaxy Apartments',
                area: 'Indiranagar'
            },
            participants: []
        }
    }
}

export async function getActiveRides() {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        // MOCK MODE
        return {
            success: true,
            rides: [
                {
                    id: 'ride-1',
                    destinationName: 'Manyata Tech Park',
                    destinationAddress: 'Hebbal, Bangalore',
                    departureTime: new Date(Date.now() + 7200000), // 2 hours from now
                    availableSeats: 2,
                    costPerPerson: 120,
                    user: {
                        id: 'user-2',
                        displayName: 'Alice Smith',
                        photoUrl: null,
                        trustScore: 4.5
                    },
                    building: {
                        name: 'Galaxy Apartments',
                        area: 'Indiranagar'
                    },
                    participants: []
                },
                {
                    id: 'ride-2',
                    destinationName: 'Airport (KIAL)',
                    destinationAddress: 'Devanahalli, Bangalore',
                    departureTime: new Date(Date.now() + 18000000), // 5 hours from now
                    availableSeats: 1,
                    costPerPerson: 450,
                    user: {
                        id: 'user-3',
                        displayName: 'Bob Jones',
                        photoUrl: null,
                        trustScore: 4.9
                    },
                    building: {
                        name: 'Galaxy Apartments',
                        area: 'Indiranagar'
                    },
                    participants: []
                }
            ]
        }
    } catch (error) {
        console.error('Get active rides error:', error)
        return { success: false, error: 'Failed to fetch rides' }
    }
}




export async function getRideHistory() {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        rides: [
            {
                id: 'ride-hist-1',
                destinationName: 'MG Road',
                destinationAddress: 'MG Road, Bangalore',
                departureTime: new Date(Date.now() - 86400000), // 1 day ago
                availableSeats: 0,
                costPerPerson: 100,
                type: 'SHARED_CAB',
                status: 'COMPLETED',
                building: { name: 'Galaxy Apartments' },
                user: {
                    id: 'user-2',
                    displayName: 'Alice Smith',
                    photoUrl: null,
                    trustScore: 4.5
                }
            },
            {
                id: 'ride-hist-2',
                destinationName: 'Orion Mall',
                destinationAddress: 'Rajajinagar, Bangalore',
                departureTime: new Date(Date.now() - 172800000), // 2 days ago
                availableSeats: 0,
                costPerPerson: 150,
                type: 'OWN_CAR',
                status: 'COMPLETED',
                building: { name: 'Galaxy Apartments' },
                user: {
                    id: 'mock-user-id',
                    displayName: 'Test User',
                    photoUrl: 'https://github.com/shadcn.png',
                    trustScore: 4.8
                }
            }
        ]
    }
}

export async function searchRides(query?: any) {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        rides: [
            {
                id: 'ride-201',
                destinationName: 'Indiranagar Metro',
                destinationAddress: 'Indiranagar, Bangalore',
                departureTime: new Date(Date.now() + 7200000), // 2 hours from now
                availableSeats: 2,
                costPerPerson: 80,
                type: 'SHARED_CAB',
                status: 'ACTIVE',
                building: { name: 'Galaxy Apartments' },
                user: {
                    id: 'user-201',
                    displayName: 'John Doe',
                    photoUrl: null,
                    trustScore: 4.5,
                    totalRides: 12
                }
            },
            {
                id: 'ride-202',
                destinationName: 'Koramangala Forum',
                destinationAddress: 'Koramangala, Bangalore',
                departureTime: new Date(Date.now() + 10800000), // 3 hours from now
                availableSeats: 3,
                costPerPerson: 120,
                type: 'OWN_CAR',
                status: 'ACTIVE',
                building: { name: 'Galaxy Apartments' },
                user: {
                    id: 'user-202',
                    displayName: 'Jane Smith',
                    photoUrl: null,
                    trustScore: 4.8,
                    totalRides: 34
                }
            },
            {
                id: 'ride-203',
                destinationName: 'Phoenix Marketcity',
                destinationAddress: 'Whitefield, Bangalore',
                departureTime: new Date(Date.now() + 14400000), // 4 hours from now
                availableSeats: 1,
                costPerPerson: 150,
                type: 'TWO_WHEELER',
                status: 'ACTIVE',
                building: { name: 'Galaxy Apartments' },
                user: {
                    id: 'user-203',
                    displayName: 'Mike Ross',
                    photoUrl: null,
                    trustScore: 4.2,
                    totalRides: 8
                }
            }
        ]
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
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    revalidatePath(`/rides/${rideId}`)
    return { success: true, message: 'Successfully joined ride (Mock Mode)' }
}

export async function cancelRide(rideId: string) {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    revalidatePath('/dashboard')
    revalidatePath(`/rides/${rideId}`)
    return { success: true, message: 'Ride cancelled successfully (Mock Mode)' }
}
