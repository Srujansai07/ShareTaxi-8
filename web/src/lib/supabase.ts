import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

// Database Types
export interface User {
    id: string
    phone: string
    name: string
    building_id: string
    photo_url?: string
    created_at: string
}

export interface Building {
    id: string
    name: string
    address: string
    location: {
        lat: number
        lng: number
    }
    verified: boolean
}

export interface Trip {
    id: string
    user_id: string
    destination_name: string
    destination_location: {
        lat: number
        lng: number
    }
    departure_time: string
    status: 'active' | 'completed' | 'cancelled'
    created_at: string
}

export interface Match {
    id: string
    trip_id_1: string
    trip_id_2: string
    status: 'pending' | 'accepted' | 'declined'
    created_at: string
}
