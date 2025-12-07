import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getServerSession() {
    // MOCK MODE
    const cookieStore = cookies()
    if (cookieStore.get('mock-session')) {
        return {
            user: {
                id: 'mock-user-id',
                phone: '+919876543210',
                email: 'test@example.com',
            }
        }
    }

    const supabase = createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    return {
        user: {
            id: user.id,
            phone: user.phone,
            email: user.email,
        }
    }
}
