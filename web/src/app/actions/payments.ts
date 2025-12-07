'use server'

import { revalidatePath } from 'next/cache'

export type PaymentMethod = {
    id: string
    type: 'card' | 'upi' | 'wallet'
    label: string
    last4?: string
    isDefault: boolean
}

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
    { id: '1', type: 'upi', label: 'Google Pay', isDefault: true },
    { id: '2', type: 'card', label: 'HDFC Visa', last4: '4242', isDefault: false },
    { id: '3', type: 'wallet', label: 'Paytm Wallet', isDefault: false },
]

export async function getPaymentMethods(): Promise<{ success: boolean; methods: PaymentMethod[] }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
        success: true,
        methods: mockPaymentMethods,
    }
}

export async function addPaymentMethod(type: 'card' | 'upi' | 'wallet', details: string): Promise<{ success: boolean; message: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    revalidatePath('/payments')

    return {
        success: true,
        message: `${type === 'upi' ? 'UPI' : type === 'card' ? 'Card' : 'Wallet'} added successfully (Mock)`,
    }
}

export async function setDefaultPaymentMethod(methodId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))

    revalidatePath('/payments')

    return {
        success: true,
        message: 'Default payment method updated (Mock)',
    }
}

export async function removePaymentMethod(methodId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))

    revalidatePath('/payments')

    return {
        success: true,
        message: 'Payment method removed (Mock)',
    }
}
