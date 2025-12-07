import { getNotifications } from '@/app/actions/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, MessageCircle, Calendar, Info } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function NotificationsPage() {
    const { success, notifications } = await getNotifications()

    if (!success) {
        redirect('/login')
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'CHAT': return <MessageCircle className="h-5 w-5 text-blue-500" />
            case 'RIDE_UPDATE': return <Info className="h-5 w-5 text-green-500" />
            case 'REMINDER': return <Calendar className="h-5 w-5 text-orange-500" />
            default: return <Bell className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="container max-w-2xl mx-auto p-6 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <Badge variant="secondary">{notifications?.filter((n: any) => !n.read).length || 0} New</Badge>
            </div>

            <div className="space-y-4">
                {notifications && notifications.length > 0 ? (
                    notifications.map((notification: any) => (
                        <Card key={notification.id} className={notification.read ? 'opacity-70' : ''}>
                            <CardContent className="p-4 flex gap-4 items-start">
                                <div className="mt-1 p-2 bg-muted rounded-full">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold">{notification.title}</h3>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No notifications yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
