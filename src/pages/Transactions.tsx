
import { useState } from 'react';
import { transactions } from '../data/mockData';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Transactions = () => {
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const isMobile = useIsMobile();
  
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);
  
  return (
    <>
      <Header title="Transactions" />
      
      <div className="mb-4 w-full">
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Transactions;
