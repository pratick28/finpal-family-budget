import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendInvitationEmail } from './mailgun';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  family_id: string | null;
  role: 'owner' | 'member';
  status: 'pending' | 'active';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  familyMembers: Profile[];
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, familyId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  inviteFamilyMember: (email: string) => Promise<void>;
  getFamilyMembers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getFamilyMembers = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.eq.${user.id},family_id.eq.${user.id}`);
      
    if (!error && data) {
      setFamilyMembers(data);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, familyId?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        if (error.message.includes('429')) {
          throw new Error('Too many signup attempts. Please try again later.');
        }
        throw error;
      }

      if (data.user) {
        // Create profile using service role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            family_id: familyId || data.user.id,
            role: familyId ? 'member' : 'owner',
            status: familyId ? 'active' : 'active'
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Try to get the profile to see if it was created
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!existingProfile) {
            throw new Error('Failed to create profile. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string, rememberMe = true) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    // Set session persistence based on remember me
    if (rememberMe) {
      await supabase.auth.getSession();
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const inviteFamilyMember = async (email: string) => {
    if (!user) throw new Error('Not authenticated');

    // Create pending invitation
    const { error } = await supabase
      .from('profiles')
      .insert({
        email,
        family_id: user.id,
        role: 'member',
        status: 'pending'
      });
    if (error) throw error;

    // Send invitation email
    await sendInvitationEmail(email, user.id);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      familyMembers,
      signIn, 
      signUp, 
      signOut,
      inviteFamilyMember,
      getFamilyMembers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}