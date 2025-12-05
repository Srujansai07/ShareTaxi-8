'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, MapPin, Loader2 } from 'lucide-react'
import { triggerSOS, resolveSOS } from '@/app/actions/sos'
import { toast } from 'sonner'

interface SOSButtonProps {
    rideId: string
    activeSosId?: string | null
}

export function SOSButton({ rideId, activeSosId }: SOSButtonProps) {
    const [isTriggering, setIsTriggering] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [message, setMessage] = useState('')
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

    const getLocation = () => {
        return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    })
                },
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 10000 }
            )
        })
    }

    const handleTriggerSOS = async () => {
        try {
            setIsTriggering(true)

            // Get current location
            const currentLocation = await getLocation()
            setLocation(currentLocation)

            const formData = new FormData()
            formData.append('rideId', rideId)
            formData.append('location', JSON.stringify(currentLocation))
            if (message.trim()) {
                formData.append('message', message.trim())
            }

            const result = await triggerSOS(formData)

            if (result.success) {
                toast.success('SOS alert sent to all participants and emergency contacts!')
                setShowConfirm(false)
                setMessage('')
            } else {
                toast.error(result.error || 'Failed to send SOS alert')
            }
        } catch (error) {
            toast.error('Failed to get location. Please enable location services.')
        } finally {
            setIsTriggering(false)
        }
    }

    const handleResolveSOS = async () => {
        if (!activeSosId) return

        const result = await resolveSOS(activeSosId)

        if (result.success) {
            toast.success('SOS alert resolved')
        } else {
            toast.error(result.error || 'Failed to resolve SOS alert')
        }
    }

    if (activeSosId) {
        return (
            <Card className="border-red-500 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        SOS Alert Active
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-600 mb-4">
                        Emergency alert is active. All participants and emergency contacts have been notified.
                    </p>
                    <Button onClick={handleResolveSOS} variant="outline" className="w-full">
                        Mark as Resolved
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (showConfirm) {
        return (
            <Card className="border-orange-500">
                <CardHeader>
                    <CardTitle className="text-orange-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm SOS Alert
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This will send an emergency alert to all ride participants and your emergency contacts with your current location.
                    </p>

                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Optional message (e.g., 'Need immediate help')"
                        maxLength={500}
                        rows={3}
                    />

                    <div className="flex gap-2">
                        <Button
                            onClick={handleTriggerSOS}
                            disabled={isTriggering}
                            variant="destructive"
                            className="flex-1"
                        >
                            {isTriggering ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending Alert...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Send SOS Alert
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => {
                                setShowConfirm(false)
                                setMessage('')
                            }}
                            variant="outline"
                            disabled={isTriggering}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Button
            onClick={() => setShowConfirm(true)}
            variant="destructive"
            className="w-full"
            size="lg"
        >
            <AlertTriangle className="h-5 w-5 mr-2" />
            SOS Emergency Alert
        </Button>
    )
}
