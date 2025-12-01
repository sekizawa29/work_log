import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppContent } from './_components/AppContent';

export default async function AppPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <AppContent user={user} />;
}
