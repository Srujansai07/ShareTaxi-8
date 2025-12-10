// lib/auth.ts - Server-side Authentication Utilities
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// DEMO MODE: Set DEMO_MODE=true in Vercel for pitch demos
const DEMO_MODE = process.env.DEMO_MODE === 'true'

interface Session {
    user: {
        id: string
        phoneNumber: string
        phone: string  // Alias for phoneNumber (backward compatibility)
        email?: string | null
        displayName: string
        fullName: string
        photoUrl?: string | null
        buildingId: string
        building: {
            id: string
            name: string
            area: string
            city: string
        }
        trustScore: number
        totalRides: number
        ecoScore: number
        currentStreak: number
        longestStreak: number
        totalCO2Saved: number
    } | null
}

// Demo user data for pitch presentation
const DEMO_USER = {
    id: 'demo-user-001',
    phoneNumber: '+919876543210',
    phone: '+919876543210',
    email: 'priya.sharma@techpark.com',
    displayName: 'Priya S.',
    fullName: 'Priya Sharma',
    photoUrl: null,
    buildingId: 'bldg_prestige_tech_park',
    building: {
        id: 'bldg_prestige_tech_park',
        name: 'Prestige Tech Park',
        area: 'Marathahalli',
        city: 'Bangalore'
    },
    trustScore: 4.8,
    totalRides: 47,
    ecoScore: 2350,
    currentStreak: 12,
    longestStreak: 28,
    totalCO2Saved: 127.5
}

/**
 * Get the current authenticated user session
 * Returns full user data from database
 */
export async function getServerSession(): Promise<Session | null> {
    try {
        // Demo mode for pitch - always return demo user
        if (DEMO_MODE) {
            const cookieStore = cookies()
            const demoCookie = cookieStore.get('demo-session')

            if (demoCookie) {
                return { user: DEMO_USER }
            }

            // Also check for mock-session for backward compatibility
            const mockCookie = cookieStore.get('mock-session')
            if (mockCookie) {
                return { user: DEMO_USER }
            }
        }

        // Real authentication
        const supabase = createClient()
        const { data: { user: authUser }, error } = await supabase.auth.getUser()

        if (error || !authUser?.phone) {
            return null
        }

        // Fetch full user from database
        const user = await prisma.user.findUnique({
            where: { phoneNumber: authUser.phone },
            include: {
                building: {
                    select: {
                        id: true,
                        name: true,
                        area: true,
                        city: true
                    }
                },
                stats: true
            }
        })

        if (!user) {
            return null
        }

        return {
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                phone: user.phoneNumber,
                email: user.email,
                displayName: user.displayName,
                fullName: user.fullName,
                photoUrl: user.photoUrl,
                buildingId: user.buildingId,
                building: user.building,
                trustScore: user.trustScore,
                totalRides: user.totalRides,
                ecoScore: user.stats?.ecoScore || 0,
                currentStreak: user.stats?.currentStreak || 0,
                longestStreak: user.stats?.longestStreak || 0,
                totalCO2Saved: user.stats?.totalCO2Saved || 0
            }
        }
    } catch (error) {
        console.error('Session error:', error)
        return null
    }
}

/**
 * Check if user is authenticated (lightweight check)
 */
export async function isAuthenticated(): Promise<boolean> {
    if (DEMO_MODE) {
        const cookieStore = cookies()
        return !!cookieStore.get('demo-session') || !!cookieStore.get('mock-session')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
}

/**
 * Get auth user ID without full database fetch
 */
export async function getAuthUserId(): Promise<string | null> {
    if (DEMO_MODE) {
        const cookieStore = cookies()
        const hasSession = cookieStore.get('demo-session') || cookieStore.get('mock-session')
        return hasSession ? DEMO_USER.id : null
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.phone) return null

    const dbUser = await prisma.user.findUnique({
        where: { phoneNumber: user.phone },
        select: { id: true }
    })

    return dbUser?.id || null
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
    if (DEMO_MODE) {
        return true
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.phone) return false

    const dbUser = await prisma.user.findUnique({
        where: { phoneNumber: user.phone },
        select: { id: true, buildingId: true }
    })

    return !!dbUser?.buildingId
}
