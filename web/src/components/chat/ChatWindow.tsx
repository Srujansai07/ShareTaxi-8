'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { sendMessage } from '@/app/actions/chat'

interface Message {
    id: string
    content: string
    senderId: string
    createdAt: Date
}

interface ChatWindowProps {
    conversationId: string
    initialMessages: Message[]
    currentUserId: string
    otherUser: {
        displayName: string
        photoUrl: string | null
    }
}

export function ChatWindow({ conversationId, initialMessages, currentUserId, otherUser }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        const content = newMessage
        setNewMessage('')
        setIsSending(true)

        // Optimistic update
        const optimisticMsg: Message = {
            id: 'temp-' + Date.now(),
            content,
            senderId: currentUserId,
            createdAt: new Date()
        }
        setMessages(prev => [...prev, optimisticMsg])

        const result = await sendMessage(conversationId, content)

        if (result.success && result.message) {
            // Replace optimistic message with real one (though in mock mode it's same)
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? result.message! : m))
        } else {
            // Revert on failure (remove optimistic message)
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
            // Show error toast (optional)
        }
        setIsSending(false)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[600px] border rounded-lg overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                <Avatar>
                    <AvatarImage src={otherUser.photoUrl || ''} />
                    <AvatarFallback>{otherUser.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{otherUser.displayName}</h3>
                    <p className="text-xs text-muted-foreground">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${isMe
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t bg-background flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    )
}
