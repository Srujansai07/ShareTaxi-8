import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { getActiveRides } from '@/app/actions/rides'
import { RideCard } from '@/components/RideCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, TrendingUp, Users, Leaf, Search, Bell, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const ridesResult = await getActiveRides()
    const rides = ridesResult.success ? ridesResult.rides : []

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your rides and find matches</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/settings">
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/notifications">
                        <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/rides/search">
                        <Button variant="outline" size="lg">
                            <Search className="h-5 w-5 mr-2" />
                            Find Ride
                        </Button>
                    </Link>
                    <Link href="/rides/create">
                        <Button size="lg">
                            <Plus className="h-5 w-5 mr-2" />
                            Create Ride
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Rides
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Users className="h-8 w-8 text-primary" />
                            <span className="text-3xl font-bold">{rides?.length || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Money Saved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <span className="text-3xl font-bold">₹0</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            CO₂ Saved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Leaf className="h-8 w-8 text-blue-600" />
                            <span className="text-3xl font-bold">0 kg</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Rides */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Your Active Rides</h2>

                {rides && rides.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rides.map((ride: any) => (
                            <RideCard key={ride.id} ride={ride} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No active rides</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Create your first ride to start connecting with neighbors
                            </p>
                            <Link href="/rides/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Ride
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
