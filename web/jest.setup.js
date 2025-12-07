require('@testing-library/jest-dom')

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
    redirect: jest.fn(),
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
    cookies: jest.fn(() => ({
        get: jest.fn(),
        getAll: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
    })),
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
}

// Mock geolocation
global.navigator.geolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
}

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        message: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
        ride: {
            findUnique: jest.fn(),
        },
    },
}))

// Mock Supabase Server Client
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        auth: {
            signInWithOtp: jest.fn(),
            verifyOtp: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
            getUser: jest.fn(() => ({
                data: {
                    user: {
                        id: 'user123',
                        phone: '+919876543210',
                    }
                }
            })),
        },
    })),
}))
