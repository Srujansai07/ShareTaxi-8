import { createClient } from '@/lib/supabase/server'

export async function getServerSession() {
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
