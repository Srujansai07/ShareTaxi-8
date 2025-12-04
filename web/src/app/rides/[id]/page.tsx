import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function RideDetailsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Ride Details</h1>
                    <p className="text-muted-foreground">Ride ID: {params.id}</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ride Information</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground text-center mb-4">
                        Ride details page is under construction
                    </p>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
