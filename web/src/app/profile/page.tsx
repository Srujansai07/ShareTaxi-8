import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { getCurrentUser } from '@/app/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, MapPin, Phone, Mail, TrendingUp, Users, Leaf, Award, Settings } from 'lucide-react'
import { formatCurrency, getInitials } from '@/lib/utils'
import Link from 'next/link'

export default async function ProfilePage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const userResult = await getCurrentUser()

    if (!userResult.success || !userResult.user) {
        redirect('/login')
    }

    const user = userResult.user

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">Manage your account and view statistics</p>
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
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-2xl">
                                        {user.photoUrl ? (
                                            <img src={user.photoUrl} alt={user.displayName} className="h-20 w-20 rounded-full object-cover" />
                                        ) : (
                                            getInitials(user.displayName)
                                        )}
                                    </div>

                                    <div>
                                        <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                                        <CardDescription className="text-base">
                                            ⭐ {user.trustScore.toFixed(1)} Trust Score • {user.totalRides} Rides
                                        </CardDescription>
                                    </div>
                                </div>

                                <Link href="/profile/edit">
                                    <Button variant="outline" size="sm">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <Phone className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="font-semibold">{user.phoneNumber}</p>
                                    </div>
                                </div>

                                {user.email && (
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <Mail className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="font-semibold">{user.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Building Info */}
                            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                                <MapPin className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <p className="font-semibold text-lg">{user.building.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.tower && `${user.tower}, `}Flat {user.flatNumber}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.building.area}, {user.building.city}
                                    </p>
                                </div>
                            </div>

                            {/* Badges */}
                            {user.stats?.badges && user.stats.badges.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Badges
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.stats.badges.map((badge: string) => (
                                            <Badge key={badge} variant="secondary">
                                                {badge}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Impact</CardTitle>
                            <CardDescription>See how you're making a difference</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{user.totalRides}</p>
                                    <p className="text-xs text-muted-foreground">Total Rides</p>
                                </div>

                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(user.stats?.totalMoneySaved || 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Money Saved</p>
                                </div>

                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <Leaf className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-blue-600">
                                        {(user.stats?.totalCO2Saved || 0).toFixed(1)} kg
                                    </p>
                                    <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-purple-600">
                                        {user.stats?.newConnectionsMade || 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Connections</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ride Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ride Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">As Driver</p>
                                    <p className="text-3xl font-bold">{user.stats?.ridesAsDriver || 0}</p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">As Passenger</p>
                                    <p className="text-3xl font-bold">{user.stats?.ridesAsPassenger || 0}</p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Distance Saved</p>
                                    <p className="text-3xl font-bold">{(user.stats?.totalDistanceSaved || 0).toFixed(1)} km</p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                                    <p className="text-3xl font-bold">{(user.completionRate * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/rides/create">
                                <Button className="w-full">Create New Ride</Button>
                            </Link>
                            <Link href="/matches">
                                <Button variant="outline" className="w-full">View Matches</Button>
                            </Link>
                            <Link href="/profile/edit">
                                <Button variant="outline" className="w-full">Edit Profile</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {user.preferences && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Gender Preference</span>
                                        <span className="font-semibold">{user.preferences.genderPreference}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Max Detour</span>
                                        <span className="font-semibold">{user.preferences.maxDetourKm} km</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Smoking</span>
                                        <span className="font-semibold">{user.preferences.smokingAllowed ? 'Allowed' : 'Not Allowed'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Pets</span>
                                        <span className="font-semibold">{user.preferences.petsAllowed ? 'Allowed' : 'Not Allowed'}</span>
                                    </div>
                                </>
}
