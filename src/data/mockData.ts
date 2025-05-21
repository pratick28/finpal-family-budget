
import { 
  ShoppingBag, 
  Coffee, 
  Car, 
  Home, 
  Utensils, 
  Wifi,
  Briefcase,
  Gift,
  Wallet,
  CreditCard
} from 'lucide-react';
import { Transaction, Category, BudgetCategory } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Shopping',
    color: '#5E72E4',
    icon: ShoppingBag
  },
  {
    id: '2',
    name: 'Food & Drink',
    color: '#FF9F1C',
    icon: Coffee
  },
  {
    id: '3',
    name: 'Transportation',
    color: '#11CDEF',
    icon: Car
  },
  {
    id: '4',
    name: 'Housing',
    color: '#FB6340',
    icon: Home
  },
  {
    id: '5',
    name: 'Dining',
    color: '#9B87F5',
    icon: Utensils
  },
  {
    id: '6',
    name: 'Utilities',
    color: '#2DCE89',
    icon: Wifi
  },
  {
    id: '7',
    name: 'Income',
    color: '#4CAF50',
    icon: Briefcase
  },
  {
    id: '8',
    name: 'Gifts',
    color: '#F5365C',
    icon: Gift
  },
];

export const transactions: Transaction[] = [
  {
    id: '1',
    title: 'Paypal',
    amount: 1500,
    date: 'May 15, 2023',
    type: 'income',
    category: categories.find(c => c.id === '7') as Category
  },
  {
    id: '2',
    title: 'Uber',
    amount: 12.5,
    date: 'May 14, 2023',
    type: 'expense',
    category: categories.find(c => c.id === '3') as Category
  },
  {
    id: '3',
    title: 'Bata Store',
    amount: 89,
    date: 'May 12, 2023',
    type: 'expense',
    category: categories.find(c => c.id === '1') as Category
  },
  {
    id: '4',
    title: 'Bank Transfer',
    amount: 500,
    date: 'May 10, 2023',
    type: 'expense',
    category: categories.find(c => c.id === '5') as Category
  },
  {
    id: '5',
    title: 'Money Transfer',
    amount: 150,
    date: 'May 5, 2023',
    type: 'expense',
    category: categories.find(c => c.id === '5') as Category
  },
  {
    id: '6',
    title: 'Salary',
    amount: 2350,
    date: 'May 1, 2023',
    type: 'income',
    category: categories.find(c => c.id === '7') as Category
  }
];

export const budgetCategories: BudgetCategory[] = [
  {
    id: '1',
    category: categories.find(c => c.id === '1') as Category,
    limit: 300,
    spent: 280
  },
  {
    id: '2',
    category: categories.find(c => c.id === '2') as Category,
    limit: 250,
    spent: 180
  },
  {
    id: '3',
    category: categories.find(c => c.id === '3') as Category,
    limit: 150,
    spent: 85
  },
  {
    id: '4',
    category: categories.find(c => c.id === '5') as Category,
    limit: 200,
    spent: 220
  }
];

export const calculateTotalIncome = (): number => {
  return transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
};

export const calculateTotalExpenses = (): number => {
  return transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
};

export const calculateBalance = (): number => {
  return calculateTotalIncome() - calculateTotalExpenses();
};
