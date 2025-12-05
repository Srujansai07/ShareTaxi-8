'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LiveLocationTrackerProps {
    rideId: string
    onLocationUpdate?: (location: { latitude: number; longitude: number }) => void
}

export function LiveLocationTracker({ rideId, onLocationUpdate }: LiveLocationTrackerProps) {
    const [isTracking, setIsTracking] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [watchId, setWatchId] = useState<number | null>(null)

    const startTracking = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
                setCurrentLocation(location)
                onLocationUpdate?.(location)

                // In production, send location to server
                // updateRideLocation(rideId, location)
            },
            (error) => {
                console.error('Location error:', error)
                toast.error('Failed to get location')
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
            }
        )

        setWatchId(id)
        setIsTracking(true)
        toast.success('Live location tracking started')
    }

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
            setWatchId(null)
            setIsTracking(false)
            toast.success('Live location tracking stopped')
        }
    }

    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [watchId])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Live Location Tracking
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentLocation && (
                    <div className="text-sm text-muted-foreground">
                        <p>Latitude: {currentLocation.latitude.toFixed(6)}</p>
                        <p>Longitude: {currentLocation.longitude.toFixed(6)}</p>
                    </div>
                )}

                {isTracking ? (
                    <Button onClick={stopTracking} variant="outline" className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        Stop Tracking
                    </Button>
                ) : (
                    <Button onClick={startTracking} className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        Start Live Tracking
                    </Button>
                )}

                {isTracking && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Tracking active</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
