'use server'

import { getServerSession } from '@/lib/auth'

export async function getConversations() {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        conversations: [
            {
                id: 'conv-1',
                lastMessage: 'Hey, are you still leaving at 5?',
                updatedAt: new Date(Date.now() - 300000), // 5 mins ago
                unreadCount: 2,
                otherUser: {
                    id: 'user-2',
                    displayName: 'Alice Smith',
                    photoUrl: null
                }
            },
            {
                id: 'conv-2',
                lastMessage: 'Thanks for the ride!',
                updatedAt: new Date(Date.now() - 86400000), // 1 day ago
                unreadCount: 0,
                otherUser: {
                    id: 'user-3',
                    displayName: 'Bob Jones',
                    photoUrl: null
                }
            }
        ]
    }
}

export async function getConversation(conversationId: string) {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        conversation: {
            id: conversationId,
            otherUser: {
                id: 'user-2',
                displayName: 'Alice Smith',
                photoUrl: null
            }
        }
    }
}

export async function getMessages(conversationId: string) {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        messages: [
            {
                id: 'msg-1',
                content: 'Hi Alice, I saw your ride request.',
                senderId: session.user.id,
                createdAt: new Date(Date.now() - 3600000)
            },
            {
                id: 'msg-2',
                content: 'Hey! Yes, is the seat still available?',
                senderId: 'user-2',
                createdAt: new Date(Date.now() - 3500000)
            },
            {
                id: 'msg-3',
                content: 'Yes it is. We are leaving at 5 PM sharp.',
                senderId: session.user.id,
                createdAt: new Date(Date.now() - 3400000)
            },
            {
                id: 'msg-4',
                content: 'Perfect. I will be at the gate.',
                senderId: 'user-2',
                createdAt: new Date(Date.now() - 300000)
            },
            {
                id: 'msg-5',
                content: 'Hey, are you still leaving at 5?',
                senderId: 'user-2',
                createdAt: new Date(Date.now() - 100000)
            }
        ]
    }
}

export async function sendMessage(conversationId: string, content: string) {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        message: {
            id: 'msg-mock-' + Date.now(),
            content,
            senderId: session.user.id,
            createdAt: new Date()
        }
    }
}
