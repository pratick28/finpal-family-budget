
import { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category: Category;
  description?: string;
}

export interface BudgetCategory {
  id: string;
  category: Category;
  limit: number;
  spent: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'member';
}

export interface Account {
  id: string;
  name: string;
  members: User[];
}
