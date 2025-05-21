
import Header from '../components/Header';
import BalanceCard from '../components/BalanceCard';
import TransactionList from '../components/TransactionList';
import BudgetProgress from '../components/BudgetProgress';
import { 
  transactions, 
  budgetCategories, 
  calculateBalance, 
  calculateTotalIncome, 
  calculateTotalExpenses 
} from '../data/mockData';

const Dashboard = () => {
  const balance = calculateBalance();
  const income = calculateTotalIncome();
  const expenses = calculateTotalExpenses();
  
  // Calculate overall budget progress
  const totalBudget = budgetCategories.reduce((acc, budget) => acc + budget.limit, 0);
  const totalSpent = budgetCategories.reduce((acc, budget) => acc + budget.spent, 0);
  
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
