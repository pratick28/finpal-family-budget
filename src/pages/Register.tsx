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
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If already logged in, redirect to home
    if (user) navigate('/');
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('=== Registration Debug ===');
    console.log('1. Form Data:', {
      email,
      firstName,
      lastName,
      hasPassword: !!password
    });

    if (!email || !password || !firstName || !lastName) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      
      console.log('2. Validation Failed:', { missingFields });
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Generate a new family ID if not joining an existing family
      

      // Step 1: Sign up with Supabase Auth
      console.log('4. Starting Supabase Auth Signup...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authError) {
        console.error('5. Auth Error:', {
          code: authError.code,
          message: authError.message,
          status: authError.status
        });

        // Handle specific error cases
        if (authError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        } else if (authError.message.includes('password')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (authError.message.includes('email')) {
          throw new Error('Please enter a valid email address.');
        } else {
          throw authError;
        }
      }

      console.log('6. Auth Response:', {
        hasUser: !!authData.user,
        userId: authData.user?.id,
        hasSession: !!authData.session
      });

      if (!authData.user) {
        console.error('7. No User Data Error');
        throw new Error('No user data returned from signup');
      }

     

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'owner',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('9. Profile Creation Error:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });

        // Handle specific profile errors
        if (profileError.code === '23505') { // Unique violation
          throw new Error('A profile with this email already exists.');
        } else if (profileError.code === '23503') { // Foreign key violation
          throw new Error('Invalid family ID provided.');
        } else {
          throw profileError;
        }
      }

      console.log('10. Profile Created Successfully');

      // Show confirmation message
      toast({
        title: 'Confirmation Required',
        description: 'Please check your email to confirm your account. After confirmation, you can log in.',
      });

      console.log('11. Registration Complete - Redirecting to Login');
      navigate('/login');
    } catch (error) {
      console.error('12. Registration Error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      console.log('=== Registration Debug End ===');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-background">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register</h1>
          <p className="text-muted-foreground">
            Create your FinPal account
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
            <Button
              variant="link"
              className="text-finpal-purple px-2"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
