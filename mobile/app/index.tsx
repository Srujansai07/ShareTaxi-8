import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
    const router = useRouter()

    return (
        <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-white">
            <ScrollView className="flex-1">
                <View className="px-6 py-12">
                    {/* Logo */}
                    <View className="items-center mb-12">
                        <Text className="text-6xl mb-4">🚗</Text>
                        <Text className="text-4xl font-bold text-primary-600">ShareTaxi</Text>
                        <Text className="text-lg text-gray-600 mt-2">Hyper-Local Carpool</Text>
                    </View>

                    {/* Hero */}
                    <View className="mb-12">
                        <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
                            Connect with neighbors going the same way
                        </Text>
                        <Text className="text-lg text-gray-600 text-center">
                            Save money, reduce traffic, and build community
                        </Text>
                    </View>

                    {/* Features */}
                    <View className="space-y-4 mb-12">
                        <FeatureCard
                            icon="💰"
                            title="Save Money"
                            description="Split costs with neighbors"
                        />
                        <FeatureCard
                            icon="🌍"
                            title="Reduce Traffic"
                            description="Less pollution, less congestion"
                        />
                        <FeatureCard
                            icon="🤝"
                            title="Build Community"
                            description="Meet people in your building"
                        />
                    </View>

                    {/* CTA Buttons */}
                    <View className="space-y-4">
                        <TouchableOpacity
                            className="bg-primary-600 py-4 px-8 rounded-xl"
                            onPress={() => router.push('/(auth)/signup')}
                        >
                            <Text className="text-white text-center text-lg font-semibold">
                                Get Started
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-gray-100 py-4 px-8 rounded-xl"
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text className="text-gray-900 text-center text-lg font-semibold">
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Text className="text-4xl mb-3">{icon}</Text>
            <Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>
            <Text className="text-gray-600">{description}</Text>
        </View>
    )
}
