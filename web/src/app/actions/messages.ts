'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendPushNotification } from '@/lib/notifications'

const messageSchema = z.object({
    rideId: z.string(),
    content: z.string().min(1).max(1000)
})

export async function sendMessage(formData: FormData) {
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

        const validated = messageSchema.parse({
            rideId: formData.get('rideId'),
            content: formData.get('content')
        })

        // Verify user is part of the ride
        const participant = await prisma.rideParticipant.findFirst({
            where: {
                rideId: validated.rideId,
                userId: user.id,
                status: { in: ['CONFIRMED', 'COMPLETED'] }
            },
            include: {
                ride: {
                    include: {
                        participants: {
                            where: {
                                userId: { not: user.id },
                                status: { in: ['CONFIRMED', 'COMPLETED'] }
                            }
                        }
                    }
                }
            }
        })

        if (!participant) {
            return { success: false, error: 'Not authorized to send messages in this ride' }
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                rideId: validated.rideId,
                senderId: user.id,
                content: validated.content,
                type: 'TEXT'
            }
        })

        // Notify other participants
        for (const otherParticipant of participant.ride.participants) {
            await sendPushNotification(otherParticipant.userId, {
                title: `New message from ${user.displayName}`,
                body: validated.content.substring(0, 100),
                data: {
                    rideId: validated.rideId,
                    messageId: message.id,
                    type: 'new_message'
                }
            })
        }

        revalidatePath(`/rides/${validated.rideId}`)

        return { success: true, message }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Send message error:', error)
        return { success: false, error: 'Failed to send message' }
    }
}

export async function getMessages(rideId: string) {
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

        // Verify user is part of the ride
        const participant = await prisma.rideParticipant.findFirst({
            where: {
                rideId: rideId,
                userId: user.id
            }
        })

        if (!participant) {
            return { success: false, error: 'Not authorized' }
        }

        const messages = await prisma.message.findMany({
            where: { rideId },
            include: {
                sender: {
                    select: {
                        id: true,
                        displayName: true,
                        photoUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        return { success: true, messages }
    } catch (error) {
        console.error('Get messages error:', error)
        return { success: false, error: 'Failed to fetch messages' }
    }
}
