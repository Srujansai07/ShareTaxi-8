import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, DollarSign, Star } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface RideCardProps {
    ride: any
}

export function RideCard({ ride }: RideCardProps) {
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
        <Link href={`/rides/${ride.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{getRideTypeIcon(ride.type)}</span>
                            <div>
                                <CardTitle className="text-lg">{ride.destinationName}</CardTitle>
                                <CardDescription className="text-sm">
                                    {ride.building?.name}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge className={getStatusColor(ride.status)}>
                            {ride.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(ride.departureTime)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{ride.availableSeats} seats available</span>
                    </div>

                    {ride.costPerPerson && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(ride.costPerPerson)} per person</span>
                        </div>
                    )}

                    {ride.user && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                                {ride.user.displayName?.[0]}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{ride.user.displayName}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{ride.user.trustScore?.toFixed(1) || '5.0'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
