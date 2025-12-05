import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { getUserSettings } from '@/app/actions/settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, User, Shield, Trash2 } from 'lucide-react'

export default async function SettingsPage() {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const settingsResult = await getUserSettings()

    if (!settingsResult.success || !settingsResult.settings) {
        return <div>Error loading settings</div>
    }

    const settings = settingsResult.settings

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Settings
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            name="displayName"
                            defaultValue={settings.displayName}
                            placeholder="Your name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={settings.bio || ''}
                            placeholder="Tell others about yourself"
                            maxLength={200}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select name="gender" defaultValue={settings.gender}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button>Save Profile</Button>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="matchNotifications">Match Notifications</Label>
                            <p className="text-sm text-muted-foreground">Get notified when you have new matches</p>
                        </div>
                        <Switch
                            id="matchNotifications"
                            name="matchNotifications"
                            defaultChecked={settings.preferences?.matchNotifications ?? true}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="messageNotifications">Message Notifications</Label>
                            <p className="text-sm text-muted-foreground">Get notified of new messages</p>
                        </div>
                        <Switch
                            id="messageNotifications"
                            name="messageNotifications"
                            defaultChecked={settings.preferences?.messageNotifications ?? true}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="rideReminders">Ride Reminders</Label>
                            <p className="text-sm text-muted-foreground">Reminders before your scheduled rides</p>
                        </div>
                        <Switch
                            id="rideReminders"
                            name="rideReminders"
                            defaultChecked={settings.preferences?.rideReminders ?? true}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="sosAlerts">SOS Alerts</Label>
                            <p className="text-sm text-muted-foreground">Emergency alerts from ride participants</p>
                        </div>
                        <Switch
                            id="sosAlerts"
                            name="sosAlerts"
                            defaultChecked={settings.preferences?.sosAlerts ?? true}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                            id="emailNotifications"
                            name="emailNotifications"
                            defaultChecked={settings.preferences?.emailNotifications ?? false}
                        />
                    </div>

                    <Button>Save Preferences</Button>
                </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy Settings
                    </CardTitle>
                    <CardDescription>Control what information is visible to others</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="showPhoneNumber">Show Phone Number</Label>
                            <p className="text-sm text-muted-foreground">Display your phone number on your profile</p>
                        </div>
                        <Switch
                            id="showPhoneNumber"
                            name="showPhoneNumber"
                            defaultChecked={settings.preferences?.showPhoneNumber ?? false}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="showLocation">Show Location</Label>
                            <p className="text-sm text-muted-foreground">Share your building location with matches</p>
                        </div>
                        <Switch
                            id="showLocation"
                            name="showLocation"
                            defaultChecked={settings.preferences?.showLocation ?? true}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="autoAcceptMatches">Auto-Accept Matches</Label>
                            <p className="text-sm text-muted-foreground">Automatically accept high-confidence matches</p>
                        </div>
                        <Switch
                            id="autoAcceptMatches"
                            name="autoAcceptMatches"
                            defaultChecked={settings.preferences?.autoAcceptMatches ?? false}
                        />
                    </div>

                    <Button>Save Privacy Settings</Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Delete Account</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <Button variant="destructive">Delete My Account</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
