import { formatCurrency } from '../utils/formatters';
import { Transaction } from '../types';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

const TransactionItem = ({ transaction, onDelete }: TransactionItemProps) => {
  const isExpense = transaction.type === 'expense';
  
  return (
    <div className="transaction-item flex items-center p-4">
      <div 
        className="category-icon mr-3" 
        style={{ backgroundColor: transaction.category.color }}
      >
        <transaction.category.icon className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1">
        <p className="font-medium text-foreground">{transaction.title}</p>
        <p className="text-xs text-muted-foreground">{transaction.date}</p>
      </div>
      
      <p className={`font-semibold mr-4 ${isExpense ? 'text-finpal-expense' : 'text-finpal-income'}`}>
        {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
      </p>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(transaction.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default TransactionItem;