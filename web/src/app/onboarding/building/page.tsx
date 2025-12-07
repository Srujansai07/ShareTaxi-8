'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { verifyBuilding } from '@/app/actions/auth'
import { toast } from 'sonner'
import { MapPin, Building2, Home } from 'lucide-react'

export default function BuildingOnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [useGPS, setUseGPS] = useState(false)
    const [formData, setFormData] = useState({
        buildingName: '',
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: 0,
        longitude: 0,
        tower: '',
        flatNumber: ''
    })

    const handleGetLocation = () => {
        setUseGPS(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    })
                    toast.success('Location detected!')
                },
                (error) => {
                    toast.error('Failed to get location. Please enter manually.')
                    setUseGPS(false)
                }
            )
        } else {
            toast.error('Geolocation is not supported by your browser')
            setUseGPS(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const data = new FormData(e.currentTarget)
        data.append('latitude', formData.latitude.toString())
        data.append('longitude', formData.longitude.toString())

        const result = await verifyBuilding(data)

        setIsLoading(false)

        if (result.success) {
            toast.success('Building verified! Welcome to ShareTaxi!')
            router.push('/dashboard')
        } else {
            toast.error(result.error || 'Failed to verify building')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Verify Your Building</CardTitle>
                    <CardDescription>
                        We need to verify your address to connect you with neighbors
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* GPS Detection */}
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Use GPS</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGetLocation}
                                    disabled={useGPS}
                                >
                                    {useGPS ? 'Location Detected' : 'Detect Location'}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                We'll use your location to find your building
                            </p>
                        </div>

                        {/* Building Name */}
                        <div className="space-y-2">
                            <Label htmlFor="buildingName">Building/Society Name *</Label>
                            <Input
                                id="buildingName"
                                name="buildingName"
                                placeholder="Prestige Tech Park"
                                value={formData.buildingName}
                                onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                                required
                            />
                        </div>

                        {/* Street */}
                        <div className="space-y-2">
                            <Label htmlFor="street">Street/Road *</Label>
                            <Input
                                id="street"
                                name="street"
                                placeholder="Kadubeesanahalli"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                required
                            />
                        </div>

                        {/* Area */}
                        <div className="space-y-2">
                            <Label htmlFor="area">Area/Locality *</Label>
                            <Input
                                id="area"
                                name="area"
                                placeholder="Marathahalli"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                required
                            />
                        </div>

                        {/* City & State */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    placeholder="Bangalore"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    placeholder="Karnataka"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Pincode */}
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                                id="pincode"
                                name="pincode"
                                placeholder="560103"
                                value={formData.pincode}
                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                maxLength={6}
                                required
                            />
                        </div>

                        {/* Tower (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="tower">Tower/Block (Optional)</Label>
                            <Input
                                id="tower"
                                name="tower"
                                placeholder="Tower A"
                                value={formData.tower}
                                onChange={(e) => setFormData({ ...formData, tower: e.target.value })}
                            />
                        </div>

                        {/* Flat Number */}
                        <div className="space-y-2">
                            <Label htmlFor="flatNumber">Flat/Unit Number *</Label>
                            <Input
                                id="flatNumber"
                                name="flatNumber"
                                placeholder="502"
                                value={formData.flatNumber}
                                onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify & Complete Setup'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
