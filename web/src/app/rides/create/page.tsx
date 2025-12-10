'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createRide } from '@/app/actions/rides'
import { toast } from 'sonner'
import { MapPin, Clock, Users, DollarSign, Car, Bike, Bus, PersonStanding, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Location {
    name: string
    address: string
    lat: number
    lng: number
    placeId?: string
}

export default function CreateRidePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [destination, setDestination] = useState<Location | null>(null)
    const [formData, setFormData] = useState({
        type: 'OWN_CAR',
        departureTime: '',
        flexibilityMinutes: 15,
        totalSeats: 2,
        costSharingEnabled: true,
        estimatedCost: '',
        genderPreference: 'ANY',
        maxDetourKm: 1.0,
        purpose: '',
        notes: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!destination) {
            toast.error('Please select a destination')
            return
        }

        setIsLoading(true)

        const data = new FormData()
        data.append('type', formData.type)
        data.append('destinationName', destination.name)
        data.append('destinationAddress', destination.address)
        data.append('destinationLat', destination.lat.toString())
        data.append('destinationLng', destination.lng.toString())
        if (destination.placeId) {
            data.append('destinationPlaceId', destination.placeId)
        }
        data.append('departureTime', formData.departureTime)
        data.append('flexibilityMinutes', formData.flexibilityMinutes.toString())
        data.append('totalSeats', formData.totalSeats.toString())
        data.append('costSharingEnabled', formData.costSharingEnabled.toString())
        if (formData.estimatedCost) {
            data.append('estimatedCost', formData.estimatedCost)
        }
        data.append('genderPreference', formData.genderPreference)
        data.append('maxDetourKm', formData.maxDetourKm.toString())
        if (formData.purpose) {
            data.append('purpose', formData.purpose)
        }
        if (formData.notes) {
            data.append('notes', formData.notes)
        }

        const result = await createRide(data)

        setIsLoading(false)

        if (result.success) {
            toast.success('Ride created! Looking for matches...')
            router.push(`/rides/${result.rideId}`)
        } else {
            toast.error(result.error || 'Failed to create ride')
        }
    }

    const rideTypes = [
        { value: 'OWN_CAR', label: '🚗 Own Car', icon: Car },
        { value: 'SHARED_CAB', label: '🚖 Shared Cab', icon: Car },
        { value: 'PUBLIC_TRANSPORT', label: '🚌 Public Transport', icon: Bus },
        { value: 'TWO_WHEELER', label: '🛵 Two Wheeler', icon: Bike },
        { value: 'WALKING', label: '🚶 Walking', icon: PersonStanding },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="gradient-hero border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="container-app py-8">
                    <div className="animate-fade-up">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Car className="h-6 w-6 text-white" />
                            </div>
                            Create a Ride
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Share your ride and find neighbors going the same way
                        </p>
                    </div>
                </div>
            </div>

            <div className="container-app py-8">
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 animate-fade-up stagger-1">
                    <Card className="glass-card border-0">
                        <CardHeader>
                            <CardTitle>Where are you going?</CardTitle>
                            <CardDescription>Enter your destination details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Destination Search */}
                            <div className="space-y-2">
                                <Label htmlFor="destination">Destination</Label>
                                <Input
                                    id="destination"
                                    placeholder="Search for a place..."
                                    value={destination?.name || ''}
                                    onChange={(e) => {
                                        // Simple mock for now - in production use Google Places API
                                        if (e.target.value) {
                                            setDestination({
                                                name: e.target.value,
                                                address: e.target.value,
                                                lat: 12.9716,
                                                lng: 77.5946
                                            })
                                        }
                                    }}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Start typing to search for locations
                                </p>
                            </div>

                            {/* Departure Time */}
                            <div className="space-y-2">
                                <Label htmlFor="departureTime">When are you leaving?</Label>
                                <Input
                                    id="departureTime"
                                    type="datetime-local"
                                    value={formData.departureTime}
                                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ride Details</CardTitle>
                            <CardDescription>How are you traveling?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Ride Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Ride Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rideTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Seats (if applicable) */}
                            {(formData.type === 'OWN_CAR' || formData.type === 'SHARED_CAB' || formData.type === 'TWO_WHEELER') && (
                                <div className="space-y-2">
                                    <Label htmlFor="seats">Available Seats</Label>
                                    <Select
                                        value={formData.totalSeats.toString()}
                                        onValueChange={(value) => setFormData({ ...formData, totalSeats: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                                <SelectItem key={num} value={num.toString()}>
                                                    {num} {num === 1 ? 'seat' : 'seats'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Cost Sharing */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label htmlFor="costSharing" className="text-base">Cost Sharing</Label>
                                    <p className="text-sm text-muted-foreground">Split the ride cost with others</p>
                                </div>
                                <Switch
                                    id="costSharing"
                                    checked={formData.costSharingEnabled}
                                    onCheckedChange={(checked) => setFormData({ ...formData, costSharingEnabled: checked })}
                                />
                            </div>

                            {formData.costSharingEnabled && (
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Estimated Cost (₹)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        placeholder="250"
                                        value={formData.estimatedCost}
                                        onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        This will be split equally among all riders
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>Set your ride preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Gender Preference */}
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender Preference</Label>
                                <Select
                                    value={formData.genderPreference}
                                    onValueChange={(value) => setFormData({ ...formData, genderPreference: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ANY">Any</SelectItem>
                                        <SelectItem value="SAME_GENDER">Same Gender Only</SelectItem>
                                        <SelectItem value="MALE">Male Only</SelectItem>
                                        <SelectItem value="FEMALE">Female Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Max Detour */}
                            <div className="space-y-2">
                                <Label htmlFor="detour">Maximum Detour (km)</Label>
                                <Select
                                    value={formData.maxDetourKm.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, maxDetourKm: parseFloat(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0.5">0.5 km</SelectItem>
                                        <SelectItem value="1.0">1 km</SelectItem>
                                        <SelectItem value="2.0">2 km</SelectItem>
                                        <SelectItem value="3.0">3 km</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Any specific details about the ride..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isLoading || !destination}
                    >
                        {isLoading ? 'Creating Ride...' : 'Create Ride & Find Matches'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
