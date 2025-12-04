'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { sendPushNotification, sendSMS } from '@/lib/notifications'

const triggerSOSSchema = z.object({
    rideId: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number(),
    address: z.string().optional()
})

export async function triggerSOS(formData: FormData) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! },
            include: { emergencyContacts: true }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const rawData = {
            rideId: formData.get('rideId') || undefined,
            latitude: parseFloat(formData.get('latitude') as string),
            longitude: parseFloat(formData.get('longitude') as string),
            accuracy: parseFloat(formData.get('accuracy') as string),
            address: formData.get('address') || undefined
        }

        const validated = triggerSOSSchema.parse(rawData)

        // Get ride participants if rideId provided
        let otherParticipants: string[] = []
        let rideStatus = undefined

        if (validated.rideId) {
            const ride = await prisma.ride.findUnique({
                where: { id: validated.rideId },
                include: { participants: true }
            })

            if (ride) {
                otherParticipants = ride.participants
                    .filter(p => p.userId !== user.id)
                    .map(p => p.userId)
                rideStatus = ride.status
            }
        }

        // Create SOS alert
        const sosAlert = await prisma.sOSAlert.create({
            data: {
                userId: user.id,
                rideId: validated.rideId,
                severity: 'CRITICAL',
                status: 'ACTIVE',
                latitude: validated.latitude,
                longitude: validated.longitude,
                accuracy: validated.accuracy,
                address: validated.address,
                triggerMethod: 'long_press',
                rideStatus,
                otherParticipants,
                notifiedEmergencyContacts: true,
                notifiedSupportTeam: true,
                notifiedParticipants: otherParticipants.length > 0
            }
        })

        // Notify emergency contacts
        for (const contact of user.emergencyContacts) {
            await sendSMS(
                contact.phoneNumber,
                `🚨 EMERGENCY: ${user.displayName} has triggered an SOS alert. Location: ${validated.address || `${validated.latitude}, ${validated.longitude}`}. Please check on them immediately.`
            )
        }

        // Notify ride participants
        for (const participantId of otherParticipants) {
            await sendPushNotification(participantId, {
                title: '🚨 EMERGENCY ALERT',
                body: `${user.displayName} has triggered an SOS alert`,
                data: {
                    sosAlertId: sosAlert.id,
                    type: 'sos_alert'
                }
            })
        }

        // TODO: Notify support team
        console.log('SOS Alert created:', sosAlert.id)

        return {
            success: true,
            sosAlertId: sosAlert.id,
            message: 'Emergency contacts have been notified'
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Trigger SOS error:', error)
        return { success: false, error: 'Failed to trigger SOS' }
    }
}

export async function resolveSOS(sosAlertId: string) {
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

        const sosAlert = await prisma.sOSAlert.findUnique({
            where: { id: sosAlertId }
        })

        if (!sosAlert) {
            return { success: false, error: 'SOS alert not found' }
        }

        if (sosAlert.userId !== user.id) {
            return { success: false, error: 'Not authorized' }
        }

        await prisma.sOSAlert.update({
            where: { id: sosAlertId },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
                resolvedBy: user.id,
                outcome: 'User confirmed safe'
            }
        })

        return { success: true, message: 'SOS alert resolved' }
    } catch (error) {
        console.error('Resolve SOS error:', error)
        return { success: false, error: 'Failed to resolve SOS' }
    }
}

export async function blockUser(blockedUserId: string, reason?: string) {
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

        await prisma.blockedUser.create({
            data: {
                blockerId: user.id,
                blockedUserId,
                reason
            }
        })

        return { success: true, message: 'User blocked successfully' }
    } catch (error) {
        console.error('Block user error:', error)
        return { success: false, error: 'Failed to block user' }
    }
}

export async function reportUser(
    reportedUserId: string,
    category: string,
    details: string
) {
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

        await prisma.blockedUser.create({
            data: {
                blockerId: user.id,
                blockedUserId: reportedUserId,
                reportCategory: category,
                details
            }
        })

        // TODO: Notify moderation team
        console.log(`User ${reportedUserId} reported by ${user.id}`)

        return { success: true, message: 'Report submitted successfully' }
    } catch (error) {
        console.error('Report user error:', error)
        return { success: false, error: 'Failed to report user' }
    }
}
