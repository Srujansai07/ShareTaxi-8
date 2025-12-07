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

        // MOCK MODE
        return { success: true, message: 'OTP sent successfully (Mock Mode)' }

        /*
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
        */
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

        // MOCK MODE: Bypass Supabase/DB
        if (validated.otp === '123456') {
            // Simulate successful login
            const cookieStore = cookies()
            cookieStore.set('mock-session', 'true', { path: '/' })
            return { success: true, isNewUser: false, redirectTo: '/dashboard' }
        }

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
    // ... (keep existing logic or mock if needed later)
    return { success: false, error: 'Not implemented in mock mode' }
}

export async function verifyBuilding(formData: FormData) {
    // ... (keep existing logic or mock if needed later)
    return { success: false, error: 'Not implemented in mock mode' }
}

export async function logout() {
    const cookieStore = cookies()
    cookieStore.delete('mock-session')
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getCurrentUser() {
    try {
        // MOCK MODE
        const cookieStore = cookies()
        if (cookieStore.get('mock-session')) {
            return {
                success: true,
                user: {
                    id: 'mock-user-id',
                    phoneNumber: '+919876543210',
                    fullName: 'Test User',
                    displayName: 'Tester',
                    photoUrl: 'https://github.com/shadcn.png',
                    building: {
                        name: 'Galaxy Apartments',
                        area: 'Indiranagar'
                    },
                    trustScore: 4.8,
                    totalRides: 12
                }
            }
        }

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
