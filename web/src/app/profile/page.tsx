import { getUserProfile } from '@/app/actions/user'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { redirect } from 'next/navigation'
import { Star, Shield, Car, Award } from 'lucide-react'

export default async function ProfilePage() {
    const { success, user } = await getUserProfile()

    if (!success || !user) {
        redirect('/login')
    }

    const trustScore = user.trustScore ? (user.trustScore / 20).toFixed(1) : '5.0'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header with avatar */}
            <div className="gradient-hero border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="container-app py-12">
                    <div className="flex flex-col items-center text-center animate-fade-up">
                        {/* Avatar */}
                        <div className="relative mb-6">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 p-1 shadow-xl shadow-blue-500/30">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                                    {user.photoUrl ? (
                                        <img
                                            src={user.photoUrl}
                                            alt={user.displayName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold gradient-text">
                                            {user.displayName?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {user.displayName || 'User'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            {user.phone}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900 dark:text-white">
                                    <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                                    {trustScore}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Rating</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900 dark:text-white">
                                    <Car className="h-6 w-6 text-blue-500" />
                                    {user.totalRides || 0}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Rides</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900 dark:text-white">
                                    <Award className="h-6 w-6 text-emerald-500" />
                                    {user.trustScore || 100}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Trust</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="container-app py-8">
                <div className="max-w-lg mx-auto">
                    <div className="glass-card rounded-2xl p-6 animate-fade-up stagger-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Edit Profile
                        </h2>
                        <ProfileForm user={user} />
                    </div>
                </div>
            </div>
        </div>
    )
}
