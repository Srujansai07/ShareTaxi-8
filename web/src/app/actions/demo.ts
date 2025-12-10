'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

/**
 * Demo Login - Sets a demo session cookie for pitch presentation
 */
export async function demoLogin() {
    const cookieStore = cookies()

    // Set demo session cookie (expires in 24 hours)
    cookieStore.set('demo-session', 'active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
    })

    revalidatePath('/dashboard')

    return {
        success: true,
        message: 'Demo login successful! Welcome to ShareTaxi.',
        redirectTo: '/dashboard'
    }
}

/**
 * Demo Logout - Clears the demo session
 */
export async function demoLogout() {
    const cookieStore = cookies()
    cookieStore.delete('demo-session')
    cookieStore.delete('mock-session')

    revalidatePath('/')

    return { success: true, redirectTo: '/' }
}

/**
 * Get demo rides for dashboard display
 * Note: DEMO_RIDES defined inside function because 'use server' files
 * can only export async functions
 */
export async function getDemoRides() {
    const DEMO_RIDES = [
        {
            id: 'demo-ride-001',
            type: 'SHARED_CAB',
            status: 'ACTIVE',
            destinationName: 'Indiranagar Metro Station',
            destinationAddress: '100 Feet Road, Indiranagar, Bangalore',
            departureTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            availableSeats: 2,
            totalSeats: 3,
            user: {
                id: 'user-001',
                displayName: 'Rahul M.',
                photoUrl: null,
                trustScore: 4.7,
                totalRides: 32
            },
            building: {
                name: 'Prestige Tech Park',
                area: 'Marathahalli'
            },
            participants: [
                { id: 'p1', role: 'DRIVER', user: { displayName: 'Rahul M.', photoUrl: null } }
            ]
        },
        {
            id: 'demo-ride-002',
            type: 'OWN_CAR',
            status: 'ACTIVE',
            destinationName: 'Whitefield IT Park',
            destinationAddress: 'ITPL Main Road, Whitefield',
            departureTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
            availableSeats: 3,
            totalSeats: 4,
            user: {
                id: 'user-002',
                displayName: 'Sneha R.',
                photoUrl: null,
                trustScore: 4.9,
                totalRides: 56
            },
            building: {
                name: 'Prestige Tech Park',
                area: 'Marathahalli'
            },
            participants: [
                { id: 'p2', role: 'DRIVER', user: { displayName: 'Sneha R.', photoUrl: null } }
            ]
        },
        {
            id: 'demo-ride-003',
            type: 'SHARED_CAB',
            status: 'ACTIVE',
            destinationName: 'MG Road',
            destinationAddress: 'Trinity Circle, MG Road, Bangalore',
            departureTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            availableSeats: 1,
            totalSeats: 3,
            user: {
                id: 'user-003',
                displayName: 'Akash P.',
                photoUrl: null,
                trustScore: 4.5,
                totalRides: 18
            },
            building: {
                name: 'Prestige Tech Park',
                area: 'Marathahalli'
            },
            participants: [
                { id: 'p3', role: 'DRIVER', user: { displayName: 'Akash P.', photoUrl: null } },
                { id: 'p4', role: 'PASSENGER', user: { displayName: 'Neha K.', photoUrl: null } }
            ]
        }
    ]

    return { success: true, rides: DEMO_RIDES }
}
