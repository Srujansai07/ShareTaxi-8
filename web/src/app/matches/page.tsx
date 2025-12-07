import { redirect } from 'next/navigation'
import { getMatches } from '@/app/actions/matches'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MatchCard } from '@/components/rides/MatchCard'
import { Users, Filter } from 'lucide-react'
import Link from 'next/link'

export default async function MatchesPage() {
    const { success, matches } = await getMatches()

    if (!success) {
        redirect('/login')
    }

    return (
        <div className="container mx-auto p-6 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Ride Matches</h1>
                    <p className="text-muted-foreground">
                        {matches?.length || 0} potential matches found
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
