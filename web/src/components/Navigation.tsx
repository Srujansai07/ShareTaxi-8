'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Users, User, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const links = [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/matches', label: 'Matches', icon: Users },
        { href: '/rides/create', label: 'Create', icon: Plus },
        { href: '/chat', label: 'Chat', icon: MessageCircle },
        { href: '/profile', label: 'Profile', icon: User },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
            <div className="flex items-center justify-around h-16">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/')

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5",
                                link.label === 'Create' && "h-6 w-6"
                            )} />
                            <span className="text-xs">{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

export function TopNav() {
    return (
        <nav className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        S
                    </div>
                    <span className="font-bold text-xl">ShareTaxi</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/matches" className="text-sm font-medium hover:text-primary transition-colors">
                        Matches
                    </Link>
                    <Link href="/rides/create" className="text-sm font-medium hover:text-primary transition-colors">
                        Create Ride
                    </Link>
                    <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                        Profile
                    </Link>
                </div>
            </div>
        </nav>
    )
}
