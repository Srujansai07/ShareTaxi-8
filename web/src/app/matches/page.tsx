import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MatchCard } from '@/components/MatchCard'
import { Users, Filter } from 'lucide-react'
import Link from 'next/link'

export default async function MatchesPage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { phoneNumber: session.user.phone! }
    })

    if (!user) {
        redirect('/login')
    }

    // Get all matches for user's active rides
    const userRides = await prisma.ride.findMany({
        where: {
            userId: user.id,
            status: 'ACTIVE',
            expiresAt: { gt: new Date() }
        },
        select: { id: true }
    })

    const rideIds = userRides.map(r => r.id)

    const matches = await prisma.match.findMany({
        where: {
            sourceRideId: { in: rideIds },
            status: 'PENDING',
            expiresAt: { gt: new Date() }
        },
        include: {
            sourceRide: {
                select: {
                    id: true,
                    destinationName: true,
                    departureTime: true,
                    type: true
                }
            },
            user: {
                select: {
                    id: true,
                    displayName: true,
                    photoUrl: true,
                    trustScore: true,
                    totalRides: true,
                    building: {
                        select: {
                            flatNumber: true,
                            tower: true
                        }
                    }
                }
            }
        },
        orderBy: { score: 'desc' }
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Ride Matches</h1>
                    <p className="text-muted-foreground">
                        {matches.length} potential matches found
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Link href="/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>

            {/* Matches Grid */}
            {matches && matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Create a ride to start finding matches with neighbors
                        </p>
                        <Link href="/rides/create">
                            <Button>Create Your First Ride</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
