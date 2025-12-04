'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { triggerSOS } from '@/app/actions/safety'
import { toast } from 'sonner'

interface SOSButtonProps {
    rideId?: string
    className?: string
}

export function SOSButton({ rideId, className }: SOSButtonProps) {
    const [isPressed, setIsPressed] = useState(false)
    const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)

    const handleMouseDown = () => {
        setIsPressed(true)
        const timer = setTimeout(async () => {
            // Trigger SOS after 3 seconds
            await handleSOS()
        }, 3000)
        setPressTimer(timer)
    }

    const handleMouseUp = () => {
        setIsPressed(false)
        if (pressTimer) {
            clearTimeout(pressTimer)
            setPressTimer(null)
        }
    }

    const handleSOS = async () => {
        // Get current location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const formData = new FormData()
                if (rideId) {
                    formData.append('rideId', rideId)
                }
                formData.append('latitude', position.coords.latitude.toString())
                formData.append('longitude', position.coords.longitude.toString())
                formData.append('accuracy', position.coords.accuracy.toString())

                const result = await triggerSOS(formData)

                if (result.success) {
                    toast.success('Emergency contacts have been notified!')
                } else {
                    toast.error(result.error || 'Failed to send SOS')
                }
            }, (error) => {
                toast.error('Could not get your location. Please enable location services.')
            })
        } else {
            toast.error('Geolocation is not supported by your browser')
        }
    }

    return (
        <Button
            variant="destructive"
            size="lg"
            className={`relative ${className}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
        >
            <AlertTriangle className="h-5 w-5 mr-2" />
            {isPressed ? 'Hold to Activate...' : 'SOS Emergency'}
            {isPressed && (
                <div className="absolute inset-0 bg-red-600 opacity-50 animate-pulse rounded-md" />
            )}
        </Button>
    )
}

export function SOSCard() {
    return (
        <Card className="border-red-200 bg-red-50">
            <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Emergency SOS
                </CardTitle>
                <CardDescription className="text-red-700">
                    Hold the button for 3 seconds to activate emergency alert
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SOSButton className="w-full" />
                <p className="text-xs text-red-700 mt-4">
                    This will immediately notify your emergency contacts and our support team with your current location.
                </p>
            </CardContent>
        </Card>
    )
}
