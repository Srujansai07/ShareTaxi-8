import { getActiveRides, getRideHistory } from '@/app/actions/rides'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Users, IndianRupee, History, Car } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function RidesPage({
    searchParams
}: {
    searchParams: { view?: string }
}) {
    const isHistory = searchParams.view === 'history'
    const { success, rides } = isHistory ? await getRideHistory() : await getActiveRides()

    if (!success) {
        redirect('/login')
    }

    return (
        <div className="container mx-auto p-6 space-y-6 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">My Rides</h1>
                    <p className="text-muted-foreground">
                        {isHistory ? 'Past trips and completed rides' : 'Upcoming and active rides'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/rides?view=active">
                        <Button variant={!isHistory ? 'default' : 'outline'} size="sm">
                            <Car className="h-4 w-4 mr-2" />
                            Active
                        </Button>
                    </Link>
                    <Link href="/rides?view=history">
                        <Button variant={isHistory ? 'default' : 'outline'} size="sm">
                            <History className="h-4 w-4 mr-2" />
                            History
                        </Button>
                    </Link>
                    <Link href="/rides/create">
                        <Button size="sm" className="ml-2">Create New Ride</Button>
                    </Link>
                </div>
            </div>

            {rides && rides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rides.map((ride: any) => (
                        <Link key={ride.id} href={`/rides/${ride.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={ride.user.id === 'mock-user-id' ? 'default' : 'secondary'}>
                                            {ride.user.id === 'mock-user-id' ? 'Driving' : 'Passenger'}
                                        </Badge>
                                        {isHistory && (
                                            <Badge variant="outline" className="ml-2">
                                                {ride.status}
                                            </Badge>
                                        )}
                                        <div className="flex items-center gap-1 font-semibold text-green-600 ml-auto">
                                            <IndianRupee className="h-4 w-4" />
                                            <span>{ride.costPerPerson}</span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{ride.destinationName}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mt-0.5" />
                                        <span className="line-clamp-1">{ride.destinationAddress}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{new Date(ride.departureTime).toLocaleDateString()}</span>
                                        </div>
                                        {!isHistory && (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{ride.availableSeats} seats left</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        {isHistory ? (
                            <History className="h-16 w-16 text-muted-foreground mb-4" />
                        ) : (
                            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
                        )}
                        <h3 className="text-xl font-semibold mb-2">
                            {isHistory ? 'No past rides' : 'No active rides'}
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                            {isHistory
                                ? "You haven't completed any rides yet."
                                : "You don't have any upcoming rides scheduled."}
                        </p>
                        {!isHistory && (
                            <Link href="/rides/create">
                                <Button>Create a Ride</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
