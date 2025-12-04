'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createRide } from '@/app/actions/rides'
import { toast } from 'sonner'
import { MapPin, Clock, Users, Car, DollarSign } from 'lucide-react'

interface Location {
    name: string
    address: string
    lat: number
    lng: number
    placeId?: string
}

export function RideCreationForm() {
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
        allowSmoking: false,
        allowPets: false,
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
        data.append('allowSmoking', formData.allowSmoking.toString())
        data.append('allowPets', formData.allowPets.toString())
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

    // Get minimum datetime (now)
    const getMinDateTime = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() + 5) // At least 5 minutes from now
        return now.toISOString().slice(0, 16)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Where are you going?
                    </CardTitle>
                    <CardDescription>
                        Enter your destination and we'll find neighbors going the same way
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Destination Input - Simplified for now */}
                    <div className="space-y-2">
                        <Label htmlFor="destination">Destination</Label>
                        <Input
                            id="destination"
                            placeholder="Search for a place..."
                            onChange={(e) => {
                                // Simplified - in production, integrate Google Places Autocomplete
                                if (e.target.value) {
                                    setDestination({
                                        name: e.target.value,
                                        address: e.target.value,
                                        lat: 12.9716, // Default Bangalore coords
                                        lng: 77.5946
                                    })
                                }
                            }}
                            required
                        />
                    </div>

                    {/* Ride Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Ride Type</Label>
                        <select
                            id="type"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="OWN_CAR">🚗 Own Car</option>
                            <option value="SHARED_CAB">🚖 Shared Cab</option>
                            <option value="PUBLIC_TRANSPORT">🚌 Public Transport</option>
                            <option value="WALKING">🚶 Walking</option>
                            <option value="CYCLING">🚴 Cycling</option>
                            <option value="TWO_WHEELER">🛵 Two Wheeler</option>
                        </select>
                    </div>

                    {/* Departure Time */}
                    <div className="space-y-2">
                        <Label htmlFor="departureTime" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            When are you leaving?
                        </Label>
                        <Input
                            id="departureTime"
                            type="datetime-local"
                            value={formData.departureTime}
                            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                            required
                            min={getMinDateTime()}
                        />
                    </div>

                    {/* Seats (if applicable) */}
                    {(formData.type === 'OWN_CAR' || formData.type === 'SHARED_CAB' || formData.type === 'TWO_WHEELER') && (
                        <div className="space-y-2">
                            <Label htmlFor="seats" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Available Seats
                            </Label>
                            <select
                                id="seats"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.totalSeats}
                                onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <option key={num} value={num}>
                                        {num} {num === 1 ? 'seat' : 'seats'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Cost Sharing */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="costSharing"
                                checked={formData.costSharingEnabled}
                                onChange={(e) => setFormData({ ...formData, costSharingEnabled: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="costSharing" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Enable Cost Sharing
                            </Label>
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
                            </div>
                        )}
                    </div>

                    {/* Gender Preference */}
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender Preference</Label>
                        <select
                            id="gender"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.genderPreference}
                            onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                        >
                            <option value="ANY">Any</option>
                            <option value="SAME_GENDER">Same Gender Only</option>
                            <option value="MALE">Male Only</option>
                            <option value="FEMALE">Female Only</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any specific details..."
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
                disabled={isLoading || !destination}
                size="lg"
            >
                {isLoading ? 'Creating...' : 'Create Ride & Find Matches'}
            </Button>
        </form>
    )
}
