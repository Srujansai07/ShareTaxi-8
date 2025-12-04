import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { getRideDetails } from '@/app/actions/rides'
import { getMatches } from '@/lib/matching/algorithm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MatchCard } from '@/components/MatchCard'
import { MapPin, Clock, Users, DollarSign, MessageCircle, Navigation, AlertCircle } from 'lucide-react'
import { formatDate, formatCurrency, getInitials } from '@/lib/utils'
import Link from 'next/link'

export default async function RideDetailsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const rideResult = await getRideDetails(params.id)

    if (!rideResult.success || !rideResult.ride) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Ride not found</h3>
                        <Link href="/dashboard">
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const ride = rideResult.ride
    const matchesResult = await getMatches(params.id)
    const matches = matchesResult.success ? matchesResult.matches : []

    const getRideTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            OWN_CAR: '🚗',
            SHARED_CAB: '🚖',
            PUBLIC_TRANSPORT: '🚌',
            WALKING: '🚶',
            CYCLING: '🚴',
            TWO_WHEELER: '🛵'
        }
        return icons[type] || '🚗'
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-green-500',
            IN_PROGRESS: 'bg-blue-500',
            COMPLETED: 'bg-gray-500',
            CANCELLED: 'bg-red-500'
        }
        return colors[status] || 'bg-gray-500'
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Ride Details</h1>
                    <p className="text-muted-foreground">View and manage your ride</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Ride Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xl">
                                        {ride.user.photoUrl ? (
                                            <img src={ride.user.photoUrl} alt={ride.user.displayName} className="h-16 w-16 rounded-full object-cover" />
                                        ) : (
                                            getInitials(ride.user.displayName)
                                        )}
                                    </div>

                                    <div>
                                        <CardTitle>{ride.user.displayName}</CardTitle>
                                        <CardDescription>
                                            ⭐ {ride.user.trustScore.toFixed(1)} • {ride.user.totalRides} rides
                                        </CardDescription>
                                    </div>
                                </div>

                                <Badge className={getStatusColor(ride.status)}>
                            </div>

                            {/* Timing */}
                            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                <Clock className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-semibold">Departure Time</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(ride.departureTime)}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                    <span className="text-2xl">{getRideTypeIcon(ride.type)}</span>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Type</p>
                                        <p className="font-semibold">{ride.type.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Available Seats</p>
                                        <p className="font-semibold">{ride.availableSeats}</p>
                                    </div>
                                </div>

                                {ride.costPerPerson && (
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg col-span-2">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Cost Per Person</p>
                                            <p className="font-semibold">{formatCurrency(ride.costPerPerson)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Participants */}
                            {ride.participants && ride.participants.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Participants ({ride.participants.length})</h3>
                                    <div className="space-y-2">
                                        {ride.participants.map((participant: any) => (
                                            <div key={participant.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                                                    {participant.user.photoUrl ? (
                                                        <img src={participant.user.photoUrl} alt={participant.user.displayName} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        getInitials(participant.user.displayName)
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold">{participant.user.displayName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ⭐ {participant.user.trustScore.toFixed(1)} • {participant.role}
                                                    </p>
                                                </div>
                                                <Button size="sm" variant="outline">
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Chat
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Map Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Navigation className="h-5 w-5" />
                                Route Map
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground">Map integration coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                ) : (
                <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No matches yet</p>
                </div>
                            )}
            </CardContent>
        </Card>
                </div >
            </div >
        </div >
    )
}
