import { SettingsForm } from '@/components/settings/SettingsForm'

export default function SettingsPage() {
    return (
        <div className="container max-w-2xl py-6 space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and mock mode preferences.
                </p>
            </div>
            <SettingsForm />
        </div>
    )
}
