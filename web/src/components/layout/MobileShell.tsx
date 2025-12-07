'use client'

import { BottomNav } from './BottomNav'

interface MobileShellProps {
    children: React.ReactNode
}

export function MobileShell({ children }: MobileShellProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1 pb-16">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}
