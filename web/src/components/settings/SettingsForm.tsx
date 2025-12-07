'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function SettingsForm() {
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: false,
        mockNetworkDelay: false,
        mockForceError: false,
    })

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = () => {
        toast.success('Settings saved successfully')
        // In a real app, this would persist to a store or backend
        console.log('Saved settings:', settings)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage your app preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notifications">Push Notifications</Label>
                        <Switch
                            id="notifications"
                            checked={settings.notifications}
                            onCheckedChange={() => handleToggle('notifications')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <Switch
                            id="darkMode"
                            checked={settings.darkMode}
                            onCheckedChange={() => handleToggle('darkMode')}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10">
                <CardHeader>
                    <CardTitle className="text-orange-700 dark:text-orange-400">Mock Mode Controls</CardTitle>
                    <CardDescription>Simulate different scenarios for testing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="mockNetworkDelay">Simulate Network Delay (2s)</Label>
                        <Switch
                            id="mockNetworkDelay"
                            checked={settings.mockNetworkDelay}
                            onCheckedChange={() => handleToggle('mockNetworkDelay')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="mockForceError">Force Error State</Label>
                        <Switch
                            id="mockForceError"
                            checked={settings.mockForceError}
                            onCheckedChange={() => handleToggle('mockForceError')}
                        />
                    </div>
                </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </div>
    )
}
