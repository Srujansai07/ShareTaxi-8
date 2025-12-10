// middleware.ts - Auth Middleware for Route Protection
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/rides',
    '/profile',
    '/chat',
    '/settings',
    '/matches'
]

// Routes that require NO authentication (redirect if logged in)
const AUTH_ROUTES = [
    '/login',
    '/register'
]

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    // Create Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    res.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    res.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const pathname = req.nextUrl.pathname

    // Refresh session
    const { data: { session } } = await supabase.auth.getSession()

    // Check if current path matches protected routes
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    // Check if current path is auth route
    const isAuthRoute = AUTH_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    // Not logged in, trying to access protected route
    if (!session && isProtectedRoute) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Logged in, trying to access auth routes
    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (handled separately)
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
}
