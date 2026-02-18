'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

// Static ID for the single-user prototype
const USER_ID = '00000000-0000-0000-0000-000000000000';

export type BodyType = 'Straight' | 'Wave' | 'Natural';
export type PersonalColor = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface UserProfile {
    id: string;
    height: number | null;
    weight: number | null;
    body_type: BodyType | null;
    personal_color: PersonalColor | null;
    style_preference: string | null;
}

interface ProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', USER_ID)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
                console.error('Error fetching profile:', error);
            }

            if (data) {
                setProfile(data);
            } else {
                // Initialize incomplete profile if not found
                setProfile({
                    id: USER_ID,
                    height: null,
                    weight: null,
                    body_type: null,
                    personal_color: null,
                    style_preference: null
                })
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({ id: USER_ID, ...updates, updated_at: new Date().toISOString() });

            if (error) throw error;

            setProfile((prev) => prev ? { ...prev, ...updates } : null);
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        }
    };

    return (
        <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}
