import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const familyId = searchParams.get('family');

  useEffect(() => {
    // If already logged in, redirect to home
    if (user) navigate('/');
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting registration process...');
      console.log('Family ID:', familyId);

      // Step 1: Sign up with Supabase Auth
      console.log('Step 1: Signing up with Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        console.error('Auth Error:', authError);
        throw authError;
      }
      console.log('Auth successful:', authData);

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      // Step 2: Create profile
      console.log('Step 2: Creating profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          family_id: familyId || authData.user.id,
          role: familyId ? 'member' : 'owner',
          status: familyId ? 'active' : 'active'
        });

      if (profileError) {
        console.error('Profile Creation Error:', profileError);
        // Try to get the profile to see if it was created
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        console.log('Profile check result:', { existingProfile, checkError });
        
        if (!existingProfile) {
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }
      }

      console.log('Registration completed successfully');
      toast({
        title: "Success",
        description: "Registration successful! You can now log in.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to register";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-background">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register</h1>
          <p className="text-muted-foreground">
            {familyId ? "Join your family's account" : "Create your FinPal account"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">First Name</label>
              <Input 
                type="text" 
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Last Name</label>
              <Input 
                type="text" 
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <Input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Password</label>
              <Input 
                type="password" 
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button 
              type="submit" 
              className="w-full bg-finpal-purple hover:bg-finpal-purple-dark"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-sm">Already have an account?</span>
            <Button variant="link" className="text-finpal-purple px-2" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 