import { useEffect, useState } from 'react';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '../integrations/supabase/client';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '@/lib/auth';

// Workaround: cast supabase to any because generated types are empty
const supabaseAny = supabase as any;

const Transactions = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get all transactions for the current user
        const { data, error } = await supabaseAny
          .from('transactions')
          .select(`
            *,
            category:category_id(*)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        setTransactions((data || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          amount: Number(t.amount),
          date: t.date,
          type: t.type,
          description: t.description,
          category: t.category ? {
            id: t.category.id,
            name: t.category.name,
            color: t.category.color,
            icon: LucideIcons[t.category.icon] || LucideIcons.Wallet
          } : {
            id: '', name: 'Unknown', color: '#ccc', icon: LucideIcons.Wallet
          }
        })));
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter((t: any) => t.type === filter);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header title="Transactions" />
      <div className="mb-4">
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <TransactionList 
        transactions={filteredTransactions}
        title={`${filter === 'all' ? 'All' : filter === 'expense' ? 'Expense' : 'Income'} Transactions`}
      />
    </>
  );
};

export default Transactions;
