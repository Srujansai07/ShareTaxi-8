import { getUserProfile } from '@/app/actions/user'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    const { success, user } = await getUserProfile()

    if (!success || !user) {
        redirect('/login')
    }

    return (
        <div className="container max-w-md mx-auto py-6 px-4 pb-24">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>
            <ProfileForm user={user} />
        </div>
    )
}
