import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const Budget = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: memberships } = await (supabase as any)
        .from('account_members')
        .select('account_id')
        .eq('user_id', user.id)
        .limit(1);
      if (memberships && memberships.length > 0) {
        setAccountId(memberships[0].account_id);
      }
    };
    fetchAccount();
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchCategoriesAndBudgets();
    }
    // eslint-disable-next-line
  }, [accountId, month]);

  const fetchCategoriesAndBudgets = async () => {
    setLoading(true);
    setError(null);
    // Fetch categories
    const { data: catData, error: catError } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('account_id', accountId)
      .order('name');
    // Fetch budgets for the selected month
    const { data: budgetData, error: budgetError } = await (supabase as any)
      .from('budget_categories')
      .select('*')
      .eq('account_id', accountId)
      .eq('month', month + '-01');
    if (catError || budgetError) setError(catError?.message || budgetError?.message);
    setCategories(catData || []);
    setBudgets(budgetData || []);
    setLoading(false);
  };

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find((b: any) => b.category_id === categoryId)?.limit_amount || '';
  };

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgets(prev => {
      const exists = prev.find((b: any) => b.category_id === categoryId);
      if (exists) {
        return prev.map((b: any) => b.category_id === categoryId ? { ...b, limit_amount: value } : b);
      } else {
        return [...prev, { category_id: categoryId, limit_amount: value, account_id: accountId, month: month + '-01' }];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    for (const cat of categories) {
      const limit = budgets.find((b: any) => b.category_id === cat.id)?.limit_amount;
      if (limit && !isNaN(Number(limit))) {
        // Upsert budget
        const { error } = await (supabase as any)
          .from('budget_categories')
          .upsert({
            account_id: accountId,
            category_id: cat.id,
            month: month + '-01',
            limit_amount: Number(limit),
          }, { onConflict: 'account_id,category_id,month' });
        if (error) setError(error.message);
      }
    }
    setSaving(false);
    fetchCategoriesAndBudgets();
  };

  return (
    <div className="container max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Folder /> Set Budgets</h1>
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
            {categories.map(cat => {
              const Icon = LucideIcons[cat.icon] || LucideIcons.Folder;
              return (
                <div key={cat.id} className="flex items-center gap-3 bg-white rounded p-3 shadow-sm">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: cat.color }}>
                    <Icon className="w-5 h-5 text-white" />
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
              );
            })}
          </div>
          <Button type="submit" className="mt-6 w-full bg-finpal-purple hover:bg-finpal-purple-dark" disabled={saving}>
            {saving ? 'Saving...' : 'Save Budgets'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default Budget; 