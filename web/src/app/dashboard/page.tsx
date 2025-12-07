import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { getActiveRides } from '@/app/actions/rides'
import { RideCard } from '@/components/RideCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, TrendingUp, Users, Leaf, Search, Bell, Settings, Car, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const ridesResult = await getActiveRides()
    const rides = ridesResult.success ? ridesResult.rides : []

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="gradient-hero border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="container-app py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="animate-fade-up">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                Welcome back! 👋
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg">
                                Ready to share a ride with your neighbors?
                            </p>
                        </div>
                        <div className="flex gap-3 animate-fade-up stagger-1">
                            <Link href="/settings">
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/notifications">
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 relative">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                                </Button>
                            </Link>
                            <Link href="/rides/search" className="btn-secondary">
                                <Search className="h-5 w-5 mr-2" />
                                Find Ride
                            </Link>
                            <Link href="/rides/create" className="btn-primary">
                                <Plus className="h-5 w-5 mr-2" />
                                Create Ride
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-app py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-interactive group animate-fade-up">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Rides</span>
                            <div className="icon-circle w-10 h-10 group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold gradient-text">{rides?.length || 0}</div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">rides this week</p>
                    </div>

                    <div className="card-interactive group animate-fade-up stagger-1">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Money Saved</span>
                            <div className="icon-circle-green w-10 h-10 group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-emerald-600">₹0</div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">total savings</p>
                    </div>

                    <div className="card-interactive group animate-fade-up stagger-2">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">CO₂ Saved</span>
                            <div className="icon-circle w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-500/30 group-hover:scale-110 transition-transform">
                                <Leaf className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-teal-600">0 kg</div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">carbon offset</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up stagger-2">
                    <Link href="/rides/create" className="card-interactive group flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Car className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">Create Ride</span>
                    </Link>
                    <Link href="/rides/search" className="card-interactive group flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Search className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">Find Ride</span>
                    </Link>
                    <Link href="/rides/history" className="card-interactive group flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <MapPin className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">History</span>
                    </Link>
                    <Link href="/profile" className="card-interactive group flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Users className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">Profile</span>
                    </Link>
                </div>

                {/* Active Rides */}
                <div className="space-y-6 animate-fade-up stagger-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Active Rides</h2>
                        <Link href="/rides" className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {rides && rides.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rides.map((ride: any) => (
                                <RideCard key={ride.id} ride={ride} />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                    <Car className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No active rides</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-sm">
                                    Create your first ride to start connecting with neighbors heading the same way!
                                </p>
                                <Link href="/rides/create" className="btn-primary">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Your First Ride
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
