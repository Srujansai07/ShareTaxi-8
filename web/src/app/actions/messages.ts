'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { sendPushNotification } from '@/lib/notifications'

const sendMessageSchema = z.object({
    conversationId: z.string().optional(),
    rideId: z.string().optional(),
    recipientId: z.string(),
    content: z.string().min(1).max(500),
    type: z.enum(['TEXT', 'LOCATION', 'QUICK_REPLY']).default('TEXT')
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

        const rawData = {
            conversationId: formData.get('conversationId') || undefined,
            rideId: formData.get('rideId') || undefined,
            recipientId: formData.get('recipientId'),
            content: formData.get('content'),
            type: formData.get('type') || 'TEXT'
        }

        const validated = sendMessageSchema.parse(rawData)

        // Find or create conversation
        let conversationId = validated.conversationId

        if (!conversationId) {
            const existingConversation = await prisma.conversation.findFirst({
                where: {
                    rideId: validated.rideId,
                    participants: {
                        hasEvery: [user.id, validated.recipientId]
                    }
                }
            })

            if (existingConversation) {
                conversationId = existingConversation.id
            } else {
                const newConversation = await prisma.conversation.create({
                    data: {
                        rideId: validated.rideId,
                        participants: [user.id, validated.recipientId]
                    }
                })
                conversationId = newConversation.id
            }
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId,
                rideId: validated.rideId,
                senderId: user.id,
                recipientId: validated.recipientId,
                content: validated.content,
                type: validated.type as any,
                deliveryStatus: 'DELIVERED'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        displayName: true,
                        photoUrl: true
                    }
                }
            }
        })

        // Update conversation
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                messageCount: { increment: 1 }
            }
        })

        // Send push notification
        await sendPushNotification(validated.recipientId, {
            title: `New message from ${message.sender.displayName}`,
            body: validated.content.substring(0, 100),
            data: {
                messageId: message.id,
                conversationId,
                rideId: validated.rideId,
                type: 'new_message'
            }
        })

        return { success: true, message }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Send message error:', error)
        return { success: false, error: 'Failed to send message' }
    }
}

export async function getConversationMessages(conversationId: string) {
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

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        })

        if (!conversation || !conversation.participants.includes(user.id)) {
            return { success: false, error: 'Not authorized' }
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
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

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                recipientId: user.id,
                readStatus: 'UNREAD'
            },
            data: {
                readStatus: 'READ',
                readAt: new Date()
            }
        })

        return { success: true, messages }
    } catch (error) {
        console.error('Get messages error:', error)
        return { success: false, error: 'Failed to fetch messages' }
    }
}

export async function getRideConversations(rideId: string) {
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

        const conversations = await prisma.conversation.findMany({
            where: {
                rideId,
                participants: {
                    has: user.id
                }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        })

        return { success: true, conversations }
    } catch (error) {
        console.error('Get ride conversations error:', error)
        return { success: false, error: 'Failed to fetch conversations' }
    }
}

export async function markMessageAsRead(messageId: string) {
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

        await prisma.message.update({
            where: {
                id: messageId,
                recipientId: user.id
            },
            data: {
                readStatus: 'READ',
                readAt: new Date()
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Mark as read error:', error)
        return { success: false, error: 'Failed to mark as read' }
    }
}
