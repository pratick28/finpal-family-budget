import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '../integrations/supabase/client';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to home
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) navigate('/');
    };
    checkUser();
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Insert into profiles table
    const userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .insert({
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
        });
      if (profileError) {
        setError('Registered, but failed to save profile: ' + profileError.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-background">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register</h1>
          <p className="text-muted-foreground">Create your FinPal account</p>
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