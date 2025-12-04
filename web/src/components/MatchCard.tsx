'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, TrendingUp, Leaf } from 'lucide-react'
import { formatDistance } from '@/lib/utils/geo'
import { formatCurrency, getInitials } from '@/lib/utils'
import { joinRide } from '@/app/actions/rides'
import { toast } from 'sonner'
import { useState } from 'react'

interface MatchCardProps {
    match: {
        id: string
        score: number
        confidence: string
        destinationDistance: number
        timeDifference: number
        estimatedSavings?: number
        co2Reduction?: number
        reasons: string[]
        sourceRide: {
            id: string
            destinationName: string
            departureTime: Date | string
            type: string
            user: {
                displayName: string
                photoUrl?: string
                trustScore: number
                totalRides: number
            }
            building: {
                name: string
            }
        }
    }
}

export function MatchCard({ match }: MatchCardProps) {
    const [isLoading, setIsLoading] = useState(false)

    const getConfidenceColor = (confidence: string) => {
        const colors: Record<string, string> = {
            HIGH: 'bg-green-500',
            MEDIUM: 'bg-yellow-500',
            LOW: 'bg-orange-500'
        }
        return colors[confidence] || 'bg-gray-500'
    }

    const getReasonText = (reason: string) => {
        const texts: Record<string, string> = {
            destination_proximity: '📍 Very close destination',
            time_match: '⏰ Perfect timing',
            high_trust_score: '⭐ Highly rated',
            same_destination: '🎯 Same destination',
            perfect_timing: '✨ Exact time match'
        }
        return texts[reason] || reason
    }

    const handleJoinRide = async () => {
        setIsLoading(true)
        const result = await joinRide(match.sourceRide.id, match.id)
        setIsLoading(false)

        if (result.success) {
            toast.success('Successfully joined the ride!')
        } else {
            toast.error(result.error || 'Failed to join ride')
        }
    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* User Avatar */}
                        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                            {match.sourceRide.user.photoUrl ? (
                                <img
                                    src={match.sourceRide.user.photoUrl}
                                    alt={match.sourceRide.user.displayName}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                getInitials(match.sourceRide.user.displayName)
                            )}
                        </div>

                        <div>
                            <p className="font-semibold">{match.sourceRide.user.displayName}</p>
                            <p className="text-sm text-muted-foreground">
                                ⭐ {match.sourceRide.user.trustScore.toFixed(1)} • {match.sourceRide.user.totalRides} rides
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <Badge className={getConfidenceColor(match.confidence)}>
                            {match.score.toFixed(0)}% Match
                        </Badge>
                        <span className="text-xs text-muted-foreground">{match.confidence}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Destination */}
                <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                        <p className="font-medium">{match.sourceRide.destinationName}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatDistance(match.destinationDistance)} from your destination
                        </p>
                    </div>
                </div>

                {/* Timing */}
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{match.timeDifference} min time difference</span>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                    {match.estimatedSavings && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-xs text-muted-foreground">Save</p>
                                <p className="font-semibold text-green-600">{formatCurrency(match.estimatedSavings)}</p>
                            </div>
                        </div>
                    )}

                    {match.co2Reduction && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                            <Leaf className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                                <p className="font-semibold text-blue-600">{match.co2Reduction.toFixed(1)} kg</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Match Reasons */}
                {match.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                        {match.reasons.map((reason) => (
                            <Badge key={reason} variant="outline" className="text-xs">
                                {getReasonText(reason)}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="gap-2">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`/rides/${match.sourceRide.id}`, '_blank')}
                >
                    View Details
                </Button>
                <Button
                    className="flex-1"
                    onClick={handleJoinRide}
                    disabled={isLoading}
                >
                    {isLoading ? 'Joining...' : "I'm Interested"}
                </Button>
            </CardFooter>
        </Card>
    )
}
