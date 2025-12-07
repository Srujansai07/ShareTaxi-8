'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const ratingSchema = z.object({
    rideId: z.string(),
    ratedUserId: z.string(),
    rating: z.number().min(1).max(5),
    review: z.string().max(500).optional()
})

export async function submitRating(formData: FormData) {
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

        const validated = ratingSchema.parse({
            rideId: formData.get('rideId'),
            ratedUserId: formData.get('ratedUserId'),
            rating: Number(formData.get('rating')),
            review: formData.get('review') || undefined
        })

        // Check if ride is completed
        const ride = await prisma.ride.findUnique({
            where: { id: validated.rideId },
            include: {
                participants: {
                    where: { userId: user.id }
                }
            }
        })

        if (!ride || ride.status !== 'COMPLETED') {
            return { success: false, error: 'Can only rate completed rides' }
        }

        if (ride.participants.length === 0) {
            return { success: false, error: 'You were not part of this ride' }
        }

        // Check if already rated
        const existingRating = await prisma.rating.findFirst({
            where: {
                rideId: validated.rideId,
                raterId: user.id,
                ratedUserId: validated.ratedUserId
            }
        })

        if (existingRating) {
            return { success: false, error: 'You have already rated this user for this ride' }
        }

        // Create rating
        const rating = await prisma.rating.create({
            data: {
                rideId: validated.rideId,
                raterId: user.id,
                ratedUserId: validated.ratedUserId,
                rating: validated.rating,
                review: validated.review
            }
        })

        // Update rated user's trust score
        const userRatings = await prisma.rating.findMany({
            where: { ratedUserId: validated.ratedUserId },
            select: { rating: true }
        })

        const avgRating = userRatings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / userRatings.length
        const trustScore = Math.round(avgRating * 20) // Convert 1-5 to 20-100

        await prisma.user.update({
            where: { id: validated.ratedUserId },
            data: { trustScore }
        })

        revalidatePath(`/rides/${validated.rideId}`)

        return { success: true, rating }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Submit rating error:', error)
        return { success: false, error: 'Failed to submit rating' }
    }
}

export async function getRatingsForUser(userId: string) {
    try {
        const ratings = await prisma.rating.findMany({
            where: { ratedUserId: userId },
            include: {
                rater: {
                    select: {
                        displayName: true,
                        photoUrl: true
                    }
                },
                ride: {
                    select: {
                        destinationName: true,
                        departureTime: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        const avgRating = ratings.length > 0
            ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length
            : 0

        return { success: true, ratings, avgRating, totalRatings: ratings.length }
    } catch (error) {
        console.error('Get ratings error:', error)
        return { success: false, error: 'Failed to fetch ratings' }
    }
}
