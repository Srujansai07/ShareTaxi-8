'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users, DollarSign, Navigation } from 'lucide-react'
import { formatDate, formatCurrency, getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface RideCardProps {
    ride: {
        id: string
        destinationName: string
        departureTime: Date | string
        type: string
        availableSeats: number
        costPerPerson?: number
        status: string
        user: {
            displayName: string
            photoUrl?: string
            trustScore: number
        }
        building: {
            name: string
            area: string
        }
    }
    showActions?: boolean
}

export function RideCard({ ride, showActions = true }: RideCardProps) {
    const router = useRouter()

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
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/rides/${ride.id}`)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* User Avatar */}
                        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                            {ride.user.photoUrl ? (
                                <img src={ride.user.photoUrl} alt={ride.user.displayName} className="h-12 w-12 rounded-full object-cover" />
                            ) : (
                                getInitials(ride.user.displayName)
                            )}
                        </div>

                        <div>
                            <p className="font-semibold">{ride.user.displayName}</p>
                            <p className="text-sm text-muted-foreground">
                                ⭐ {ride.user.trustScore.toFixed(1)} • {ride.building.name}
                            </p>
                        </div>
                    </div>

                    <Badge className={getStatusColor(ride.status)}>
                        {ride.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Destination */}
                <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                        <p className="font-medium">{ride.destinationName}</p>
                        <p className="text-sm text-muted-foreground">{ride.building.area}</p>
                    </div>
                </div>

                {/* Departure Time */}
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(ride.departureTime)}</span>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-lg">{getRideTypeIcon(ride.type)}</span>
                        <span className="text-muted-foreground">{ride.type.replace('_', ' ')}</span>
                    </div>

                    {ride.availableSeats > 0 && (
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{ride.availableSeats} seats</span>
                        </div>
                    )}

                    {ride.costPerPerson && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatCurrency(ride.costPerPerson)}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            {showActions && ride.status === 'ACTIVE' && (
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/rides/${ride.id}`)
                        }}
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        View Details
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
