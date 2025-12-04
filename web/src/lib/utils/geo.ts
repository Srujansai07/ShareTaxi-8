/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in meters
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
}

/**
 * Calculate time difference between two dates in minutes
 * @param date1 First date
 * @param date2 Second date
 * @returns Difference in minutes
 */
export function calculateTimeDifference(date1: Date, date2: Date): number {
    return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60)
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
}

/**
 * Format time for display
 * @param minutes Time in minutes
 * @returns Formatted string
 */
export function formatTime(minutes: number): string {
    if (minutes < 60) {
        return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}min`
}

/**
 * Check if a point is within a radius of another point
 * @param lat1 Latitude of center point
 * @param lng1 Longitude of center point
 * @param lat2 Latitude of test point
 * @param lng2 Longitude of test point
 * @param radiusMeters Radius in meters
 * @returns True if within radius
 */
export function isWithinRadius(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    radiusMeters: number
): boolean {
    const distance = calculateDistance(lat1, lng1, lat2, lng2)
    return distance <= radiusMeters
}
