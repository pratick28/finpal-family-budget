import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Wallet, Users, Settings, ArrowRight } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }
      // Fetch profile from 'profiles' table
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error) setProfile(data);
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <>
        <Header title="Profile" />
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">Not logged in</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Profile" />
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-20 h-20 rounded-full bg-finpal-purple flex items-center justify-center text-white text-2xl font-semibold mb-3">
          {profile.first_name?.[0] || profile.email?.[0] || 'U'}
        </div>
        <h2 className="text-xl font-semibold">{profile.first_name || 'No Name'}</h2>
        <p className="text-muted-foreground">{profile.email}</p>
        <div className="mt-2 mb-6">
          <span className="inline-block bg-finpal-purple/10 text-finpal-purple text-xs font-medium px-2.5 py-1 rounded-full">
            Family Account Owner
          </span>
        </div>
      </div>
      <div className="space-y-3 mb-8">
        <Button variant="outline" className="flex justify-between items-center w-full h-14 text-left">
          <div className="flex items-center">
            <Wallet className="w-5 h-5 mr-3 text-finpal-purple" />
            <span className="font-medium">Bank Accounts</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button variant="outline" className="flex justify-between items-center w-full h-14 text-left">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-3 text-finpal-purple" />
            <span className="font-medium">Family Members</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button variant="outline" className="flex justify-between items-center w-full h-14 text-left">
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-3 text-finpal-purple" />
            <span className="font-medium">Settings</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
      <div className="text-center">
        <Button
          variant="ghost"
          className="text-finpal-expense"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
        >
          Sign Out
        </Button>
      </div>
    </>
  );
};

export default Profile;