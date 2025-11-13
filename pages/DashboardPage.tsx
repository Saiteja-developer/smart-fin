import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import request from '../services/api';
import { Transaction, AnalyticsData, PredictionData } from '../types';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [transData, predData] = await Promise.all([
            request<Transaction[]>('/api/transactions'),
            request<PredictionData>('/api/analytics/predict'),
        ]);
        
        setTransactions(transData);
        setPrediction(predData);

        const income = transData.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = transData.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        
        setAnalytics({
            incomeVsExpense: { income, expense },
            monthlyExpenses: [], // Placeholder, fetched in analytics page
            categoryExpenses: [] // Placeholder, fetched in analytics page
        });

      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: 'Total Flow', income: analytics?.incomeVsExpense.income || 0, expense: analytics?.incomeVsExpense.expense || 0 },
  ];

  if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;
  if (error) return <div className="text-center text-red-500 mt-10 bg-red-100 p-4 rounded-lg flex items-center justify-center gap-2"><AlertCircle/> {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.username || 'User'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign />
            </div>
            <div>
                <p className="text-sm text-slate-500">Total Income</p>
                <p className="text-2xl font-semibold">{formatCurrency(analytics?.incomeVsExpense.income || 0)}</p>
            </div>
        </Card>
        <Card className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
                <DollarSign />
            </div>
            <div>
                <p className="text-sm text-slate-500">Total Expense</p>
                <p className="text-2xl font-semibold">{formatCurrency(analytics?.incomeVsExpense.expense || 0)}</p>
            </div>
        </Card>
        <Card className="flex items-center space-x-4">
             <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <TrendingUp />
            </div>
            <div>
                <p className="text-sm text-slate-500">Next Month's Forecast</p>
                <p className="text-2xl font-semibold">{formatCurrency(prediction?.nextMonthPrediction || 0)}</p>
            </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Income vs. Expense</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {transactions.slice(0, 5).map(t => (
                        <tr key={t._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{t.title}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(t.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;