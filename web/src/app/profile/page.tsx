import { getServerSession } from '@/lib/auth'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { redirect } from 'next/navigation'
import { Star, Shield, Car, Award, Leaf, Trophy, Flame } from 'lucide-react'
import { cookies } from 'next/headers'

export default async function ProfilePage() {
    const session = await getServerSession()

    if (!session?.user) {
        redirect('/login')
    }

    const user = session.user
    const trustScore = user.trustScore?.toFixed(1) || '4.8'

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
                                            {user.displayName?.[0]?.toUpperCase() || 'P'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {user.displayName || user.fullName || 'User'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-2">
                            {user.building?.name}, {user.building?.area}
                        </p>
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
                            <Trophy className="h-4 w-4" />
                            <span>Eco Warrior</span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900 dark:text-white">
                                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                    {trustScore}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Rating</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
                                    <Car className="h-5 w-5" />
                                    {user.totalRides || 47}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Rides</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-teal-600">
                                    <Leaf className="h-5 w-5" />
                                    {(user.totalCO2Saved || 127.5).toFixed(0)}kg
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">CO₂ Saved</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-500">
                                    <Flame className="h-5 w-5" />
                                    {user.currentStreak || 12}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Day Streak</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="container-app py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Achievements */}
                    <div className="glass-card rounded-2xl p-6 animate-fade-up">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            Achievements
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800">
                                <div className="text-3xl mb-2">🌱</div>
                                <span className="font-semibold text-amber-700 dark:text-amber-400">First Step</span>
                                <span className="text-xs text-amber-600 dark:text-amber-500">1kg CO₂</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800">
                                <div className="text-3xl mb-2">🚗</div>
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Weekly Rider</span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-500">10 rides</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                                <div className="text-3xl mb-2">🔥</div>
                                <span className="font-semibold text-blue-700 dark:text-blue-400">On Fire</span>
                                <span className="text-xs text-blue-600 dark:text-blue-500">7-day streak</span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="glass-card rounded-2xl p-6 animate-fade-up stagger-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Edit Profile
                        </h2>
                        <ProfileForm user={user as any} />
                    </div>
                </div>
            </div>
        </div>
    )
}
