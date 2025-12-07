import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface ChatListProps {
    conversations: any[]
}

function formatTimeAgo(date: Date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function ChatList({ conversations }: ChatListProps) {
    return (
        <div className="space-y-2">
            {conversations.map((conv) => (
                <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                    <Avatar>
                        <AvatarImage src={conv.otherUser.photoUrl} />
                        <AvatarFallback>{conv.otherUser.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <h4 className="font-semibold truncate">{conv.otherUser.displayName}</h4>
                            <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(conv.updatedAt)}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage}
                        </p>
                    </div>
                    {conv.unreadCount > 0 && (
                        <Badge variant="default" className="rounded-full h-5 w-5 flex items-center justify-center p-0">
                            {conv.unreadCount}
                        </Badge>
                    )}
                </Link>
            ))}
        </div>
    )
}
