import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { getUserAnalytics, getLeaderboard } from '@/app/actions/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Leaf, Car, Award, Star } from 'lucide-react'

export default async function AnalyticsPage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const analyticsResult = await getUserAnalytics()
    const leaderboardResult = await getLeaderboard('rides')

    if (!analyticsResult.success || !analyticsResult.analytics) {
        return <div>Error loading analytics</div>
    }

    const analytics = analyticsResult.analytics
    const leaderboard = leaderboardResult.success ? leaderboardResult.leaderboard : []

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Track your ride sharing impact</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalRides}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.monthlyRides} this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Money Saved</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{analytics.totalSavings}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime savings
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.co2Saved} kg</div>
                        <p className="text-xs text-muted-foreground">
                            Environmental impact
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.trustScore}/100</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.avgRating}★ avg rating
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Ride Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ride Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">As Driver</span>
                                <span className="font-bold">{analytics.ridesAsDriver}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">As Passenger</span>
                                <span className="font-bold">{analytics.ridesAsPassenger}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary"
                                    style={{
                                        width: `${(analytics.ridesAsDriver / analytics.totalRides) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Badges */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Badges Earned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {analytics.badges && analytics.badges.length > 0 ? (
                                analytics.badges.map((badge: string, index: number) => (
                                    <div key={index} className="text-center">
                                        <div className="text-3xl mb-1">🏆</div>
                                        <p className="text-xs">{badge}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-3 text-center text-muted-foreground">
                                    No badges yet. Keep riding!
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top Riders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {leaderboard && leaderboard.map((user: any, index: number) => (
                            <div key={user.id} className="flex items-center gap-4">
                                <div className="font-bold text-lg w-8">{index + 1}</div>
                                <div className="flex-1">
                                    <p className="font-medium">{user.displayName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.totalRides} rides • Trust: {user.trustScore}/100
                                    </p>
                                </div>
                                {index < 3 && (
                                    <div className="text-2xl">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Rides */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Rides</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.rideHistory && analytics.rideHistory.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <p className="font-medium">{item.ride.destinationName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(item.ride.departureTime).toLocaleDateString()} • {item.ride.type}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{item.ride.costPerPerson}</p>
                                    <p className="text-xs text-muted-foreground">{item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
