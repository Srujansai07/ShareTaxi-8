'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Car, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        {
            label: 'Home',
            href: '/dashboard',
            icon: Home
        },
        {
            label: 'Rides',
            href: '/rides',
            icon: Car
        },
        {
            label: 'Chat',
            href: '/chat',
            icon: MessageCircle
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: User
        }
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
