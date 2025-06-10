import { useEffect, useState } from 'react';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '../integrations/supabase/client';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

// Workaround: cast supabase to any because generated types are empty
const supabaseAny = supabase as any;

const Transactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch transactions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabaseAny
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTransactions(transactions.filter((t: any) => t.id !== id));
      toast({
        title: "Success",
        description: "Transaction deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
      });
    } finally {
      setTransactionToDelete(null);
    }
  };

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
        onDelete={(id) => setTransactionToDelete(id)}
      />

      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => transactionToDelete && handleDelete(transactionToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Transactions;
