import { getConversation, getMessages } from '@/app/actions/chat'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ChatDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerSession()
    if (!session?.user) {
        redirect('/login')
    }

    const [conversationResult, messagesResult] = await Promise.all([
        getConversation(params.id),
        getMessages(params.id)
    ])

    if (!conversationResult.success || !conversationResult.conversation) {
        redirect('/chat')
    }

    return (
        <div className="container max-w-md mx-auto py-6 px-4 pb-24">
            <ChatWindow
                conversationId={params.id}
                initialMessages={messagesResult.messages || []}
                currentUserId={session.user.id}
                otherUser={conversationResult.conversation.otherUser}
            />
        </div>
    )
}
