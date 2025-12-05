import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Star, TrendingUp, Leaf } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface MatchCardProps {
    match: any
    onAccept?: () => void
    onDecline?: () => void
}

export function MatchCard({ match, onAccept, onDecline }: MatchCardProps) {
    const getConfidenceColor = (confidence: string) => {
        const colors: Record<string, string> = {
            HIGH: 'bg-green-500',
            MEDIUM: 'bg-yellow-500',
            LOW: 'bg-gray-500'
        }
        return colors[confidence] || 'bg-gray-500'
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
                            {match.user?.displayName?.[0] || 'U'}
                        </div>
                        <div>
                            <CardTitle className="text-base">{match.user?.displayName}</CardTitle>
                            <CardDescription className="text-sm">
                                {match.user?.building?.flatNumber && `Flat ${match.user.building.flatNumber}`}
                                {match.user?.building?.tower && `, ${match.user.building.tower}`}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge className={getConfidenceColor(match.confidence)}>
                        {match.score ? `${(match.score * 100).toFixed(0)}%` : match.confidence}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Destination */}
                <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                        <p className="font-medium">{match.ride?.destinationName}</p>
                        <p className="text-muted-foreground text-xs">
                            {match.destinationDistance ? `${(match.destinationDistance / 1000).toFixed(1)} km from your destination` : 'Same destination'}
                        </p>
                    </div>
                </div>

                {/* Timing */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                        {match.ride?.departureTime ? formatDate(match.ride.departureTime) : 'Similar time'}
                        {match.timeDifference && ` (${match.timeDifference} min difference)`}
                    </span>
                </div>

                {/* Trust Score */}
                <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{match.user?.trustScore?.toFixed(1) || '5.0'} Trust Score</span>
                    <span className="text-muted-foreground">• {match.user?.totalRides || 0} rides</span>
                </div>

                {/* Benefits */}
                {(match.estimatedSavings || match.co2Reduction) && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        {match.estimatedSavings && (
                            <div className="flex items-center gap-1 text-xs">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span className="text-green-600 font-medium">
                                    Save {formatCurrency(match.estimatedSavings)}
                                </span>
                            </div>
                        )}
                        {match.co2Reduction && (
                            <div className="flex items-center gap-1 text-xs">
                                <Leaf className="h-3 w-3 text-blue-600" />
                                <span className="text-blue-600 font-medium">
                                    {match.co2Reduction.toFixed(1)} kg CO₂
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                {(onAccept || onDecline) && (
                    <div className="flex gap-2 pt-2">
                        {onAccept && (
                            <Button onClick={onAccept} className="flex-1">
                                I'm Interested
                            </Button>
                        )}
                        {onDecline && (
                            <Button onClick={onDecline} variant="outline" className="flex-1">
                                Not Now
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
