import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    const diffMins = Math.floor(diff / (1000 * 60))

    if (diffMins < 60 && diffMins > 0) {
        return `in ${diffMins} min`
    } else if (diffHours < 24 && diffHours > 0) {
        return `in ${diffHours} hours`
    } else if (diffHours < 0 && diffHours > -24) {
        return `${Math.abs(diffHours)} hours ago`
    }

    return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

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

export function calculateTimeDifference(
    date1: Date | string,
    date2: Date | string
): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2
    return Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60) // Difference in minutes
}
