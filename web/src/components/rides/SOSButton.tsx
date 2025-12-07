'use client'

import { useState, useTransition } from 'react'
import { triggerSOS, cancelSOS } from '@/app/actions/safety'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Phone, X } from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function SOSButton({ rideId }: { rideId: string }) {
    const [isPending, startTransition] = useTransition()
    const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(null)

    const handleSOS = () => {
        startTransition(async () => {
            const result = await triggerSOS(rideId)
            if (result.success) {
                setActiveEmergencyId(result.emergencyId || null)
                toast.success(result.message, {
                    description: `Response time: ${result.estimatedResponseTime}`,
                    duration: 10000,
                })
            } else {
                toast.error('Failed to trigger SOS')
            }
        })
    }

    const handleCancel = () => {
        if (!activeEmergencyId) return

        startTransition(async () => {
            const result = await cancelSOS(activeEmergencyId)
            if (result.success) {
                setActiveEmergencyId(null)
                toast.info(result.message)
            } else {
                toast.error('Failed to cancel SOS')
            }
        })
    }

    if (activeEmergencyId) {
        return (
            <div className="flex flex-col gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                    <Phone className="h-5 w-5 animate-pulse" />
                    <span className="font-semibold">SOS Active</span>
                </div>
                <p className="text-sm text-red-600/80">
                    Emergency services have been notified. Help is on the way.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="border-red-300 text-red-600 hover:bg-red-100"
                >
                    <X className="h-4 w-4 mr-2" />
                    Cancel SOS (False Alarm)
                </Button>
            </div>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="lg"
                    className="w-full"
                    disabled={isPending}
                >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Emergency SOS
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Trigger Emergency SOS?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will immediately alert all ride participants and your emergency contacts.
                        Your current location will be shared. Only use in genuine emergencies.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSOS}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Confirm SOS
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
