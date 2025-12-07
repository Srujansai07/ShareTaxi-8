import Link from 'next/link'
import { Car, Wallet, Globe, Users, ArrowRight, Shield, Clock, MapPin } from 'lucide-react'

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="gradient-hero min-h-screen flex items-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float stagger-2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-200/30 to-emerald-200/30 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container-app py-20 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Logo/Brand */}
                        <div className="mb-8 animate-fade-down">
                            <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg mb-8 border border-white/50">
                                <Car className="h-8 w-8 text-blue-600" />
                                <span className="text-2xl font-bold gradient-text">ShareTaxi</span>
                            </div>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-up leading-tight">
                            <span className="text-slate-900 dark:text-white">Share Rides with </span>
                            <span className="gradient-text">Your Neighbors</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 animate-fade-up stagger-1">
                            Connect with people in your building going to the same destination.
                            Save money, reduce traffic, and build community.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up stagger-2">
                            <Link href="/signup" className="btn-primary text-lg group">
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/login" className="btn-secondary text-lg">
                                Sign In
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap justify-center gap-6 animate-fade-up stagger-3">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Shield className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-medium">Verified Users Only</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium">Real-time Matching</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <MapPin className="h-5 w-5 text-amber-500" />
                                <span className="text-sm font-medium">Hyper-Local Focus</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900">
                <div className="container-app">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                            Why Choose <span className="gradient-text">ShareTaxi?</span>
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            A smarter way to commute with your neighbors
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Wallet className="h-8 w-8" />}
                            iconColor="blue"
                            title="Save Money"
                            description="Split ride costs with neighbors heading to the same destination. Save up to 70% on daily commutes."
                        />
                        <FeatureCard
                            icon={<Globe className="h-8 w-8" />}
                            iconColor="green"
                            title="Reduce Carbon Footprint"
                            description="Fewer cars on the road means less pollution. Track your CO₂ savings in real-time."
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8" />}
                            iconColor="amber"
                            title="Build Community"
                            description="Meet and connect with trusted people from your building. Make your commute social."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-white dark:bg-slate-800">
                <div className="container-app">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                            How It <span className="gradient-text">Works</span>
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            Get started in 4 simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        <StepCard number={1} title="Sign Up" description="Verify your building with your address" />
                        <StepCard number={2} title="Set Destination" description="Tell us where you're heading" />
                        <StepCard number={3} title="Get Matched" description="Find neighbors going the same way" />
                        <StepCard number={4} title="Share & Save" description="Coordinate and travel together" />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 gradient-hero">
                <div className="container-app">
                    <div className="max-w-4xl mx-auto">
                        <div className="glass-card rounded-3xl p-12">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <StatCard value="500+" label="Active Users" />
                                <StatCard value="₹2L+" label="Money Saved" />
                                <StatCard value="50+" label="Buildings" />
                                <StatCard value="1000kg" label="CO₂ Reduced" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
                </div>

                <div className="container-app relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Start <span className="gradient-text">Sharing?</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10">
                            Join thousands of neighbors already saving on their daily commute
                        </p>
                        <Link href="/signup" className="btn-accent text-lg inline-flex group">
                            Create Free Account
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-white py-12 border-t border-slate-800">
                <div className="container-app">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Car className="h-6 w-6 text-blue-500" />
                            <span className="text-xl font-bold">ShareTaxi</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            © 2024 ShareTaxi. Building sustainable urban mobility.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/about" className="text-slate-400 hover:text-white transition-colors text-sm">About</Link>
                            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy</Link>
                            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    )
}

function FeatureCard({
    icon,
    iconColor,
    title,
    description
}: {
    icon: React.ReactNode
    iconColor: 'blue' | 'green' | 'amber'
    title: string
    description: string
}) {
    const iconClasses = {
        blue: 'icon-circle',
        green: 'icon-circle-green',
        amber: 'icon-circle-amber'
    }

    return (
        <div className="card-interactive group">
            <div className={`${iconClasses[iconColor]} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
    )
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
    return (
        <div className="text-center group">
            <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    {number}
                </div>
                {number < 4 && (
                    <div className="hidden md:block absolute top-1/2 left-[calc(100%+1rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-30" />
                )}
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
        </div>
    )
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">{value}</div>
            <div className="text-slate-600 dark:text-slate-400 font-medium">{label}</div>
        </div>
    )
}
