import { searchRides } from '@/app/actions/rides'
import { RideCard } from '@/components/RideCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Filter } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function SearchRidesPage({
    searchParams
}: {
    searchParams: { q?: string; from?: string; to?: string }
}) {
    const { success, rides } = await searchRides(searchParams)

    if (!success) {
        redirect('/login')
    }

    return (
        <div className="container mx-auto p-6 space-y-6 pb-24">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Find a Ride</h1>
                <p className="text-muted-foreground">Search for rides going your way</p>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4">
                    <form className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="From: Current Location" className="pl-9" />
                        </div>
                        <div className="flex-1 relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="To: Destination" className="pl-9" />
                        </div>
                        <Button type="submit" className="md:w-32">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Filters & Results */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{rides?.length || 0} Rides Available</h2>
                <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rides && rides.length > 0 ? (
                    rides.map((ride: any) => (
                        <RideCard key={ride.id} ride={ride} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No rides found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
