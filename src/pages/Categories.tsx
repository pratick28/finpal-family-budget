import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Edit, Trash, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const iconOptions = [
  'Folder', 'Home', 'Wallet', 'Coffee', 'ShoppingBag', 'Gift', 'PieChart', 'Utensils', 'Car', 'Wifi', 'Briefcase', 'CreditCard'
];
const colorOptions = [
  '#5E72E4', '#FF9F1C', '#11CDEF', '#FB6340', '#9B87F5', '#2DCE89', '#4CAF50', '#F5365C', '#ccc', '#7E69AB', '#FF5252', '#E5DEFF'
];

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', color: colorOptions[0], icon: iconOptions[0] });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

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
    if (accountId) fetchCategories();
  }, [accountId]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('account_id', accountId)
      .order('name');
    if (error) console.error(error);
    if (!error) setCategories(data);
    setLoading(false);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setError(null);
    if (!form.name) {
      setError('Name is required');
      return;
    }
    if (!accountId) {
      setError('No account found.');
      return;
    }
    const { error } = await (supabase as any)
      .from('categories')
      .insert({ name: form.name, color: form.color, icon: form.icon, account_id: accountId });
    if (error) setError(error.message);
    setForm({ name: '', color: colorOptions[0], icon: iconOptions[0] });
    fetchCategories();
  };

  const handleEdit = (cat: any) => {
    setEditId(cat.id);
    setForm({ name: cat.name, color: cat.color, icon: cat.icon });
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    if (!editId) return;
    const { error } = await (supabase as any)
      .from('categories')
      .update({ name: form.name, color: form.color, icon: form.icon })
      .eq('id', editId)
      .eq('account_id', accountId);
    if (error) setError(error.message);
    setEditId(null);
    setForm({ name: '', color: colorOptions[0], icon: iconOptions[0] });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any)
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId);
    fetchCategories();
  };

  return (
    <div className="container max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Folder /> Categories</h1>
      <form onSubmit={editId ? handleUpdate : handleAdd} className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2">
          <Input
            name="name"
            placeholder="Category name"
            value={form.name}
            onChange={handleChange}
          />
          <select name="color" value={form.color} onChange={handleChange} className="rounded px-2">
            {colorOptions.map(c => (
              <option key={c} value={c} style={{ background: c }}>{c}</option>
            ))}
          </select>
          <select name="icon" value={form.icon} onChange={handleChange} className="rounded px-2">
            {iconOptions.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full bg-finpal-purple hover:bg-finpal-purple-dark">
          {editId ? 'Update Category' : 'Add Category'}
        </Button>
        {editId && (
          <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm({ name: '', color: colorOptions[0], icon: iconOptions[0] }); }}>
            Cancel
          </Button>
        )}
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => {
            const Icon = LucideIcons[cat.icon] || LucideIcons.Folder;
            return (
              <div key={cat.id} className="flex items-center gap-3 bg-white rounded p-3 shadow-sm">
                <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: cat.color }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{cat.icon} | {cat.color}</div>
                  <div className="text-xs text-muted-foreground">Created: {cat.created_at ? new Date(cat.created_at).toLocaleString() : '-'}</div>
                  <div className="text-xs text-muted-foreground">Updated: {cat.updated_at ? new Date(cat.updated_at).toLocaleString() : '-'}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id)}><Trash className="w-4 h-4 text-red-500" /></Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories; 