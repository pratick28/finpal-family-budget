import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, Settings, ArrowRight, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '../integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: ''
  });
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
        setEditForm({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || ''
        });
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        first_name: editForm.first_name,
        last_name: editForm.last_name
      });
      
      setEditingProfile(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <>
        <Header title="Profile" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Profile" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-center text-red-600">
                <p className="font-medium">Error loading profile</p>
                <p className="text-sm mt-1">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header title="Profile" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-center">
                <p className="font-medium">No profile found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please contact support if this issue persists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Profile" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* User Profile Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Your Profile</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProfile(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-finpal-purple/10 flex items-center justify-center">
                <span className="text-finpal-purple font-bold text-lg">
                  {getInitials(profile.first_name, profile.last_name, profile.email)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.email
                  }
                </h2>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">Member Since</label>
                <p className="font-medium">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Last Updated</label>
                <p className="font-medium">{formatDate(profile.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="flex justify-between items-center w-full h-14 text-left"
              onClick={() => navigate('/bank-accounts')}
            >
              <div className="flex items-center">
                <Wallet className="w-5 h-5 mr-3 text-finpal-purple" />
                <span className="font-medium">Bank Accounts</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            <Button 
              variant="outline" 
              className="flex justify-between items-center w-full h-14 text-left"
              onClick={() => navigate('/settings')}
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-finpal-purple" />
                <span className="font-medium">Settings</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Sign Out */}
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              className="text-finpal-expense hover:text-finpal-expense/80"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">First Name</label>
              <Input
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Last Name</label>
              <Input
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                placeholder="Enter your last name"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <Input value={profile.email} disabled />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed from this page
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingProfile(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;