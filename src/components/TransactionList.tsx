import { useState } from 'react';
import { Transaction } from '../types';
import TransactionItem from './TransactionItem';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

const TransactionList = ({ transactions, title = "Transactions" }: TransactionListProps) => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);
  
  return (
    <div className="bg-white rounded-xl shadow-sm mb-6">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">{title}</h3>
        {transactions.length > 5 && (
          <Button 
            variant="link" 
            onClick={() => setShowAll(!showAll)} 
            className="text-sm text-finpal-purple px-0"
          >
            {showAll ? 'Show Less' : 'See All'}
          </Button>
        )}
      </div>
      
      <div className="divide-y divide-gray-100">
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <p className="p-4 text-center text-muted-foreground">No transactions found</p>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
