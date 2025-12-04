'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const phoneSchema = z.object({
    phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number')
})

const otpSchema = z.object({
    phoneNumber: z.string(),
    otp: z.string().length(6, 'OTP must be 6 digits')
})

const profileSchema = z.object({
    fullName: z.string().min(2).max(100),
    displayName: z.string().min(2).max(50),
    gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
    dateOfBirth: z.string().optional()
})

const buildingVerificationSchema = z.object({
    buildingId: z.string().optional(),
    buildingName: z.string().min(2),
    street: z.string().min(2),
    area: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    latitude: z.number(),
    longitude: z.number(),
    tower: z.string().optional(),
    flatNumber: z.string().min(1)
})

export async function sendOTP(formData: FormData) {
    try {
        const validated = phoneSchema.parse({
            phoneNumber: formData.get('phoneNumber')
        })

        const supabase = createClient()

        const { data, error } = await supabase.auth.signInWithOtp({
            phone: validated.phoneNumber,
            options: {
                channel: 'sms'
            }
        })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, message: 'OTP sent successfully' }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        return { success: false, error: 'Failed to send OTP' }
    }
}

export async function verifyOTP(formData: FormData) {
    try {
        const validated = otpSchema.parse({
            phoneNumber: formData.get('phoneNumber'),
            otp: formData.get('otp')
        })

        const supabase = createClient()

        const { data, error } = await supabase.auth.verifyOtp({
            phone: validated.phoneNumber,
            token: validated.otp,
            type: 'sms'
        })

        if (error) {
            return { success: false, error: error.message }
        }

        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
            where: { phoneNumber: validated.phoneNumber }
        })

        if (!existingUser) {
            // New user - redirect to profile creation
            return { success: true, isNewUser: true, redirectTo: '/onboarding/profile' }
        }

        return { success: true, isNewUser: false, redirectTo: '/dashboard' }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        return { success: false, error: 'Failed to verify OTP' }
    }
}

export async function createProfile(formData: FormData) {
    try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            return { success: false, error: 'Not authenticated' }
        }

        const validated = profileSchema.parse({
            fullName: formData.get('fullName'),
            displayName: formData.get('displayName'),
            gender: formData.get('gender'),
            dateOfBirth: formData.get('dateOfBirth')
        })

        // Handle photo upload if provided
        let photoUrl = null
        const photoFile = formData.get('photo') as File
        if (photoFile && photoFile.size > 0) {
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(`${authUser.id}/${Date.now()}.jpg`, photoFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (!uploadError && uploadData) {
                const { data: { publicUrl } } = supabase.storage
                    .from('profile-photos')
                    .getPublicUrl(uploadData.path)
                photoUrl = publicUrl
            }
        }

        // Store in session for building verification
        const cookieStore = cookies()
        cookieStore.set('pending-profile', JSON.stringify({
            ...validated,
            photoUrl,
            phoneNumber: authUser.phone
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 30 // 30 minutes
        })

        return { success: true, redirectTo: '/onboarding/building' }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Profile creation error:', error)
        return { success: false, error: 'Failed to create profile' }
    }
}

export async function verifyBuilding(formData: FormData) {
    try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get pending profile from cookie
        const cookieStore = cookies()
        const pendingProfileCookie = cookieStore.get('pending-profile')
        if (!pendingProfileCookie) {
            return { success: false, error: 'Profile data not found' }
        }

        const pendingProfile = JSON.parse(pendingProfileCookie.value)

        const validated = buildingVerificationSchema.parse({
            buildingId: formData.get('buildingId'),
            buildingName: formData.get('buildingName'),
            street: formData.get('street'),
            area: formData.get('area'),
            city: formData.get('city'),
            state: formData.get('state'),
            pincode: formData.get('pincode'),
            latitude: parseFloat(formData.get('latitude') as string),
            longitude: parseFloat(formData.get('longitude') as string),
            tower: formData.get('tower'),
            flatNumber: formData.get('flatNumber')
        })

        // Find or create building
        let building
        if (validated.buildingId) {
            building = await prisma.building.findUnique({
                where: { id: validated.buildingId }
            })
        }

        if (!building) {
            building = await prisma.building.create({
                data: {
                    name: validated.buildingName,
                    type: 'APARTMENT',
                    street: validated.street,
                    area: validated.area,
                    city: validated.city,
                    state: validated.state,
                    pincode: validated.pincode,
                    latitude: validated.latitude,
                    longitude: validated.longitude,
                    isVerified: false
                }
            })
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                phoneNumber: pendingProfile.phoneNumber,
                fullName: pendingProfile.fullName,
                displayName: pendingProfile.displayName,
                gender: pendingProfile.gender,
                dateOfBirth: pendingProfile.dateOfBirth ? new Date(pendingProfile.dateOfBirth) : null,
                photoUrl: pendingProfile.photoUrl,
                buildingId: building.id,
                tower: validated.tower,
                flatNumber: validated.flatNumber,
                isVerified: true,
                verifiedAt: new Date(),
                verificationMethod: 'GPS'
            }
        })

        // Create user preferences
        await prisma.userPreferences.create({
            data: {
                userId: user.id
            }
        })

        // Create user statistics
        await prisma.userStatistics.create({
            data: {
                userId: user.id
            }
        })

        // Clear pending profile cookie
        cookieStore.delete('pending-profile')

        return { success: true, userId: user.id, redirectTo: '/dashboard' }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Building verification error:', error)
        return { success: false, error: 'Failed to verify building' }
    }
}

export async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getCurrentUser() {
    try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            return { success: false, error: 'Not authenticated' }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber: authUser.phone! },
            include: {
                building: true,
                preferences: true,
                stats: true
            }
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        return { success: true, user }
    } catch (error) {
        console.error('Get current user error:', error)
        return { success: false, error: 'Failed to get user' }
    }
}
