import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', color: '#9B87F5', icon: 'Wallet' });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get user's profile to get family_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Get all categories for the family
        const { data, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('family_id', profile.family_id)
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error instanceof Error ? error.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Get user's profile to get family_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('categories')
        .insert({ 
          name: form.name, 
          color: form.color, 
          icon: form.icon,
          user_id: user.id,
          family_id: profile.family_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category created successfully",
      });

      setForm({ name: '', color: '#9B87F5', icon: 'Wallet' });
      setOpen(false);
      // Refresh categories
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('name');
      setCategories(data || []);
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Header title="Categories" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Color</label>
                  <Input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Icon</label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Wallet">Wallet</option>
                    <option value="Home">Home</option>
                    <option value="ShoppingBag">Shopping</option>
                    <option value="Utensils">Food</option>
                    <option value="Car">Transport</option>
                    <option value="Wifi">Bills</option>
                    <option value="Gift">Gifts</option>
                    <option value="Briefcase">Work</option>
                    <option value="CreditCard">Finance</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">Create Category</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category.color + '20' }}
              >
                <Wallet className="w-5 h-5" style={{ color: category.color }} />
              </div>
              <span className="font-medium">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Categories; 