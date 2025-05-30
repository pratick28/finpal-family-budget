import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, Users, Settings, ArrowRight, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from '../integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  family_id: string;
  role: 'owner' | 'member';
  status: 'pending' | 'active';
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        console.log('Fetching profile for user:', user.id);
        
        // Fetch user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }
        
        console.log('Profile data:', profileData);
        setProfile(profileData);

        // Fetch all family members using service role
        console.log('Fetching family members for family_id:', profileData.family_id);
        const { data: familyData, error: familyError } = await supabase
          .rpc('get_family_members', { family_id: profileData.family_id });

        if (familyError) {
          console.error('Family members fetch error:', familyError);
          throw familyError;
        }
        
        console.log('Family members data:', familyData);
        setFamilyMembers(familyData || []);
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <>
      <Header title="Profile" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Email</label>
                <Input value={profile.email} disabled />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">First Name</label>
                <Input value={profile.first_name} disabled />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Last Name</label>
                <Input value={profile.last_name} disabled />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Role</label>
                <Input value={profile.role} disabled />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Family Members</h2>
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-finpal-purple/10 flex items-center justify-center">
                      <span className="text-finpal-purple font-medium">
                        {member.first_name?.[0] || member.email?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.first_name || member.email}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      member.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {member.status === 'pending' ? 'Pending' : 'Active'}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      member.role === 'owner' 
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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