import { useEffect, useState } from 'react';
import Header from '../components/Header';
import BalanceCard from '../components/BalanceCard';
import TransactionList from '../components/TransactionList';
import BudgetProgress from '../components/BudgetProgress';
import { supabase } from '../integrations/supabase/client';
import * as LucideIcons from 'lucide-react';


// Workaround: cast supabase to any because generated types are empty
const supabaseAny = supabase as any;

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabaseAny
        .from('transactions')
        .select('*, category:category_id(*)')
        .order('date', { ascending: false });
      // Fetch budget categories
      const { data: budgetData, error: budgetError } = await supabaseAny
        .from('budget_categories')
        .select('*, category:category_id(*)');
      if (transactionsError || budgetError) {
        // Handle error (could show a toast or error message)
        setLoading(false);
        return;
      }
      // Map transactions to UI type
      setTransactions((transactionsData || []).map((t: any) => ({
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
      // Map budget categories to UI type
      setBudgetCategories((budgetData || []).map((b: any) => ({
        id: b.id,
        category: b.category ? {
          id: b.category.id,
          name: b.category.name,
          color: b.category.color,
          icon: LucideIcons[b.category.icon] || LucideIcons.Wallet
        } : {
          id: '', name: 'Unknown', color: '#ccc', icon: LucideIcons.Wallet
        },
        limit: Number(b.limit_amount),
        spent: 0 // You may want to calculate this from transactions
      })));
      setLoading(false);
    };
    fetchData();
  }, []);

  // Calculate balance, income, expenses from transactions
  const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : t.type === 'expense' ? acc - Number(t.amount) : acc, 0);
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  
  // Calculate overall budget progress
  const totalBudget = budgetCategories.reduce((acc, budget) => acc + Number(budget.limit), 0);
  const totalSpent = budgetCategories.reduce((acc, budget) => acc + Number(budget.spent), 0);

  if (loading) return <div>Loading...</div>;
  
  return (
    <>
      <Header />
      
      <BalanceCard 
        balance={balance}
        income={income}
        expenses={expenses}
      />
      
      <BudgetProgress 
        current={totalSpent}
        max={totalBudget}
        label="Monthly Budget"
      />
      
      <TransactionList transactions={transactions} />
    </>
  );
};

export default Dashboard;
