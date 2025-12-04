import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { getActiveRides } from '@/app/actions/rides'
import { MatchCard } from '@/components/MatchCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function MatchesPage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    // Get all active rides to find matches
    const ridesResult = await getActiveRides()
    const rides = ridesResult.success ? ridesResult.rides : []

    // In a real implementation, we'd fetch all matches for the user
    // For now, we'll show a placeholder
    const allMatches: any[] = []

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Your Matches</h1>
                    <p className="text-muted-foreground">
                        Neighbors going the same way as you
                    </p>
                </div>
                <Link href="/rides/create">
                    <Button>
                        <Plus className="h-5 w-5 mr-2" />
                        Create Ride
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option>All Matches</option>
                            <option>High Confidence</option>
                            <option>Medium Confidence</option>
                            <option>Low Confidence</option>
                        </select>

                        <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option>Sort by: Best Match</option>
                            <option>Sort by: Time</option>
                            <option>Sort by: Distance</option>
                            <option>Sort by: Savings</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Matches Grid */}
            {allMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Users className="h-20 w-20 text-muted-foreground mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">No matches yet</h3>
                        <p className="text-muted-foreground text-center mb-6 max-w-md">
                            Create a ride to start finding neighbors going the same way. Our smart matching algorithm will find the best matches for you!
                        </p>
                        <Link href="/rides/create">
                            <Button size="lg">
                                <Plus className="h-5 w-5 mr-2" />
                                Create Your First Ride
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">How Matching Works</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>We match you with neighbors going to similar destinations (within 2km)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Departure times are matched within a 30-minute window</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Match scores are based on destination proximity, timing, and trust scores</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>You'll see estimated savings and environmental impact for each match</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
