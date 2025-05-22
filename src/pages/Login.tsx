import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }
    
    // For demo purposes, we'll just navigate to the dashboard
    // In a real app, you would integrate with Supabase auth here
    toast({
      title: "Success",
      description: "You have successfully logged in",
    });
    
    navigate('/');
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Registration failed. Please try again.",
      });
      return;
    }
    
    // For demo purposes, we'll just show a success toast
    // In a real app, you would integrate with Supabase auth here
    toast({
      title: "Account created",
      description: "You have successfully registered",
    });
    
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-background">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">FinPal</h1>
          <p className="text-muted-foreground">Family budget management made simple</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="text-right">
                  <Button variant="link" className="p-0 h-auto text-sm text-finpal-purple">
                    Forgot Password?
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-finpal-purple hover:bg-finpal-purple-dark"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
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
                <div className="text-xs text-muted-foreground">
                  By registering, you agree to our Terms of Service and Privacy Policy
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-finpal-purple hover:bg-finpal-purple-dark"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;