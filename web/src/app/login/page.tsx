'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sendOTP, verifyOTP } from '@/app/actions/auth'
import { toast } from 'sonner'
import { Phone, ArrowRight } from 'lucide-react'

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Welcome to ShareTaxi</CardTitle>
                    <CardDescription>
                        Connect with neighbors, share rides, save money
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'phone' ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="flex gap-2">
                                    <div className="flex items-center px-3 border rounded-md bg-muted">
                                        <Phone className="h-4 w-4 mr-2" />
                                        <span className="text-sm">+91</span>
                                    </div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="9876543210"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send OTP'}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    className="text-center text-2xl tracking-widest"
                                />
                                <p className="text-sm text-muted-foreground text-center">
                                    Sent to +91 {phoneNumber}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setStep('phone')}
                                >
                                    Change Number
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
