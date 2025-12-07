'use server'

import { getServerSession } from '@/lib/auth'

export async function getNotifications() {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        notifications: [
            {
                id: 'notif-1',
                title: 'Ride Request Accepted',
                message: 'Your request to join the ride to Tech Park has been accepted.',
                type: 'RIDE_UPDATE',
                read: false,
                createdAt: new Date(Date.now() - 3600000) // 1 hour ago
            },
            {
                id: 'notif-2',
                title: 'New Message',
                message: 'Alice Smith sent you a message.',
                type: 'CHAT',
                read: true,
                createdAt: new Date(Date.now() - 7200000) // 2 hours ago
            },
            {
                id: 'notif-3',
                title: 'Ride Reminder',
                message: 'Your ride to Airport is tomorrow at 8 AM.',
                type: 'REMINDER',
                read: true,
                createdAt: new Date(Date.now() - 86400000) // 1 day ago
            }
        ]
    }
}

export async function markAsRead(notificationId: string) {
    // MOCK MODE
    return { success: true }
}
