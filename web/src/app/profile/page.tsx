import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { getCurrentUser } from '@/app/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, MapPin, Star, TrendingUp, Leaf, Calendar, Shield } from 'lucide-react'
import { getInitials, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function ProfilePage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const userResult = await getCurrentUser()

    if (!userResult.success || !userResult.user) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <User className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Profile not found</h3>
                        <Link href="/dashboard">
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const user = userResult.user

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">View and manage your profile</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user.photoUrl || ''} alt={user.displayName} />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(user.displayName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                                    <CardDescription className="text-base">@{user.displayName}</CardDescription>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold">{user.trustScore?.toFixed(1) || '5.0'}</span>
                                        </div>
                                        <Badge variant="secondary">
                                            {user.totalRides || 0} rides
                                        </Badge>
                                        {user.isVerified && (
                                            <Badge className="bg-green-500">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Contact Info */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Contact Information</h3>
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span>{user.phoneNumber}</span>
                                    </div>
                                    {user.gender && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Gender:</span>
                                            <span>{user.gender}</span>
                                        </div>
                                    )}
                                    {user.dateOfBirth && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Building Info */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Building Information</h3>
                                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">{user.building?.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.tower && `${user.tower}, `}Flat {user.flatNumber}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.building?.area}, {user.building?.city}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    {user.preferences && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Ride Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender Preference</p>
                                    <p className="font-medium">{user.preferences.genderPreference}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Max Detour</p>
                                    <p className="font-medium">{user.preferences.maxDetourKm} km</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Smoking</p>
                                    <p className="font-medium">{user.preferences.smokingAllowed ? 'Allowed' : 'Not Allowed'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pets</p>
                                    <p className="font-medium">{user.preferences.petsAllowed ? 'Allowed' : 'Not Allowed'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <TrendingUp className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(user.stats?.totalMoneySaved || 0)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Money Saved</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                <Leaf className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {user.stats?.totalCO2Saved?.toFixed(1) || 0} kg
                                    </p>
                                    <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-2xl font-bold">{user.stats?.ridesAsDriver || 0}</p>
                                    <p className="text-sm text-muted-foreground">As Driver</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{user.stats?.ridesAsPassenger || 0}</p>
                                    <p className="text-sm text-muted-foreground">As Passenger</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2">Badges</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.stats?.badges && user.stats.badges.length > 0 ? (
                                        user.stats.badges.map((badge: string) => (
                                            <Badge key={badge} variant="secondary">
                                                {badge}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No badges yet</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full" variant="outline">
                                Edit Profile
                            </Button>
                            <Button className="w-full" variant="outline">
                                Privacy Settings
                            </Button>
                            <Button className="w-full" variant="outline">
                                Emergency Contacts
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
