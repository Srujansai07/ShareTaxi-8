// lib/utils/geo.ts - Geographic Utilities

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
}

/**
 * Calculate distance in kilometers
 */
export function calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    return calculateDistance(lat1, lon1, lat2, lon2) / 1000
}

/**
 * Calculate time difference in minutes
 */
export function calculateTimeDifference(date1: Date, date2: Date): number {
    return Math.abs(date1.getTime() - date2.getTime()) / 60000
}

/**
 * Check if point is within radius of another point
 */
export function isWithinRadius(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radiusMeters: number
): boolean {
    return calculateDistance(lat1, lon1, lat2, lon2) <= radiusMeters
}

/**
 * Calculate bearing between two points
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const x = Math.sin(Δλ) * Math.cos(φ2)
    const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)

    const θ = Math.atan2(x, y)
    const bearing = ((θ * 180) / Math.PI + 360) % 360

    return bearing
}

/**
 * Get cardinal direction from bearing
 */
export function bearingToCardinal(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(bearing / 45) % 8
    return directions[index]
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`
    }
    return `${Math.round(meters)} m`
}

/**
 * Estimate travel time based on distance and mode
 * @returns Time in minutes
 */
export function estimateTravelTime(
    distanceMeters: number,
    mode: 'DRIVING' | 'WALKING' | 'TRANSIT' = 'DRIVING'
): number {
    const speeds: Record<string, number> = {
        DRIVING: 30, // km/h average in Indian cities
        WALKING: 5,
        TRANSIT: 20,
    }

    const distanceKm = distanceMeters / 1000
    const timeHours = distanceKm / speeds[mode]

    return Math.ceil(timeHours * 60)
}

/**
 * Format travel time for display
 */
export function formatTravelTime(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (mins === 0) {
        return `${hours}h`
    }

    return `${hours}h ${mins}m`
}

/**
 * Check if two coordinates are approximately equal
 */
export function coordinatesEqual(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    precisionMeters: number = 100
): boolean {
    return calculateDistance(lat1, lon1, lat2, lon2) <= precisionMeters
}

/**
 * Get bounding box around a point
 */
export function getBoundingBox(
    lat: number,
    lon: number,
    radiusKm: number
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
    const latDiff = radiusKm / 111.32 // 1 degree latitude ≈ 111.32 km
    const lonDiff = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))

    return {
        minLat: lat - latDiff,
        maxLat: lat + latDiff,
        minLon: lon - lonDiff,
        maxLon: lon + lonDiff,
    }
}

/**
 * Bangalore city center coordinates
 */
export const BANGALORE_CENTER = {
    lat: 12.9716,
    lng: 77.5946,
}

/**
 * India bounds for validation
 */
export const INDIA_BOUNDS = {
    minLat: 6.5,
    maxLat: 35.5,
    minLon: 68.0,
    maxLon: 97.5,
}

/**
 * Check if coordinates are within India
 */
export function isWithinIndia(lat: number, lon: number): boolean {
    return (
        lat >= INDIA_BOUNDS.minLat &&
        lat <= INDIA_BOUNDS.maxLat &&
        lon >= INDIA_BOUNDS.minLon &&
        lon <= INDIA_BOUNDS.maxLon
    )
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
    return (
        !isNaN(lat) &&
        !isNaN(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
    )
}
