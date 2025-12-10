'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendOTP, verifyOTP } from '@/app/actions/auth'
import { demoLogin } from '@/app/actions/demo'
import { toast } from 'sonner'
import { Phone, ArrowRight, Car, Shield, Sparkles, Zap } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!phoneNumber.match(/^[6-9]\d{9}$/)) {
            toast.error('Please enter a valid 10-digit phone number')
            return
        }

        setIsLoading(true)
        const formData = new FormData()
        formData.append('phoneNumber', `+91${phoneNumber}`)

        const result = await sendOTP(formData)
        setIsLoading(false)

        if (result.success) {
            toast.success('OTP sent successfully!')
            setStep('otp')
        } else {
            toast.error(result.error || 'Failed to send OTP')
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()

        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP')
            return
        }

        setIsLoading(true)
        const formData = new FormData()
        formData.append('phoneNumber', `+91${phoneNumber}`)
        formData.append('otp', otp)

        const result = await verifyOTP(formData)
        setIsLoading(false)

        if (result.success) {
            toast.success('Login successful!')
            router.push(result.redirectTo || '/dashboard')
        } else {
            toast.error(result.error || 'Invalid OTP')
        }
    }

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-down">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <Car className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold gradient-text">ShareTaxi</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="glass-card rounded-3xl p-8 animate-fade-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Welcome Back!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Sign in to continue sharing rides
                        </p>
                    </div>

                    {step === 'phone' ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                                    Phone Number
                                </Label>
                                <div className="flex gap-3">
                                    <div className="flex items-center px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">+91</span>
                                    </div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="9876543210"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        maxLength={10}
                                        required
                                        className="flex-1 h-12 rounded-xl text-lg border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-lg font-semibold shadow-lg shadow-blue-500/30"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 animate-spin" />
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Send OTP
                                        <ArrowRight className="h-5 w-5" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="otp" className="text-slate-700 dark:text-slate-300">
                                    Enter OTP
                                </Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    className="h-14 text-center text-2xl tracking-[0.5em] rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500"
                                />
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                    Sent to +91 {phoneNumber}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-lg font-semibold shadow-lg shadow-emerald-500/30"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                    onClick={() => setStep('phone')}
                                >
                                    Change Number
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            New to ShareTaxi?{' '}
                            <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Demo Mode for Pitch */}
                    <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                        <button
                            onClick={async () => {
                                const result = await demoLogin()
                                if (result.success) {
                                    toast.success('Demo mode activated!')
                                    router.push(result.redirectTo || '/dashboard')
                                }
                            }}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02]"
                        >
                            <Zap className="h-5 w-5" />
                            Quick Demo (for pitch)
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-2">
                            Skip login and explore the app
                        </p>
                    </div>
                </div>

                {/* Trust indicators */}
                <div className="flex justify-center gap-6 mt-6 animate-fade-up stagger-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        <span>Secure Login</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span>OTP Verified</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
