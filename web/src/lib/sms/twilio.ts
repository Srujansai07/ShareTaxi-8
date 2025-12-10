// lib/sms/twilio.ts - Twilio SMS Service
import { prisma } from '@/lib/prisma'

// ============================================
// CONFIGURATION
// ============================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
const TWILIO_VERIFY_SID = process.env.TWILIO_VERIFY_SID

// OTP Configuration
const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 3
const RATE_LIMIT_WINDOW_MINUTES = 5
const MAX_REQUESTS_PER_WINDOW = 3

// ============================================
// OTP GENERATION
// ============================================

/**
 * Generate a random OTP of specified length
 */
export function generateOTP(length: number = OTP_LENGTH): string {
    let otp = ''
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString()
    }
    return otp
}

/**
 * Hash OTP for storage (simple hash for demo, use bcrypt in production)
 */
export function hashOTP(otp: string): string {
    // Simple hash using built-in crypto
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(otp).digest('hex')
}

/**
 * Verify OTP hash
 */
export function verifyOTPHash(otp: string, hash: string): boolean {
    return hashOTP(otp) === hash
}

// ============================================
// TWILIO SMS SENDING
// ============================================

interface SendSMSResult {
    success: boolean
    messageId?: string
    error?: string
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(
    phoneNumber: string,
    message: string
): Promise<SendSMSResult> {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        console.warn('Twilio not configured, using mock mode')
        return { success: true, messageId: 'mock-message-id' }
    }

    try {
        const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        const result = await twilio.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: phoneNumber
        })

        return { success: true, messageId: result.sid }
    } catch (error: any) {
        console.error('Twilio SMS error:', error)
        return { success: false, error: error.message || 'Failed to send SMS' }
    }
}

/**
 * Send OTP via Twilio Verify Service (recommended for OTP)
 */
export async function sendOTPViaTwilioVerify(
    phoneNumber: string
): Promise<SendSMSResult & { otp?: string }> {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID) {
        console.warn('Twilio Verify not configured, falling back to basic SMS')
        return sendOTPViaSMS(phoneNumber)
    }

    try {
        const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        const verification = await twilio.verify.v2
            .services(TWILIO_VERIFY_SID)
            .verifications.create({
                to: phoneNumber,
                channel: 'sms'
            })

        return { success: true, messageId: verification.sid }
    } catch (error: any) {
        console.error('Twilio Verify error:', error)
        return { success: false, error: error.message || 'Failed to send OTP' }
    }
}

/**
 * Verify OTP via Twilio Verify Service
 */
export async function verifyOTPViaTwilioVerify(
    phoneNumber: string,
    code: string
): Promise<{ success: boolean; error?: string }> {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID) {
        console.warn('Twilio Verify not configured')
        return { success: false, error: 'Twilio not configured' }
    }

    try {
        const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        const verificationCheck = await twilio.verify.v2
            .services(TWILIO_VERIFY_SID)
            .verificationChecks.create({
                to: phoneNumber,
                code: code
            })

        if (verificationCheck.status === 'approved') {
            return { success: true }
        } else {
            return { success: false, error: 'Invalid OTP' }
        }
    } catch (error: any) {
        console.error('Twilio Verify check error:', error)
        return { success: false, error: error.message || 'Verification failed' }
    }
}

// ============================================
// BASIC OTP VIA SMS (Fallback)
// ============================================

/**
 * Send OTP via basic SMS (store OTP in database)
 */
export async function sendOTPViaSMS(
    phoneNumber: string
): Promise<SendSMSResult & { otp?: string }> {
    const otp = generateOTP()
    const message = `Your ShareTaxi verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`

    // In development, skip actual SMS
    if (process.env.NODE_ENV === 'development' && !TWILIO_ACCOUNT_SID) {
        console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`)
        return { success: true, messageId: 'dev-mode', otp }
    }

    const result = await sendSMS(phoneNumber, message)

    if (result.success) {
        // Store hashed OTP in database
        await storeOTP(phoneNumber, otp)
    }

    return { ...result, otp: process.env.NODE_ENV === 'development' ? otp : undefined }
}

// ============================================
// OTP STORAGE & VERIFICATION
// ============================================

/**
 * Store OTP in database with expiry
 */
export async function storeOTP(phoneNumber: string, otp: string): Promise<void> {
    const hashedOTP = hashOTP(otp)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    await prisma.oTPVerification.upsert({
        where: { phoneNumber },
        create: {
            phoneNumber,
            otpHash: hashedOTP,
            attempts: 0,
            expiresAt,
        },
        update: {
            otpHash: hashedOTP,
            attempts: 0,
            expiresAt,
            verifiedAt: null,
        }
    })
}

/**
 * Verify stored OTP
 */
export async function verifyStoredOTP(
    phoneNumber: string,
    otp: string
): Promise<{ success: boolean; error?: string }> {
    const record = await prisma.oTPVerification.findUnique({
        where: { phoneNumber }
    })

    if (!record) {
        return { success: false, error: 'No OTP found. Please request a new one.' }
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
        return { success: false, error: 'OTP expired. Please request a new one.' }
    }

    // Check attempts
    if (record.attempts >= MAX_ATTEMPTS) {
        return { success: false, error: 'Too many attempts. Please request a new OTP.' }
    }

    // Verify OTP
    if (!verifyOTPHash(otp, record.otpHash)) {
        // Increment attempts
        await prisma.oTPVerification.update({
            where: { phoneNumber },
            data: { attempts: { increment: 1 } }
        })
        return { success: false, error: 'Invalid OTP. Please try again.' }
    }

    // Mark as verified
    await prisma.oTPVerification.update({
        where: { phoneNumber },
        data: { verifiedAt: new Date() }
    })

    return { success: true }
}

// ============================================
// RATE LIMITING
// ============================================

/**
 * Check rate limit for OTP requests
 */
export async function checkRateLimit(
    phoneNumber: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)

    const recentRequests = await prisma.oTPVerification.count({
        where: {
            phoneNumber,
            createdAt: { gte: windowStart }
        }
    })

    if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
        const retryAfter = RATE_LIMIT_WINDOW_MINUTES * 60 // seconds
        return { allowed: false, retryAfter }
    }

    return { allowed: true }
}

// ============================================
// CLEANUP
// ============================================

/**
 * Clean up expired OTPs (call periodically)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
    const result = await prisma.oTPVerification.deleteMany({
        where: {
            expiresAt: { lt: new Date() }
        }
    })

    return result.count
}
