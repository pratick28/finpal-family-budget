import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface FormData {
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

const AddTransaction = () => {
  const { user } = useAuth();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>();
  
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      setCategoriesLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('created_by_user_id', user.id)
          .order('name');
        
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      setError('You must be logged in to add a transaction.');
      return;
    }
    if (!data.category) {
      setError('Please select a category');
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          category_id: data.category,
          title: data.title,
          amount: data.amount,
          date: data.date,
          type,
          description: data.description,
        });

      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to create transaction');
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Add Transaction</h1>
        </div>
        <Tabs defaultValue="expense" className="w-full mb-6" onValueChange={(value) => setType(value as any)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
        </Tabs>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Title</label>
            <Input 
              {...register('title', { required: 'Title is required' })}
              placeholder="What did you spend on?"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Amount</label>
            <Input 
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be positive' }
              })}
              type="number"
              step="0.01"
              placeholder="0.00"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Category</label>
            {categoriesLoading ? (
              <div>Loading categories...</div>
            ) : (
              <Select onValueChange={val => setValue('category', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }} 
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Date</label>
            <Input 
              {...register('date', { required: 'Date is required' })}
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Description (Optional)</label>
            <Textarea 
              {...register('description')}
              placeholder="Add some notes..."
              className="resize-none"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full bg-finpal-purple hover:bg-finpal-purple-dark">
            Save Transaction
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
