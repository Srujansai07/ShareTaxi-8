import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { MobileShell } from '@/components/layout/MobileShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ShareTaxi - Hyper-Local Carpool & Meetup',
    description: 'Connect with neighbors going to the same destination',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <MobileShell>
                    {children}
                </MobileShell>
                <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold text-center py-1 z-50 opacity-90">
                    MOCK MODE: Database Disconnected • UI Demo Only
                </div>
                <Toaster />
            </body>
        </html>
    )
}
