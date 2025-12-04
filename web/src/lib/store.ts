import { create } from 'zustand'
import { User, Trip } from './supabase'

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    setUser: (user: User | null) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false }),
}))

interface TripState {
    activeTrip: Trip | null
    matches: any[]
    setActiveTrip: (trip: Trip | null) => void
    setMatches: (matches: any[]) => void
    clearTrip: () => void
}

export const useTripStore = create<TripState>((set) => ({
    activeTrip: null,
    matches: [],
    setActiveTrip: (trip) => set({ activeTrip: trip }),
    setMatches: (matches) => set({ matches }),
    clearTrip: () => set({ activeTrip: null, matches: [] }),
}))
