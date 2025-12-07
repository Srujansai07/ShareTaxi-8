'use server'

import { revalidatePath } from 'next/cache'

export type SOSResponse = {
    success: boolean
    message: string
    emergencyId?: string
    estimatedResponseTime?: string
}

export async function triggerSOS(rideId: string, location?: { lat: number; lng: number }): Promise<SOSResponse> {
    // Simulate network delay for emergency call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In production, this would:
    // 1. Send alert to all ride participants
    // 2. Notify emergency contacts
    // 3. Log location and timestamp
    // 4. Potentially contact local authorities

    console.log(`[MOCK] SOS triggered for ride ${rideId}`, location)

    revalidatePath(`/rides/${rideId}`)

    return {
        success: true,
        message: 'SOS alert sent successfully (Mock Mode)',
        emergencyId: `SOS-${Date.now()}`,
        estimatedResponseTime: '5-10 minutes',
    }
}

export async function cancelSOS(emergencyId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`[MOCK] SOS cancelled: ${emergencyId}`)

    return {
        success: true,
        message: 'SOS alert cancelled (Mock Mode)',
    }
}

export async function shareRideLocation(rideId: string, contactIds: string[]): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`[MOCK] Sharing ride ${rideId} location with contacts:`, contactIds)

    return {
        success: true,
        message: `Location shared with ${contactIds.length} contacts (Mock Mode)`,
    }
}
