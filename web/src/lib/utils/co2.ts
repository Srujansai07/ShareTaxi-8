// lib/utils/co2.ts - CO2 Tracking Utilities

/**
 * Emission factors (kg CO2 per km)
 * Based on Indian vehicle emission standards
 */
export const EMISSION_FACTORS = {
    SOLO_CAR: 0.21,           // Average Indian petrol car
    SHARED_CAR_2: 0.105,      // 2 people sharing
    SHARED_CAR_3: 0.07,       // 3 people sharing
    SHARED_CAR_4: 0.0525,     // 4 people sharing
    PUBLIC_TRANSPORT: 0.05,   // Bus/Metro per passenger-km
    ELECTRIC_CAR: 0.08,       // Electric vehicle
    TWO_WHEELER: 0.12,        // Motorcycle/scooter
    AUTO_RICKSHAW: 0.15,      // Three-wheeler
} as const

export type VehicleType = keyof typeof EMISSION_FACTORS

/**
 * Calculate CO2 saved by sharing a ride
 * @param distanceKm - Distance in kilometers
 * @param participants - Number of people sharing the ride
 * @param vehicleType - Type of vehicle (default: CAR)
 * @returns CO2 saved in kg
 */
export function calculateCO2Saved(
    distanceKm: number,
    participants: number,
    vehicleType: 'CAR' | 'ELECTRIC' | 'TWO_WHEELER' = 'CAR'
): number {
    const baseEmission = vehicleType === 'CAR'
        ? EMISSION_FACTORS.SOLO_CAR
        : vehicleType === 'ELECTRIC'
            ? EMISSION_FACTORS.ELECTRIC_CAR
            : EMISSION_FACTORS.TWO_WHEELER

    // If solo, no savings
    if (participants <= 1) return 0

    // Shared emission per person
    const sharedEmission = baseEmission / participants

    // CO2 saved = what would have been emitted if each person drove alone
    // minus what is actually emitted with sharing
    const totalIfSolo = baseEmission * participants * distanceKm
    const totalShared = baseEmission * distanceKm
    const co2Saved = totalIfSolo - totalShared

    return parseFloat(co2Saved.toFixed(2))
}

/**
 * Calculate CO2 split between driver and passenger
 * Default: 60% driver, 40% passenger (driver takes more because they provide the vehicle)
 */
export function calculateCO2Split(
    totalCO2Saved: number,
    driverPercentage: number = 60
): { driver: number; passenger: number } {
    const driverShare = (totalCO2Saved * driverPercentage) / 100
    const passengerShare = totalCO2Saved - driverShare

    return {
        driver: parseFloat(driverShare.toFixed(2)),
        passenger: parseFloat(passengerShare.toFixed(2))
    }
}

/**
 * Calculate eco points based on CO2 saved
 * 10 points per kg CO2
 */
export function calculateEcoPoints(co2SavedKg: number): number {
    return Math.floor(co2SavedKg * 10)
}

// ============================================
// ENVIRONMENTAL EQUIVALENTS
// ============================================

/**
 * Convert CO2 saved to equivalent trees planted
 * One tree absorbs ~21 kg CO2 per year
 */
export function co2ToTreesEquivalent(co2Kg: number): number {
    const treesPerYear = co2Kg / 21
    return parseFloat(treesPerYear.toFixed(2))
}

/**
 * Convert CO2 saved to plastic bottles not produced
 * One plastic bottle production = ~82g CO2
 */
export function co2ToPlasticBottles(co2Kg: number): number {
    return Math.floor((co2Kg * 1000) / 82)
}

/**
 * Convert CO2 saved to equivalent car km avoided
 * Reverse of solo car emission (0.21 kg/km)
 */
export function co2ToCarKmEquivalent(co2Kg: number): number {
    return parseFloat((co2Kg / EMISSION_FACTORS.SOLO_CAR).toFixed(1))
}

/**
 * Convert CO2 saved to smartphone charges equivalent
 * Full smartphone charge = ~8.22g CO2
 */
export function co2ToPhoneCharges(co2Kg: number): number {
    return Math.floor((co2Kg * 1000) / 8.22)
}

/**
 * Convert CO2 saved to hours of LED bulb lighting
 * 10W LED for 1 hour = ~4.6g CO2
 */
export function co2ToLEDHours(co2Kg: number): number {
    return Math.floor((co2Kg * 1000) / 4.6)
}

// ============================================
// GAMIFICATION - LEVELS & BADGES
// ============================================

interface UserLevel {
    level: string
    nextLevel: string
    progress: number
    nextLevelThreshold: number
    icon: string
    color: string
}

const LEVELS = [
    { name: 'Newcomer', threshold: 0, icon: '🌱', color: '#9CA3AF' },
    { name: 'Eco Explorer', threshold: 10, icon: '🌿', color: '#10B981' },
    { name: 'Green Commuter', threshold: 50, icon: '🍃', color: '#059669' },
    { name: 'Carbon Crusher', threshold: 100, icon: '💚', color: '#047857' },
    { name: 'Eco Warrior', threshold: 250, icon: '🌳', color: '#065F46' },
    { name: 'Climate Champion', threshold: 500, icon: '🏆', color: '#064E3B' },
    { name: 'Planet Protector', threshold: 1000, icon: '🌍', color: '#1E40AF' },
    { name: 'Earth Guardian', threshold: 2500, icon: '👑', color: '#7C3AED' },
    { name: 'Sustainability Legend', threshold: 5000, icon: '⭐', color: '#F59E0B' },
]

/**
 * Get user's current level based on total CO2 saved
 */
export function getUserLevel(totalCO2Kg: number): UserLevel {
    let currentLevel = LEVELS[0]
    let nextLevel = LEVELS[1] || LEVELS[0]

    for (let i = 0; i < LEVELS.length; i++) {
        if (totalCO2Kg >= LEVELS[i].threshold) {
            currentLevel = LEVELS[i]
            nextLevel = LEVELS[i + 1] || LEVELS[i]
        } else {
            break
        }
    }

    const thresholdDiff = nextLevel.threshold - currentLevel.threshold
    const progress = thresholdDiff > 0
        ? ((totalCO2Kg - currentLevel.threshold) / thresholdDiff) * 100
        : 100

    return {
        level: currentLevel.name,
        nextLevel: nextLevel.name,
        progress: Math.min(progress, 100),
        nextLevelThreshold: nextLevel.threshold,
        icon: currentLevel.icon,
        color: currentLevel.color
    }
}

/**
 * Get all available levels for display
 */
export function getAllLevels() {
    return LEVELS.map((level, index) => ({
        ...level,
        order: index + 1
    }))
}

// ============================================
// STREAK TRACKING
// ============================================

/**
 * Calculate streak days based on last ride date
 * @returns { currentStreak, shouldReset, streakBroken }
 */
export function calculateStreak(
    lastRideDate: Date | null,
    currentStreak: number
): {
    newStreak: number
    shouldReset: boolean
    streakBroken: boolean
} {
    if (!lastRideDate) {
        return { newStreak: 1, shouldReset: false, streakBroken: false }
    }

    const now = new Date()
    const lastRide = new Date(lastRideDate)

    // Reset to start of day
    now.setHours(0, 0, 0, 0)
    lastRide.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((now.getTime() - lastRide.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        // Same day, no change
        return { newStreak: currentStreak, shouldReset: false, streakBroken: false }
    } else if (diffDays === 1) {
        // Consecutive day, increment streak
        return { newStreak: currentStreak + 1, shouldReset: false, streakBroken: false }
    } else {
        // Streak broken, reset to 1
        return { newStreak: 1, shouldReset: true, streakBroken: true }
    }
}

// ============================================
// MONTHLY STATISTICS
// ============================================

/**
 * Check if monthly stats should be reset
 */
export function shouldResetMonthlyStats(lastResetDate: Date): boolean {
    const now = new Date()
    const lastReset = new Date(lastResetDate)

    return now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()
}

/**
 * Format CO2 for display
 */
export function formatCO2Display(co2Kg: number): string {
    if (co2Kg >= 1000) {
        return `${(co2Kg / 1000).toFixed(1)} tons`
    } else if (co2Kg >= 1) {
        return `${co2Kg.toFixed(1)} kg`
    } else {
        return `${(co2Kg * 1000).toFixed(0)} g`
    }
}

/**
 * Get environmental impact summary
 */
export function getImpactSummary(totalCO2Kg: number) {
    return {
        co2Saved: formatCO2Display(totalCO2Kg),
        treesEquivalent: co2ToTreesEquivalent(totalCO2Kg),
        plasticBottles: co2ToPlasticBottles(totalCO2Kg),
        carKmAvoided: co2ToCarKmEquivalent(totalCO2Kg),
        phoneCharges: co2ToPhoneCharges(totalCO2Kg),
        ledHours: co2ToLEDHours(totalCO2Kg),
        ecoPoints: calculateEcoPoints(totalCO2Kg),
        level: getUserLevel(totalCO2Kg)
    }
}
