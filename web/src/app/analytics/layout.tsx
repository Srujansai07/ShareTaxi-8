import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'

export default async function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    return <>{children}</>
}
