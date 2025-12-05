'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sendOTP } from '@/app/actions/auth'
import { toast } from 'sonner'
import { Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
    const router = useRouter()
    const [phoneNumber, setPhoneNumber] = useState('')
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
            router.push(`/login?phone=${phoneNumber}`)
        } else {
            toast.error(result.error || 'Failed to send OTP')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="text-5xl mb-4">🚗</div>
                    <CardTitle className="text-3xl font-bold">Join ShareTaxi</CardTitle>
                    <CardDescription>
                        Connect with neighbors, share rides, save money
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                            {isLoading ? 'Sending OTP...' : 'Get Started'}
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
