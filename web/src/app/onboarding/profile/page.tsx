'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createProfile } from '@/app/actions/auth'
import { toast } from 'sonner'
import { User, Upload } from 'lucide-react'

export default function ProfileOnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        fullName: '',
        displayName: '',
        gender: '',
        dateOfBirth: ''
    })

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const data = new FormData(e.currentTarget)
        const result = await createProfile(data)

        setIsLoading(false)

        if (result.success) {
            toast.success('Profile created!')
            router.push(result.redirectTo || '/onboarding/building')
        } else {
            toast.error(result.error || 'Failed to create profile')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create Your Profile</CardTitle>
                    <CardDescription>
                        Let's get to know you better
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Profile Photo */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    )}
                                </div>
                                <Label
                                    htmlFor="photo"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90"
                                >
                                    <Upload className="h-4 w-4" />
                                </Label>
                                <Input
                                    id="photo"
                                    name="photo"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">Upload a profile photo (optional)</p>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        {/* Display Name */}
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name *</Label>
                            <Input
                                id="displayName"
                                name="displayName"
                                placeholder="John"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                This is how others will see you
                            </p>
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender (Optional)</Label>
                            <Select
                                name="gender"
                                value={formData.gender}
                                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="NON_BINARY">Non-Binary</SelectItem>
                                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating Profile...' : 'Continue'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
