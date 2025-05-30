import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Budget {
  category_id: string;
  limit_amount: number;
  month: string;
}

const Budget = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoriesAndBudgets = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      try {
        // Get user's profile to get family_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('family_id', profile.family_id)
          .order('name');

        // Fetch budgets for the selected month
        const { data: budgetData, error: budgetError } = await supabase
          .from('budget_categories')
          .select('*')
          .eq('family_id', profile.family_id)
          .eq('month', month + '-01');

        if (catError || budgetError) throw catError || budgetError;

        setCategories(catData || []);
        setBudgets(budgetData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndBudgets();
  }, [user, month]);

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find(b => b.category_id === categoryId)?.limit_amount || '';
  };

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgets(prev => {
      const exists = prev.find(b => b.category_id === categoryId);
      if (exists) {
        return prev.map(b => b.category_id === categoryId ? { ...b, limit_amount: Number(value) } : b);
      } else {
        return [...prev, { category_id: categoryId, limit_amount: Number(value), month: month + '-01' }];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    try {
      // Get user's profile to get family_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      for (const cat of categories) {
        const limit = budgets.find(b => b.category_id === cat.id)?.limit_amount;
        if (limit && !isNaN(Number(limit))) {
          // Upsert budget
          const { error } = await supabase
            .from('budget_categories')
            .upsert({
              family_id: profile.family_id,
              category_id: cat.id,
              month: month + '-01',
              limit_amount: Number(limit),
            }, { onConflict: 'family_id,category_id,month' });
          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Budgets saved successfully",
      });
    } catch (error) {
      console.error('Error saving budgets:', error);
      setError(error instanceof Error ? error.message : 'Failed to save budgets');
      toast({
        title: "Error",
        description: "Failed to save budgets",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title="Budget" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <label className="text-sm font-medium mr-2">Month:</label>
            <Input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="inline-block w-auto"
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 bg-white rounded p-3 shadow-sm">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: cat.color }}>
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{cat.name}</div>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Budget limit"
                      value={getBudgetForCategory(cat.id)}
                      onChange={e => handleBudgetChange(cat.id, e.target.value)}
                      className="w-32"
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" className="mt-6 w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save Budgets'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Budget; 