import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
        }
    },
    usePathname() {
        return '/'
    },
    useSearchParams() {
        return new URLSearchParams()
    },
}))

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        auth: {
            signInWithOtp: jest.fn(),
            verifyOtp: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
        },
        storage: {
            from: jest.fn(() => ({
                upload: jest.fn(),
                getPublicUrl: jest.fn(),
            })),
        },
    })),
}))

// Mock Google Maps
global.google = {
    maps: {
        Map: jest.fn(),
        Marker: jest.fn(),
        DirectionsService: jest.fn(),
        DirectionsRenderer: jest.fn(),
        Geocoder: jest.fn(),
        TravelMode: {
            DRIVING: 'DRIVING',
        },
    },
} as any

// Mock geolocation
global.navigator.geolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
} as any
