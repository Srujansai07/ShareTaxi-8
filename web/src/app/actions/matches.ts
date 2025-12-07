'use server'

import { getServerSession } from '@/lib/auth'

export async function getMatches() {
    const session = await getServerSession()
    if (!session?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // MOCK MODE
    return {
        success: true,
        matches: [
            {
                id: 'match-1',
                score: 95,
                ride: {
                    id: 'ride-101',
                    destinationName: 'Tech Park',
                    destinationAddress: 'Whitefield, Bangalore',
                    departureTime: new Date(Date.now() + 3600000), // 1 hour from now
                    costPerPerson: 150,
                    user: {
                        id: 'user-101',
                        displayName: 'Sarah Wilson',
                        photoUrl: 'https://github.com/shadcn.png',
                        trustScore: 4.9,
                        totalRides: 45
                    }
                }
            },
            {
                id: 'match-2',
                score: 88,
                ride: {
                    id: 'ride-102',
                    destinationName: 'Airport (KIAL)',
                    destinationAddress: 'Devanahalli, Bangalore',
                    departureTime: new Date(Date.now() + 7200000), // 2 hours from now
                    costPerPerson: 400,
                    user: {
                        id: 'user-102',
                        displayName: 'Mike Brown',
                        photoUrl: null,
                        trustScore: 4.7,
                        totalRides: 23
                    }
                }
            }
        ]
    }
}
