
export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  user: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  title: string;
  date: string;
}

export interface Goal {
  _id: string;
  user: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  status: 'In Progress' | 'Completed';
}

export interface Budget {
  _id: string;
  user: string;
  month: string;
  amount: number;
  spent: number;
}

export interface AnalyticsData {
  monthlyExpenses: { month: string; total: number }[];
  categoryExpenses: { category: string; total: number }[];
  incomeVsExpense: { income: number; expense: number };
}

export interface PredictionData {
    nextMonthPrediction: number;
}