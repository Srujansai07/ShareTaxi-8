import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, IndianRupee, Star, ArrowRight, Car, Bus, Bike, PersonStanding } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface RideCardProps {
    ride: any
}

export function RideCard({ ride }: RideCardProps) {
    const getRideTypeIcon = (type: string) => {
        const icons: Record<string, React.ReactNode> = {
            OWN_CAR: <Car className="h-5 w-5" />,
            SHARED_CAB: <Car className="h-5 w-5" />,
            PUBLIC_TRANSPORT: <Bus className="h-5 w-5" />,
            WALKING: <PersonStanding className="h-5 w-5" />,
            CYCLING: <Bike className="h-5 w-5" />,
            TWO_WHEELER: <Bike className="h-5 w-5" />
        }
        return icons[type] || <Car className="h-5 w-5" />
    }

    const getRideTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            OWN_CAR: 'from-blue-500 to-blue-600',
            SHARED_CAB: 'from-amber-500 to-amber-600',
            PUBLIC_TRANSPORT: 'from-emerald-500 to-emerald-600',
            WALKING: 'from-purple-500 to-purple-600',
            CYCLING: 'from-teal-500 to-teal-600',
            TWO_WHEELER: 'from-orange-500 to-orange-600'
        }
        return colors[type] || 'from-blue-500 to-blue-600'
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; label: string }> = {
            ACTIVE: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Active' },
            IN_PROGRESS: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'In Progress' },
            COMPLETED: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Completed' },
            CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' }
        }
        return badges[status] || badges.ACTIVE
    }

    const statusBadge = getStatusBadge(ride.status)

    return (
        <Link href={`/rides/${ride.id}`} className="block group">
            <div className="card-interactive overflow-hidden">
                {/* Header with gradient accent */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRideTypeColor(ride.type)} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {getRideTypeIcon(ride.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {ride.destinationName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {ride.building?.name || 'Your Building'}
                        </p>
                    </div>
                    <Badge className={`${statusBadge.bg} ${statusBadge.text} border-0 font-medium`}>
                        {statusBadge.label}
                    </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 truncate">
                            {formatDate(ride.departureTime)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300">
                            {ride.availableSeats} seats
                        </span>
                    </div>

                    {ride.costPerPerson && (
                        <div className="flex items-center gap-2 text-sm col-span-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <IndianRupee className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {formatCurrency(ride.costPerPerson)}/person
                            </span>
                        </div>
                    )}
                </div>

                {/* Driver Info */}
                {ride.user && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-white flex items-center justify-center font-semibold shadow-md">
                                {ride.user.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white text-sm">
                                    {ride.user.displayName}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {(ride.user.trustScore / 20)?.toFixed(1) || '5.0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                    </div>
                )}
            </div>
        </Link>
    )
}
