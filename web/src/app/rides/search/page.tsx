import { searchRides } from '@/app/actions/rides'
import { getDemoRides } from '@/app/actions/demo'
import { RideCard } from '@/components/RideCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Filter, Navigation, Car, ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'

export default async function SearchRidesPage({
    searchParams
}: {
    searchParams: { q?: string; from?: string; to?: string }
}) {
    // Check if in demo mode
    const cookieStore = cookies()
    const isDemo = !!cookieStore.get('demo-session') || !!cookieStore.get('mock-session')

    // Get rides - use demo rides if in demo mode
    let rides: any[] = []
    if (isDemo) {
        const demoResult = await getDemoRides()
        rides = demoResult.success ? demoResult.rides : []
    } else {
        const result = await searchRides(searchParams)
        if (!result.success) {
            redirect('/login')
        }
        rides = result.rides || []
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="gradient-hero border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="container-app py-8">
                    <div className="max-w-3xl animate-fade-up">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                            Find a Ride 🔍
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Search for neighbors heading your way
                        </p>
                    </div>
                </div>
            </div>

            <div className="container-app py-8 space-y-8">
                {/* Search Card */}
                <div className="glass-card rounded-2xl p-6 animate-fade-up stagger-1">
                    <form className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Navigation className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <Input
                                    placeholder="From: Current Location"
                                    className="h-14 pl-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 text-lg"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <Input
                                    placeholder="To: Where are you going?"
                                    className="h-14 pl-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 text-lg"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                className="flex-1 md:flex-none md:w-48 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-lg font-semibold shadow-lg shadow-blue-500/30"
                            >
                                <Search className="h-5 w-5 mr-2" />
                                Search
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 rounded-xl border-2 hover:border-blue-500"
                            >
                                <Filter className="h-5 w-5 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between animate-fade-up stagger-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Available Rides
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {rides?.length || 0} rides found near you
                        </p>
                    </div>
                    <Link href="/rides/create" className="btn-accent hidden md:inline-flex">
                        <Car className="h-5 w-5 mr-2" />
                        Create Ride
                    </Link>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up stagger-3">
                    {rides && rides.length > 0 ? (
                        rides.map((ride: any) => (
                            <RideCard key={ride.id} ride={ride} />
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="card text-center py-16">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                    No rides found
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                                    Try adjusting your search or create a new ride for others to join
                                </p>
                                <Link href="/rides/create" className="btn-primary inline-flex">
                                    Create a Ride
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
