'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile } from '@/app/actions/user'

const profileSchema = z.object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
})

interface ProfileFormProps {
    user: any
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        displayName: user.displayName || '',
        email: user.email || '',
        bio: user.bio || '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setErrors({})

        try {
            // Validate
            profileSchema.parse(formData)

            const submitData = new FormData()
            submitData.append('displayName', formData.displayName)
            if (formData.email) submitData.append('email', formData.email)
            if (formData.bio) submitData.append('bio', formData.bio)

            const result = await updateProfile(submitData)

            if (result.success) {
                toast.success('Profile updated successfully')
            } else {
                toast.error(result.error || 'Failed to update profile')
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {}
                error.errors.forEach(err => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message
                    }
                })
                setErrors(newErrors)
            } else {
                toast.error('An unexpected error occurred')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                    <AvatarImage src={user.photoUrl} alt={user.displayName} />
                    <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <CardTitle>{user.displayName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-bold">{user.trustScore}</div>
                        <div className="text-muted-foreground">Trust Score</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold">{user.totalRides}</div>
                        <div className="text-muted-foreground">Rides</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            placeholder="Your Name"
                        />
                        {errors.displayName && (
                            <p className="text-sm text-red-500">{errors.displayName}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            className="resize-none"
                        />
                        {errors.bio && (
                            <p className="text-sm text-red-500">{errors.bio}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
