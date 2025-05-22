import { formatCurrency } from '../utils/formatters';
import { Transaction } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const isExpense = transaction.type === 'expense';
  
  return (
    <div className="transaction-item">
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
      
      <p className={`font-semibold ${isExpense ? 'text-finpal-expense' : 'text-finpal-income'}`}>
        {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
      </p>
    </div>
  );
};

export default TransactionItem;