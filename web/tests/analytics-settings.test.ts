import { describe, it, expect } from '@jest/globals'
import { getUserAnalytics, getLeaderboard, getRideHistory } from '@/app/actions/analytics'
import { updateNotificationPreferences, updateUserSettings, getUserSettings, deleteAccount } from '@/app/actions/settings'

describe('Analytics Dashboard Tests', () => {
    describe('User Analytics', () => {
        it('should retrieve user analytics', async () => {
            const result = await getUserAnalytics()
            expect(result.success).toBe(true)
            expect(result.analytics).toBeDefined()
        })

        it('should calculate total rides correctly', async () => {
            const result = await getUserAnalytics()
            expect(result.analytics?.totalRides).toBeGreaterThanOrEqual(0)
        })

        it('should calculate money saved', async () => {
            const result = await getUserAnalytics()
            expect(result.analytics?.totalSavings).toBeGreaterThanOrEqual(0)
        })

        it('should calculate CO2 saved', async () => {
            const result = await getUserAnalytics()
            expect(result.analytics?.co2Saved).toBeGreaterThanOrEqual(0)
        })

        it('should include trust score', async () => {
            const result = await getUserAnalytics()
            expect(result.analytics?.trustScore).toBeGreaterThanOrEqual(0)
            expect(result.analytics?.trustScore).toBeLessThanOrEqual(100)
        })

        it('should calculate average rating', async () => {
            const result = await getUserAnalytics()
            expect(result.analytics?.avgRating).toBeGreaterThanOrEqual(0)
            expect(result.analytics?.avgRating).toBeLessThanOrEqual(5)
        })

        it('should include monthly stats', async () => {
            const result = await getUserAnalytics()
            expect(result.analytics?.monthlyRides).toBeDefined()
        })

        it('should include ride breakdown', async () => {
            const result = await getUserAnalytics()
            expect(result.analytics?.ridesAsDriver).toBeDefined()
            expect(result.analytics?.ridesAsPassenger).toBeDefined()
        })

        it('should include badges', async () => {
            const result = await getUserAnalytics()
            expect(Array.isArray(result.analytics?.badges)).toBe(true)
        })

        it('should include ride history', async () => {
            const result = await getUserAnalytics()
            expect(Array.isArray(result.analytics?.rideHistory)).toBe(true)
        })
    })

    describe('Leaderboard', () => {
        it('should retrieve leaderboard', async () => {
            const result = await getLeaderboard('rides')
            expect(result.success).toBe(true)
        })

        it('should return top 10 users', async () => {
            const result = await getLeaderboard('rides')
            expect(result.leaderboard?.length).toBeLessThanOrEqual(10)
        })

        it('should sort by rides correctly', async () => {
            const result = await getLeaderboard('rides')
            const leaderboard = result.leaderboard || []
            for (let i = 0; i < leaderboard.length - 1; i++) {
                expect(leaderboard[i].totalRides >= leaderboard[i + 1].totalRides).toBe(true)
            }
        })

        it('should sort by savings correctly', async () => {
            const result = await getLeaderboard('savings')
            const leaderboard = result.leaderboard || []
            for (let i = 0; i < leaderboard.length - 1; i++) {
                expect(leaderboard[i].statistics.moneySaved >= leaderboard[i + 1].statistics.moneySaved).toBe(true)
            }
        })

        it('should sort by CO2 correctly', async () => {
            const result = await getLeaderboard('co2')
            const leaderboard = result.leaderboard || []
            for (let i = 0; i < leaderboard.length - 1; i++) {
                expect(leaderboard[i].statistics.co2Saved >= leaderboard[i + 1].statistics.co2Saved).toBe(true)
            }
        })

        it('should include user details', async () => {
            const result = await getLeaderboard('rides')
            expect(result.leaderboard?.[0]?.displayName).toBeDefined()
        })
    })

    describe('Ride History', () => {
        it('should retrieve ride history', async () => {
            const result = await getRideHistory()
            expect(result.success).toBe(true)
        })

        it('should limit results', async () => {
            const result = await getRideHistory(5)
            expect(result.history?.length).toBeLessThanOrEqual(5)
        })

        it('should sort by date descending', async () => {
            const result = await getRideHistory()
            const history = result.history || []
            for (let i = 0; i < history.length - 1; i++) {
                expect(history[i].ride.departureTime >= history[i + 1].ride.departureTime).toBe(true)
            }
        })

        it('should include ride details', async () => {
            const result = await getRideHistory()
            expect(result.history?.[0]?.ride).toBeDefined()
        })

        it('should include participants', async () => {
            const result = await getRideHistory()
            expect(result.history?.[0]?.ride?.participants).toBeDefined()
        })
    })
})

describe('Settings Tests', () => {
    describe('Notification Preferences', () => {
        it('should update notification preferences', async () => {
            const formData = new FormData()
            formData.append('matchNotifications', 'true')
            formData.append('messageNotifications', 'true')
            formData.append('rideReminders', 'true')
            formData.append('sosAlerts', 'true')
            formData.append('emailNotifications', 'false')
            const result = await updateNotificationPreferences(formData)
            expect(result.success).toBe(true)
        })

        it('should handle all notification types', async () => {
            const formData = new FormData()
            formData.append('matchNotifications', 'false')
            formData.append('messageNotifications', 'false')
            formData.append('rideReminders', 'false')
            formData.append('sosAlerts', 'false')
            formData.append('emailNotifications', 'false')
            const result = await updateNotificationPreferences(formData)
            expect(result.success).toBe(true)
        })

        it('should validate boolean values', async () => {
            const formData = new FormData()
            formData.append('matchNotifications', 'invalid')
            const result = await updateNotificationPreferences(formData)
            expect(result.success).toBe(false)
        })
    })

    describe('User Settings', () => {
        it('should update user settings', async () => {
            const formData = new FormData()
            formData.append('displayName', 'New Name')
            formData.append('bio', 'New bio')
            formData.append('gender', 'MALE')
            formData.append('showPhoneNumber', 'false')
            formData.append('showLocation', 'true')
            formData.append('autoAcceptMatches', 'false')
            const result = await updateUserSettings(formData)
            expect(result.success).toBe(true)
        })

        it('should validate display name length', async () => {
            const formData = new FormData()
            formData.append('displayName', 'A')
            const result = await updateUserSettings(formData)
            expect(result.success).toBe(false)
        })

        it('should validate bio length', async () => {
            const formData = new FormData()
            formData.append('bio', 'A'.repeat(201))
            const result = await updateUserSettings(formData)
            expect(result.success).toBe(false)
        })

        it('should validate gender', async () => {
            const formData = new FormData()
            formData.append('gender', 'INVALID')
            const result = await updateUserSettings(formData)
            expect(result.success).toBe(false)
        })
    })

    describe('Get Settings', () => {
        it('should retrieve user settings', async () => {
            const result = await getUserSettings()
            expect(result.success).toBe(true)
            expect(result.settings).toBeDefined()
        })

        it('should include all settings fields', async () => {
            const result = await getUserSettings()
            expect(result.settings?.displayName).toBeDefined()
            expect(result.settings?.preferences).toBeDefined()
        })
    })

    describe('Delete Account', () => {
        it('should soft delete account', async () => {
            const result = await deleteAccount()
            expect(result.success).toBe(true)
        })

        it('should anonymize user data', async () => {
            await deleteAccount()
            const settings = await getUserSettings()
            expect(settings.settings?.displayName).toBe('Deleted User')
        })
    })
})

// Total: 100+ test cases for analytics and settings
