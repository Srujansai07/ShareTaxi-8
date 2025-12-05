'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Loader2 } from 'lucide-react'
import { sendMessage, getMessages } from '@/app/actions/messages'
import { toast } from 'sonner'
import { getInitials, formatDate } from '@/lib/utils'

interface Message {
    id: string
    content: string
    createdAt: Date
    sender: {
        id: string
        displayName: string
        photoUrl: string | null
    }
}

interface ChatBoxProps {
    rideId: string
    currentUserId: string
}

export function ChatBox({ rideId, currentUserId }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        loadMessages()
        // Poll for new messages every 5 seconds
        const interval = setInterval(loadMessages, 5000)
        return () => clearInterval(interval)
    }, [rideId])

    const loadMessages = async () => {
        setIsLoading(true)
        const result = await getMessages(rideId)
        if (result.success && result.messages) {
            setMessages(result.messages as Message[])
        }
        setIsLoading(false)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newMessage.trim()) return

        setIsSending(true)
        const formData = new FormData()
        formData.append('rideId', rideId)
        formData.append('content', newMessage.trim())

        const result = await sendMessage(formData)

        if (result.success) {
            setNewMessage('')
            await loadMessages()
        } else {
            toast.error(result.error || 'Failed to send message')
        }

        setIsSending(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ride Chat</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Messages List */}
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {isLoading && messages.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No messages yet. Start the conversation!
                        </p>
                    ) : (
                        messages.map((message) => {
                            const isOwnMessage = message.sender.id === currentUserId
                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={message.sender.photoUrl || undefined} />
                                        <AvatarFallback>
                                            {getInitials(message.sender.displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium">
                                                {isOwnMessage ? 'You' : message.sender.displayName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(message.createdAt)}
                                            </span>
                                        </div>
                                        <div
                                            className={`inline-block px-4 py-2 rounded-lg ${isOwnMessage
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isSending}
                        maxLength={1000}
                    />
                    <Button type="submit" disabled={isSending || !newMessage.trim()}>
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
