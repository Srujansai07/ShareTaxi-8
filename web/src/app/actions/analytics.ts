'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function getUserAnalytics() {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! },
            include: {
                statistics: true,
                _count: {
                    select: {
                        ridesCreated: true,
                        ridesParticipated: true,
                        ratingsReceived: true,
                        ratingsGiven: true
                    }
                }
            }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        // Get ride history
        const rideHistory = await prisma.rideParticipant.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED'
            },
            include: {
                ride: {
                    select: {
                        id: true,
                        destinationName: true,
                        departureTime: true,
                        type: true,
                        costPerPerson: true
                    }
                }
            },
            orderBy: { ride: { departureTime: 'desc' } },
            take: 10
        })

        // Calculate monthly stats
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const monthlyRides = await prisma.rideParticipant.count({
            where: {
                userId: user.id,
                status: 'COMPLETED',
                ride: {
                    departureTime: { gte: thirtyDaysAgo }
                }
            }
        })

        // Get average rating
        const ratings = await prisma.rating.findMany({
            where: { ratedUserId: user.id },
            select: { rating: true }
        })

        const avgRating = ratings.length > 0
            ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length
            : 0

        const analytics = {
            totalRides: user._count.ridesCreated + user._count.ridesParticipated,
            ridesAsDriver: user._count.ridesCreated,
            ridesAsPassenger: user._count.ridesParticipated,
            monthlyRides,
            totalSavings: user.statistics?.moneySaved || 0,
            co2Saved: user.statistics?.co2Saved || 0,
            trustScore: user.trustScore,
            avgRating: Number(avgRating.toFixed(1)),
            totalRatings: ratings.length,
            rideHistory,
            badges: user.statistics?.badges || []
        }

        return { success: true, analytics }
    } catch (error) {
        console.error('Get user analytics error:', error)
        return { success: false, error: 'Failed to fetch analytics' }
    }
}

export async function getLeaderboard(type: 'rides' | 'savings' | 'co2' = 'rides') {
    try {
        let orderBy: any = {}

        switch (type) {
            case 'rides':
                orderBy = { totalRides: 'desc' }
                break
            case 'savings':
                orderBy = { statistics: { moneySaved: 'desc' } }
                break
            case 'co2':
                orderBy = { statistics: { co2Saved: 'desc' } }
                break
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                displayName: true,
                photoUrl: true,
                trustScore: true,
                totalRides: true,
                statistics: {
                    select: {
                        moneySaved: true,
                        co2Saved: true
                    }
                }
            },
            orderBy,
            take: 10
        })

        return { success: true, leaderboard: users }
    } catch (error) {
        console.error('Get leaderboard error:', error)
        return { success: false, error: 'Failed to fetch leaderboard' }
    }
}

export async function getRideHistory(limit: number = 20) {
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

        const history = await prisma.rideParticipant.findMany({
            where: {
                userId: user.id
            },
            include: {
                ride: {
                    include: {
                        user: {
                            select: {
                                displayName: true,
                                photoUrl: true
                            }
                        },
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        displayName: true,
                                        photoUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { ride: { departureTime: 'desc' } },
            take: limit
        })

        return { success: true, history }
    } catch (error) {
        console.error('Get ride history error:', error)
        return { success: false, error: 'Failed to fetch ride history' }
    }
}
