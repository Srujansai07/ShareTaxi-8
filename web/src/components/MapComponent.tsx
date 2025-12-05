'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MapComponentProps {
    center?: { lat: number; lng: number }
    markers?: Array<{
        position: { lat: number; lng: number }
        title?: string
        icon?: string
    }>
    route?: {
        origin: { lat: number; lng: number }
        destination: { lat: number; lng: number }
        waypoints?: Array<{ lat: number; lng: number }>
    }
    onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
    height?: string
}

export function MapComponent({
    center = { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
    markers = [],
    route,
    onLocationSelect,
    height = '400px'
}: MapComponentProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<google.maps.Map | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const initMap = async () => {
            try {
                const loader = new Loader({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
                    version: 'weekly',
                    libraries: ['places', 'geometry', 'directions']
                })

                await loader.load()

                if (!mapRef.current) return

                const mapInstance = new google.maps.Map(mapRef.current, {
                    center,
                    zoom: 13,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false
                })

                setMap(mapInstance)
                setIsLoading(false)

                // Add click listener for location selection
                if (onLocationSelect) {
                    mapInstance.addListener('click', async (e: google.maps.MapMouseEvent) => {
                        if (!e.latLng) return

                        const geocoder = new google.maps.Geocoder()
                        const result = await geocoder.geocode({ location: e.latLng })

                        if (result.results[0]) {
                            onLocationSelect({
                                lat: e.latLng.lat(),
                                lng: e.latLng.lng(),
                                address: result.results[0].formatted_address
                            })
                        }
                    })
                }
            } catch (error) {
                console.error('Error loading Google Maps:', error)
                setIsLoading(false)
            }
        }

        initMap()
    }, [])

    // Add markers
    useEffect(() => {
        if (!map) return

        markers.forEach(marker => {
            new google.maps.Marker({
                position: marker.position,
                map,
                title: marker.title,
                icon: marker.icon
            })
        })
    }, [map, markers])

    // Draw route
    useEffect(() => {
        if (!map || !route) return

        const directionsService = new google.maps.DirectionsService()
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: false
        })

        const waypoints = route.waypoints?.map(wp => ({
            location: wp,
            stopover: true
        }))

        directionsService.route(
            {
                origin: route.origin,
                destination: route.destination,
                waypoints,
                travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === 'OK' && result) {
                    directionsRenderer.setDirections(result)
                }
            }
        )
    }, [map, route])

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Loading map...</p>
                </div>
            )}
            <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />
        </div>
    )
}
