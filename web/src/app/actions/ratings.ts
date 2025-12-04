'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

const submitRatingSchema = z.object({
    rideId: z.string(),
    ratedUserId: z.string(),
    score: z.number().min(1).max(5),
    punctuality: z.number().min(1).max(5).optional(),
    communication: z.number().min(1).max(5).optional(),
    cleanliness: z.number().min(1).max(5).optional(),
    driving: z.number().min(1).max(5).optional(),
    friendliness: z.number().min(1).max(5).optional(),
    tags: z.array(z.string()).default([]),
    feedback: z.string().optional(),
    wouldRideAgain: z.boolean().default(true)
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

        const rawData = {
            rideId: formData.get('rideId'),
            ratedUserId: formData.get('ratedUserId'),
            score: parseInt(formData.get('score') as string),
            punctuality: formData.get('punctuality') ? parseInt(formData.get('punctuality') as string) : undefined,
            communication: formData.get('communication') ? parseInt(formData.get('communication') as string) : undefined,
            cleanliness: formData.get('cleanliness') ? parseInt(formData.get('cleanliness') as string) : undefined,
            driving: formData.get('driving') ? parseInt(formData.get('driving') as string) : undefined,
            friendliness: formData.get('friendliness') ? parseInt(formData.get('friendliness') as string) : undefined,
            tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
            feedback: formData.get('feedback') || undefined,
            wouldRideAgain: formData.get('wouldRideAgain') === 'true'
        }

        const validated = submitRatingSchema.parse(rawData)

        // Check if ride exists and user was participant
        const ride = await prisma.ride.findUnique({
            where: { id: validated.rideId },
            include: { participants: true }
        })

        if (!ride) {
            return { success: false, error: 'Ride not found' }
        }

        const isParticipant = ride.participants.some(p => p.userId === user.id)
        if (!isParticipant) {
            return { success: false, error: 'Not a participant of this ride' }
        }

        // Create rating
        const rating = await prisma.rating.create({
            data: {
                rideId: validated.rideId,
                raterId: user.id,
                ratedUserId: validated.ratedUserId,
                score: validated.score,
                punctuality: validated.punctuality,
                communication: validated.communication,
                cleanliness: validated.cleanliness,
                driving: validated.driving,
                friendliness: validated.friendliness,
                tags: validated.tags,
                feedback: validated.feedback,
                wouldRideAgain: validated.wouldRideAgain
            }
        })

        // Update rated user's trust score
        const ratings = await prisma.rating.findMany({
            where: { ratedUserId: validated.ratedUserId }
        })

        const averageScore = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length

        await prisma.user.update({
            where: { id: validated.ratedUserId },
            data: { trustScore: averageScore }
        })

        return { success: true, rating }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Submit rating error:', error)
        return { success: false, error: 'Failed to submit rating' }
    }
}

export async function getUserRatings(userId: string) {
    try {
        const ratings = await prisma.rating.findMany({
            where: { ratedUserId: userId, isPublic: true },
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
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        return { success: true, ratings }
    } catch (error) {
        console.error('Get user ratings error:', error)
        return { success: false, error: 'Failed to fetch ratings' }
    }
}
