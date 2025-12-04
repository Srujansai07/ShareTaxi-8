import { RideCreationForm } from '@/components/RideCreationForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'

export default async function CreateRidePage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Create a Ride</h1>
                    <p className="text-muted-foreground">
                        Share your journey and connect with neighbors going the same way
                    </p>
                </div>

                <RideCreationForm />
            </div>
        </div>
    )
}
