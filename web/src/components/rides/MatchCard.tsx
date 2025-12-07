import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Calendar, Star, IndianRupee } from 'lucide-react'

interface MatchCardProps {
    match: {
        id: string
        score: number
        ride: {
            id: string
            destinationName: string
            destinationAddress: string
            departureTime: Date
            costPerPerson: number
            user: {
                displayName: string
                photoUrl: string | null
                trustScore: number
                totalRides: number
            }
        }
    }
}

export function MatchCard({ match }: MatchCardProps) {
    const { ride } = match

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <Avatar>
                            <AvatarImage src={ride.user.photoUrl || ''} />
                            <AvatarFallback>{ride.user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold">{ride.user.displayName}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{ride.user.trustScore}</span>
                                <span className="text-xs">• {ride.user.totalRides} rides</span>
                            </div>
                        </div>
                    </div>
                    <Badge variant={match.score > 90 ? 'default' : 'secondary'}>
                        {match.score}% Match
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2 space-y-3">
                <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">{ride.destinationName}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{ride.destinationAddress}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-green-600">
                        <IndianRupee className="h-4 w-4" />
                        <span>{ride.costPerPerson}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full">Request to Join</Button>
            </CardFooter>
        </Card>
    )
}
