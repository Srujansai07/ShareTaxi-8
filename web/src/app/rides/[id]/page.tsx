import { getRideDetails } from '@/app/actions/rides'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Calendar, Users, IndianRupee, Clock, Shield, MessageCircle, Navigation } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RideDetailsPage({ params }: { params: { id: string } }) {
    const { success, ride } = await getRideDetails(params.id)

    if (!success || !ride) {
        redirect('/rides')
    }

    return (
        <div className="container mx-auto p-6 space-y-6 pb-24">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Badge variant="outline">Ride #{ride.id.substring(0, 8)}</Badge>
                    <Badge className="bg-green-500">Active</Badge>
                </div>
                <h1 className="text-2xl font-bold">{ride.destinationName}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{ride.destinationAddress}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trip Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-medium">{new Date(ride.departureTime).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Time</p>
                                        <p className="font-medium">{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Seats</p>
                                        <p className="font-medium">{ride.availableSeats} available</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <IndianRupee className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cost</p>
                                        <p className="font-medium">₹{ride.costPerPerson} / person</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Participants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Driver */}
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={ride.user.photoUrl || ''} />
                                            <AvatarFallback>{ride.user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{ride.user.displayName}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Shield className="h-3 w-3 text-green-500" />
                                                <span>Driver • {ride.user.trustScore} Trust Score</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge>Host</Badge>
                                </div>

                                {/* Other Participants */}
                                {ride.participants && ride.participants.length > 0 ? (
                                    ride.participants.map((p: any) => (
                                        <div key={p.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={p.user.photoUrl || ''} />
                                                    <AvatarFallback>{p.user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{p.user.displayName}</p>
                                                    <p className="text-xs text-muted-foreground">Passenger</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No other passengers yet.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/chat" className="w-full">
                                <Button className="w-full" variant="default">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Open Chat
                                </Button>
                            </Link>
                            <Button className="w-full" variant="outline">
                                Share Ride Details
                            </Button>
                            <Button className="w-full" variant="destructive">
                                Cancel Ride
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Navigation className="h-5 w-5" />
                                Route Map
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground">Map integration coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
