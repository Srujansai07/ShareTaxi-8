'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { sendPushNotification } from '@/lib/notifications'

const sosSchema = z.object({
    rideId: z.string(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number()
    }),
    message: z.string().max(500).optional()
})

const emergencyContactSchema = z.object({
    name: z.string().min(1).max(100),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    relationship: z.string().min(1).max(50)
})

export async function triggerSOS(formData: FormData) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! },
            include: {
                emergencyContacts: true
            }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const validated = sosSchema.parse({
            rideId: formData.get('rideId'),
            location: JSON.parse(formData.get('location') as string),
            message: formData.get('message') || undefined
        })

        // Get ride details
        const ride = await prisma.ride.findUnique({
            where: { id: validated.rideId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                phoneNumber: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        phoneNumber: true
                    }
                }
            }
        })

        if (!ride) {
            return { success: false, error: 'Ride not found' }
        }

        // Create SOS alert
        const sosAlert = await prisma.sOSAlert.create({
            data: {
                userId: user.id,
                rideId: validated.rideId,
                latitude: validated.location.latitude,
                longitude: validated.location.longitude,
                message: validated.message,
                status: 'ACTIVE'
            }
        })

        // Notify all ride participants
        const notificationPromises = ride.participants
            .filter(p => p.userId !== user.id)
            .map(p => sendPushNotification(p.userId, {
                title: '🚨 SOS ALERT',
                body: `${user.displayName} has triggered an SOS alert!`,
                data: {
                    type: 'sos_alert',
                    rideId: validated.rideId,
                    sosId: sosAlert.id,
                    latitude: validated.location.latitude.toString(),
                    longitude: validated.location.longitude.toString()
                },
                priority: 'high'
            }))

        // Notify emergency contacts
        const emergencyPromises = user.emergencyContacts.map(contact =>
            // In production, send SMS via Twilio or similar
            console.log(`SOS Alert to ${contact.name} (${contact.phoneNumber}): ${user.displayName} needs help at ${validated.location.latitude}, ${validated.location.longitude}`)
        )

        await Promise.all([...notificationPromises, ...emergencyPromises])

        return { success: true, sosAlert }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Trigger SOS error:', error)
        return { success: false, error: 'Failed to trigger SOS alert' }
    }
}

export async function resolveSOS(sosId: string) {
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
            where: { id: sosId }
        })

        if (!sosAlert) {
            return { success: false, error: 'SOS alert not found' }
        }

        if (sosAlert.userId !== user.id) {
            return { success: false, error: 'Not authorized' }
        }

        await prisma.sOSAlert.update({
            where: { id: sosId },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date()
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Resolve SOS error:', error)
        return { success: false, error: 'Failed to resolve SOS alert' }
    }
}

export async function addEmergencyContact(formData: FormData) {
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

        const validated = emergencyContactSchema.parse({
            name: formData.get('name'),
            phoneNumber: formData.get('phoneNumber'),
            relationship: formData.get('relationship')
        })

        const contact = await prisma.emergencyContact.create({
            data: {
                userId: user.id,
                ...validated
            }
        })

        return { success: true, contact }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Add emergency contact error:', error)
        return { success: false, error: 'Failed to add emergency contact' }
    }
}

export async function removeEmergencyContact(contactId: string) {
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

        await prisma.emergencyContact.delete({
            where: {
                id: contactId,
                userId: user.id
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Remove emergency contact error:', error)
        return { success: false, error: 'Failed to remove emergency contact' }
    }
}

export async function getEmergencyContacts() {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! },
            include: {
                emergencyContacts: true
            }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        return { success: true, contacts: user.emergencyContacts }
    } catch (error) {
        console.error('Get emergency contacts error:', error)
        return { success: false, error: 'Failed to fetch emergency contacts' }
    }
}
