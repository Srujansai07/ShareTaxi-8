// app/actions/auth.ts - Authentication Server Actions with Twilio Support
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import {
    sendOTPViaTwilioVerify,
    verifyOTPViaTwilioVerify,
    sendOTPViaSMS,
    verifyStoredOTP,
    checkRateLimit
} from '@/lib/sms/twilio'

// ============================================
// CONFIGURATION
// ============================================

const USE_TWILIO = process.env.USE_TWILIO === 'true'
const USE_SUPABASE_AUTH = process.env.USE_SUPABASE_AUTH !== 'false' // Default to true
// PITCH_MODE: Accept any 6-digit OTP for demo/pitch without real SMS
const PITCH_MODE = process.env.DEMO_MODE === 'true' || process.env.PITCH_MODE === 'true'
const PITCH_OTP = '123456' // Default OTP for pitch mode

// ============================================
// VALIDATION SCHEMAS
// ============================================

const phoneSchema = z.object({
    phoneNumber: z.string()
        .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number. Use format: +91XXXXXXXXXX')
})

const otpSchema = z.object({
    phoneNumber: z.string(),
    otp: z.string().length(6, 'OTP must be 6 digits')
})

const profileSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
    gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
    dateOfBirth: z.string().optional()
})

const buildingSchema = z.object({
    buildingId: z.string().min(1, 'Building is required'),
    flatNumber: z.string().min(1, 'Flat/Unit number is required'),
    tower: z.string().optional()
})

// ============================================
// SEND OTP (Supports Twilio + Supabase)
// ============================================

export async function sendOTP(formData: FormData) {
    try {
        const validated = phoneSchema.parse({
            phoneNumber: formData.get('phoneNumber')
        })

        // PITCH_MODE: Skip real SMS and accept any OTP
        if (PITCH_MODE) {
            return {
                success: true,
                message: `Pitch mode: Use OTP ${PITCH_OTP}`,
                provider: 'pitch',
                debugOTP: PITCH_OTP
            }
        }

        // Check rate limit
        const rateLimit = await checkRateLimit(validated.phoneNumber)
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: `Too many requests. Please try again in ${Math.ceil((rateLimit.retryAfter || 300) / 60)} minutes.`
            }
        }

        // Try Twilio first if configured
        if (USE_TWILIO) {
            const twilioResult = await sendOTPViaTwilioVerify(validated.phoneNumber)

            if (twilioResult.success) {
                return {
                    success: true,
                    message: 'OTP sent successfully to your phone',
                    provider: 'twilio',
                    ...(twilioResult.otp && { debugOTP: twilioResult.otp }) // Only in dev mode
                }
            }

            console.warn('Twilio failed, falling back to Supabase:', twilioResult.error)
        }

        // Fallback to Supabase auth
        if (USE_SUPABASE_AUTH) {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOtp({
                phone: validated.phoneNumber,
                options: { channel: 'sms', shouldCreateUser: true }
            })

            if (error) {
                console.error('Supabase OTP error:', error)
                return { success: false, error: error.message }
            }

            return {
                success: true,
                message: 'OTP sent successfully',
                provider: 'supabase',
                ...(process.env.NODE_ENV === 'development' && { debugOTP: '123456' })
            }
        }

        // Last resort: Direct SMS with stored OTP
        const smsResult = await sendOTPViaSMS(validated.phoneNumber)

        if (smsResult.success) {
            return {
                success: true,
                message: 'OTP sent successfully',
                provider: 'sms',
                ...(smsResult.otp && { debugOTP: smsResult.otp })
            }
        }

        return { success: false, error: 'Failed to send OTP. Please try again.' }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Send OTP error:', error)
        return { success: false, error: 'Failed to send OTP. Please try again.' }
    }
}

// ============================================
// VERIFY OTP (Supports Twilio + Supabase)
// ============================================

export async function verifyOTP(formData: FormData) {
    try {
        const validated = otpSchema.parse({
            phoneNumber: formData.get('phoneNumber'),
            otp: formData.get('otp')
        })

        let verificationResult: { success: boolean; error?: string }

        // PITCH_MODE: Accept 123456 or any 6-digit OTP
        if (PITCH_MODE) {
            verificationResult = validated.otp === PITCH_OTP
                ? { success: true }
                : { success: false, error: `Invalid OTP. Use ${PITCH_OTP} for pitch demo.` }
        }
        // Try Twilio Verify first
        else if (USE_TWILIO) {
            verificationResult = await verifyOTPViaTwilioVerify(
                validated.phoneNumber,
                validated.otp
            )

            if (!verificationResult.success) {
                // Check if OTP is stored locally
                const storedResult = await verifyStoredOTP(validated.phoneNumber, validated.otp)
                if (storedResult.success) {
                    verificationResult = storedResult
                }
            }
        } else if (USE_SUPABASE_AUTH) {
            // Use Supabase verification
            const supabase = createClient()
            const { error } = await supabase.auth.verifyOtp({
                phone: validated.phoneNumber,
                token: validated.otp,
                type: 'sms'
            })

            verificationResult = error
                ? { success: false, error: 'Invalid or expired OTP' }
                : { success: true }
        } else {
            // Use stored OTP verification
            verificationResult = await verifyStoredOTP(validated.phoneNumber, validated.otp)
        }

        if (!verificationResult.success) {
            return { success: false, error: verificationResult.error || 'Verification failed' }
        }

        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
            where: { phoneNumber: validated.phoneNumber },
            include: { building: true }
        })

        if (existingUser) {
            revalidatePath('/dashboard')
            return {
                success: true,
                isNewUser: false,
                redirectTo: '/dashboard',
                user: existingUser
            }
        }

        // New user - needs to complete profile
        // Store phone number in cookie for next steps
        const cookieStore = cookies()
        cookieStore.set('verified-phone', validated.phoneNumber, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 30 // 30 minutes
        })

        return {
            success: true,
            isNewUser: true,
            redirectTo: '/onboarding/profile'
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Verify OTP error:', error)
        return { success: false, error: 'Verification failed. Please try again.' }
    }
}

// ============================================
// CREATE/UPDATE PROFILE
// ============================================

export async function saveProfile(formData: FormData) {
    try {
        // Get verified phone from cookie or Supabase session
        const cookieStore = cookies()
        const verifiedPhone = cookieStore.get('verified-phone')?.value

        let phoneNumber = verifiedPhone

        if (!phoneNumber && USE_SUPABASE_AUTH) {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            phoneNumber = authUser?.phone
        }

        if (!phoneNumber) {
            return { success: false, error: 'Not authenticated' }
        }

        const validated = profileSchema.parse({
            fullName: formData.get('fullName'),
            displayName: formData.get('displayName'),
            gender: formData.get('gender') || undefined,
            dateOfBirth: formData.get('dateOfBirth') || undefined
        })

        // Store profile data in cookie for building step
        cookieStore.set('profile-data', JSON.stringify({
            ...validated,
            phoneNumber
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 30
        })

        return { success: true, redirectTo: '/onboarding/building' }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Save profile error:', error)
        return { success: false, error: 'Failed to save profile' }
    }
}

// ============================================
// ASSIGN BUILDING & COMPLETE REGISTRATION
// ============================================

export async function assignBuilding(formData: FormData) {
    try {
        const cookieStore = cookies()
        const profileCookie = cookieStore.get('profile-data')

        if (!profileCookie?.value) {
            return { success: false, error: 'Profile data missing. Please start again.' }
        }

        const profileData = JSON.parse(profileCookie.value)
        const phoneNumber = profileData.phoneNumber

        if (!phoneNumber) {
            return { success: false, error: 'Phone number missing. Please start again.' }
        }

        const validated = buildingSchema.parse({
            buildingId: formData.get('buildingId'),
            flatNumber: formData.get('flatNumber'),
            tower: formData.get('tower') || undefined
        })

        // Create user in database
        const user = await prisma.user.create({
            data: {
                phoneNumber,
                fullName: profileData.fullName,
                displayName: profileData.displayName,
                gender: profileData.gender || null,
                dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null,
                buildingId: validated.buildingId,
                flatNumber: validated.flatNumber,
                tower: validated.tower,
                isVerified: true,
                verifiedAt: new Date(),
                verificationMethod: 'OTP',
                trustScore: 3.0,
            }
        })

        // Create default preferences
        await prisma.userPreferences.create({
            data: { userId: user.id }
        })

        // Create default statistics
        await prisma.userStatistics.create({
            data: {
                userId: user.id,
                level: 'newcomer',
                points: 0,
                ecoScore: 0
            }
        })

        // Clear cookies
        cookieStore.delete('profile-data')
        cookieStore.delete('verified-phone')

        revalidatePath('/dashboard')
        return {
            success: true,
            userId: user.id,
            redirectTo: '/dashboard',
            message: 'Registration complete! Welcome to ShareTaxi 🎉'
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        console.error('Assign building error:', error)
        return { success: false, error: 'Failed to complete registration' }
    }
}

// ============================================
// LOGOUT
// ============================================

export async function logout() {
    const cookieStore = cookies()

    // Sign out from Supabase if using it
    if (USE_SUPABASE_AUTH) {
        const supabase = createClient()
        await supabase.auth.signOut()
    }

    // Clear all auth-related cookies
    cookieStore.delete('mock-session')
    cookieStore.delete('verified-phone')
    cookieStore.delete('profile-data')

    revalidatePath('/')
    return { success: true, redirectTo: '/login' }
}

// ============================================
// GET BUILDINGS LIST
// ============================================

export async function getBuildings(searchQuery?: string) {
    try {
        const buildings = await prisma.building.findMany({
            where: searchQuery ? {
                OR: [
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { area: { contains: searchQuery, mode: 'insensitive' } },
                    { city: { contains: searchQuery, mode: 'insensitive' } }
                ]
            } : undefined,
            orderBy: { name: 'asc' },
            take: 20
        })

        return { success: true, buildings }
    } catch (error) {
        console.error('Get buildings error:', error)
        return { success: false, buildings: [], error: 'Failed to fetch buildings' }
    }
}

// ============================================
// GET CURRENT USER
// ============================================

export async function getCurrentUser() {
    try {
        const cookieStore = cookies()
        const verifiedPhone = cookieStore.get('verified-phone')?.value

        let phoneNumber = verifiedPhone

        if (!phoneNumber && USE_SUPABASE_AUTH) {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            phoneNumber = authUser?.phone
        }

        if (!phoneNumber) {
            return { success: false, user: null }
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber },
            include: {
                building: true,
                preferences: true,
                stats: true,
                achievements: {
                    include: { achievement: true },
                    where: { isCompleted: true }
                }
            }
        })

        if (!user) {
            return { success: false, user: null, isNewUser: true }
        }

        return { success: true, user }
    } catch (error) {
        console.error('Get current user error:', error)
        return { success: false, user: null }
    }
}

// ============================================
// RESEND OTP
// ============================================

export async function resendOTP(formData: FormData) {
    // Just call sendOTP with rate limit check
    return sendOTP(formData)
}

// ============================================
// ALIASES FOR BACKWARD COMPATIBILITY
// ============================================

export const createProfile = saveProfile
export const verifyBuilding = assignBuilding
