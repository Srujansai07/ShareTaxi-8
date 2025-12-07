import { getConversations } from '@/app/actions/chat'
import { ChatList } from '@/components/chat/ChatList'
import { redirect } from 'next/navigation'

export default async function ChatPage() {
    const { success, conversations } = await getConversations()

    if (!success) {
        redirect('/login')
    }

    return (
        <div className="container max-w-md mx-auto py-6 px-4 pb-24">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            {conversations && conversations.length > 0 ? (
                <ChatList conversations={conversations} />
            ) : (
                <p className="text-center text-muted-foreground mt-10">
                    No messages yet. Start a ride to chat!
                </p>
            )}
        </div>
    )
}
