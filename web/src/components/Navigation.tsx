'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Car, Users, User, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export function Navigation() {
    const pathname = usePathname()

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/rides/create', label: 'Create Ride', icon: Car },
        { href: '/matches', label: 'Matches', icon: Users },
        { href: '/profile', label: 'Profile', icon: User },
    ]

    const isActive = (href: string) => pathname === href

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="text-2xl">🚗</span>
                        <span className="font-bold text-xl">ShareTaxi</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive(item.href) ? 'default' : 'ghost'}
                                        className="gap-2"
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Logout */}
                    <form action={logout}>
                        <Button variant="outline" size="sm">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </form>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex items-center justify-around pb-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive(item.href) ? 'default' : 'ghost'}
                                    size="sm"
                                    className="flex-col h-auto py-2"
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-xs mt-1">{item.label}</span>
                                </Button>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
