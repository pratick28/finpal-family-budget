
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
}

const BalanceCard = ({ balance, income, expenses }: BalanceCardProps) => {
  return (
    <div className="balance-card mb-6">
      <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
      <h2 className="text-3xl font-bold mb-5 relative z-10">{formatCurrency(balance)}</h2>
      
      <div className="flex justify-between relative z-10">
        <div className="flex items-center">
          <div className="bg-white/20 p-1 rounded-full mr-2">
            <ArrowUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/80">Income</p>
            <p className="text-sm font-medium">{formatCurrency(income)}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-white/20 p-1 rounded-full mr-2">
            <ArrowDown className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-white/80">Expenses</p>
            <p className="text-sm font-medium">{formatCurrency(expenses)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
