'use server'

import { getServerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
})

export async function getUserProfile() {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        user: {
            id: session.user.id,
            phone: session.user.phone,
            displayName: 'Test User',
            email: 'test@example.com',
            photoUrl: 'https://github.com/shadcn.png',
            bio: 'I love carpooling! 🚗',
            trustScore: 4.8,
            totalRides: 12,
            building: {
                name: 'Galaxy Apartments',
                area: 'Indiranagar'
            }
        }
    }
}

export async function updateProfile(formData: FormData) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        const rawData = {
            displayName: formData.get('displayName'),
            email: formData.get('email'),
            bio: formData.get('bio'),
        }

        const validated = profileSchema.parse(rawData)

        // MOCK MODE
        revalidatePath('/profile')
        return {
            success: true,
            message: 'Profile updated successfully (Mock Mode)',
            user: {
                ...session.user,
                ...validated
            }
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        return { success: false, error: 'Failed to update profile' }
    }
}
