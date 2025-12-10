import { SettingsForm } from '@/components/settings/SettingsForm'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Settings, Bell, Shield, Moon, LogOut, User, Building, Smartphone } from 'lucide-react'
import { demoLogout } from '@/app/actions/demo'
import Link from 'next/link'

export default async function SettingsPage() {
    const session = await getServerSession()

    if (!session?.user) {
        redirect('/login')
    }

    const user = session.user

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="gradient-hero border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="container-app py-8">
                    <div className="animate-fade-up">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <Settings className="h-8 w-8 text-blue-600" />
                            Settings
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Manage your account and preferences
                        </p>
                    </div>
                </div>
            </div>

            <div className="container-app py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Account Info Card */}
                    <div className="glass-card rounded-2xl p-6 animate-fade-up">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Account
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                        {user.displayName?.[0]?.toUpperCase() || 'P'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{user.displayName}</p>
                                        <p className="text-sm text-slate-500">{user.phoneNumber}</p>
                                    </div>
                                </div>
                                <Link href="/profile" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    Edit
                                </Link>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Building className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{user.building?.name}</p>
                                        <p className="text-sm text-slate-500">{user.building?.area}, {user.building?.city}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="glass-card rounded-2xl p-6 animate-fade-up stagger-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Bell className="h-5 w-5 text-amber-500" />
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-5 w-5 text-slate-400" />
                                    <span className="text-slate-700 dark:text-slate-300">Push Notifications</span>
                                </div>
                                <div className="w-12 h-7 bg-blue-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                                </div>
                            </label>
                            <label className="flex items-center justify-between py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-slate-400" />
                                    <span className="text-slate-700 dark:text-slate-300">Ride Reminders</span>
                                </div>
                                <div className="w-12 h-7 bg-blue-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Privacy */}
                    <div className="glass-card rounded-2xl p-6 animate-fade-up stagger-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            Privacy & Security
                        </h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between py-3 cursor-pointer">
                                <span className="text-slate-700 dark:text-slate-300">Show phone number to ride partners</span>
                                <div className="w-12 h-7 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                                </div>
                            </label>
                            <label className="flex items-center justify-between py-3 cursor-pointer">
                                <span className="text-slate-700 dark:text-slate-300">Allow direct messages</span>
                                <div className="w-12 h-7 bg-blue-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="glass-card rounded-2xl p-6 animate-fade-up stagger-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Moon className="h-5 w-5 text-purple-500" />
                            Appearance
                        </h2>
                        <label className="flex items-center justify-between py-3 cursor-pointer">
                            <span className="text-slate-700 dark:text-slate-300">Dark Mode</span>
                            <div className="w-12 h-7 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                            </div>
                        </label>
                    </div>

                    {/* Logout */}
                    <a
                        href="/login"
                        className="w-full glass-card rounded-2xl p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors animate-fade-up stagger-4"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-semibold">Sign Out</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
