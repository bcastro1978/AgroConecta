import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, profile: null, loading: true, signOut: async () => { } });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string, retries = 3) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data as UserProfile);
                setLoading(false);
                return;
            }

            // Si no encuentra el perfil (PGRST116) y quedan intentos, esperamos y reintentamos.
            // Esto soluciona la "Race Condition" del Trigger.
            if ((!data || (error && error.code === 'PGRST116')) && retries > 0) {
                console.log(`Perfil no encontrado, reintentando... (${retries})`);
                setTimeout(() => fetchProfile(userId, retries - 1), 1000); // Esperar 1 segundo
                return;
            }

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }
        } catch (error) {
            console.error('Unexpected error fetching profile', error);
        } finally {
            // Solo terminamos de cargar si ya no vamos a reintentar
            if (retries === 0) setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
