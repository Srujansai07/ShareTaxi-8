'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Search, Loader2 } from 'lucide-react'

interface LocationSearchProps {
    onLocationSelect: (location: {
        address: string
        latitude: number
        longitude: number
        placeId: string
    }) => void
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const searchLocation = async () => {
        if (!query.trim()) return

        setIsSearching(true)

        try {
            // In production, use Google Places API
            // For now, using a mock search
            const mockResults = [
                {
                    address: query,
                    latitude: 28.6139 + Math.random() * 0.1,
                    longitude: 77.2090 + Math.random() * 0.1,
                    placeId: `place_${Date.now()}`
                }
            ]

            setResults(mockResults)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleSelect = (result: any) => {
        onLocationSelect(result)
        setQuery('')
        setResults([])
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Search Location
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for a place..."
                        onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                    />
                    <Button onClick={searchLocation} disabled={isSearching}>
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {results.length > 0 && (
                    <div className="space-y-2">
                        {results.map((result, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(result)}
                                className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                            >
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{result.address}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
