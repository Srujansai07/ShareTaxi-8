// lib/sms/index.ts - SMS Service Index
export * from './twilio'

// Default export for convenience
export { sendOTPViaTwilioVerify as sendOTP } from './twilio'
export { verifyOTPViaTwilioVerify as verifyOTP } from './twilio'
