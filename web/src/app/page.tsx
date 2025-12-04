import Link from 'next/link'

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Logo/Brand */}
                    <div className="mb-8 animate-fade-in">
                        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                            🚗 ShareTaxi
                        </h1>
                        <p className="text-xl text-gray-600 font-medium">
                            Hyper-Local Carpool & Meetup
                        </p>
                    </div>

                    {/* Value Proposition */}
                    <div className="mb-12 animate-slide-up">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Connect with neighbors going to the same destination
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Save money, reduce traffic, and build community by sharing rides with people from your building or locality.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link href="/signup" className="btn-primary text-lg">
                            Get Started
                        </Link>
                        <Link href="/about" className="btn-secondary text-lg">
                            Learn More
                        </Link>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mt-16">
                        <FeatureCard
                            icon="💰"
                            title="Save Money"
                            description="Split costs with neighbors traveling to the same destination"
                        />
                        <FeatureCard
                            icon="🌍"
                            title="Reduce Traffic"
                            description="Less cars on the road means less pollution and congestion"
                        />
                        <FeatureCard
                            icon="🤝"
                            title="Build Community"
                            description="Meet and connect with people in your building"
                        />
                    </div>

                    {/* How It Works */}
                    <div className="mt-20">
                        <h3 className="text-3xl font-bold text-gray-900 mb-12">
                            How It Works
                        </h3>
                        <div className="grid md:grid-cols-4 gap-8">
                            <StepCard
                                number="1"
                                title="Sign Up"
                                description="Verify your building or locality"
                            />
                            <StepCard
                                number="2"
                                title="Set Destination"
                                description="Where are you going?"
                            />
                            <StepCard
                                number="3"
                                title="Get Matched"
                                description="Find neighbors going the same way"
                            />
                            <StepCard
                                number="4"
                                title="Share Ride"
                                description="Coordinate and travel together"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <StatCard value="500+" label="Users" />
                        <StatCard value="100+" label="Shared Trips" />
                        <StatCard value="₹50K+" label="Saved" />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © 2024 ShareTaxi. Building sustainable urban mobility.
                    </p>
                </div>
            </footer>
        </main>
    )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="card text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {number}
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    )
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">{value}</div>
            <div className="text-gray-600">{label}</div>
        </div>
    )
}
