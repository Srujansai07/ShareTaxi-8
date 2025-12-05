'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const notificationPreferencesSchema = z.object({
    matchNotifications: z.boolean(),
    messageNotifications: z.boolean(),
    rideReminders: z.boolean(),
    sosAlerts: z.boolean(),
    emailNotifications: z.boolean()
})

const userSettingsSchema = z.object({
    displayName: z.string().min(2).max(50),
    bio: z.string().max(200).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    showPhoneNumber: z.boolean(),
    showLocation: z.boolean(),
    autoAcceptMatches: z.boolean()
})

export async function updateNotificationPreferences(formData: FormData) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! },
            include: { preferences: true }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const validated = notificationPreferencesSchema.parse({
            matchNotifications: formData.get('matchNotifications') === 'true',
            messageNotifications: formData.get('messageNotifications') === 'true',
            rideReminders: formData.get('rideReminders') === 'true',
            sosAlerts: formData.get('sosAlerts') === 'true',
            emailNotifications: formData.get('emailNotifications') === 'true'
        })

        if (user.preferences) {
            await prisma.userPreferences.update({
                where: { userId: user.id },
                data: validated
            })
        } else {
            await prisma.userPreferences.create({
                data: {
                    userId: user.id,
                    ...validated
                }
            })
        }

        revalidatePath('/settings')

        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Update notification preferences error:', error)
        return { success: false, error: 'Failed to update preferences' }
    }
}

export async function updateUserSettings(formData: FormData) {
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

        const validated = userSettingsSchema.parse({
            displayName: formData.get('displayName'),
            bio: formData.get('bio') || undefined,
            gender: formData.get('gender'),
            showPhoneNumber: formData.get('showPhoneNumber') === 'true',
            showLocation: formData.get('showLocation') === 'true',
            autoAcceptMatches: formData.get('autoAcceptMatches') === 'true'
        })

        await prisma.user.update({
            where: { id: user.id },
            data: {
                displayName: validated.displayName,
                bio: validated.bio,
                gender: validated.gender
            }
        })

        await prisma.userPreferences.update({
            where: { userId: user.id },
            data: {
                showPhoneNumber: validated.showPhoneNumber,
                showLocation: validated.showLocation,
                autoAcceptMatches: validated.autoAcceptMatches
            }
        })

        revalidatePath('/settings')
        revalidatePath('/profile')

        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Update user settings error:', error)
        return { success: false, error: 'Failed to update settings' }
    }
}

export async function getUserSettings() {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: session.user.phone! },
            include: { preferences: true }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        return {
            success: true,
            settings: {
                displayName: user.displayName,
                bio: user.bio,
                gender: user.gender,
                phoneNumber: user.phoneNumber,
                photoUrl: user.photoUrl,
                preferences: user.preferences
            }
        }
    } catch (error) {
        console.error('Get user settings error:', error)
        return { success: false, error: 'Failed to fetch settings' }
    }
}

export async function deleteAccount() {
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

        // Soft delete - mark as deleted instead of actually deleting
        await prisma.user.update({
            where: { id: user.id },
            data: {
                displayName: 'Deleted User',
                phoneNumber: `deleted_${user.id}`,
                photoUrl: null,
                bio: null
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Delete account error:', error)
        return { success: false, error: 'Failed to delete account' }
    }
}
