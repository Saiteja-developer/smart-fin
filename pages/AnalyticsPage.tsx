import React, { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import request from '../services/api';
import { Transaction, PredictionData } from '../types';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { AlertCircle, TrendingUp } from 'lucide-react';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const AnalyticsPage: React.FC = () => {
    const [monthlyExpenses, setMonthlyExpenses] = useState<{ name: string, expense: number }[]>([]);
    const [categoryExpenses, setCategoryExpenses] = useState<{ name: string, value: number }[]>([]);
    const [prediction, setPrediction] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const [transactions, predData] = await Promise.all([
                    request<Transaction[]>('/api/transactions'),
                    request<PredictionData>('/api/analytics/predict'),
                ]);

                setPrediction(predData);

                const expenses = transactions.filter(t => t.type === 'expense');

                // Process monthly expenses
                const monthlyData: { [key: string]: number } = {};
                expenses.forEach(t => {
                    const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
                    if (!monthlyData[month]) monthlyData[month] = 0;
                    monthlyData[month] += t.amount;
                });
                
                // sort monthly data
                const sortedMonthly = Object.entries(monthlyData)
                    .map(([month, expense]) => ({ name: month, expense }))
                    .sort((a, b) => new Date(`1 ${a.name.replace("'", " ")}`).getTime() - new Date(`1 ${b.name.replace("'", " ")}`).getTime());
                setMonthlyExpenses(sortedMonthly);

                // Process category expenses
                const categoryData: { [key: string]: number } = {};
                expenses.forEach(t => {
                    const category = t.category || 'Uncategorized';
                    if (!categoryData[category]) categoryData[category] = 0;
                    categoryData[category] += t.amount;
                });
                setCategoryExpenses(Object.entries(categoryData).map(([name, value]) => ({ name, value })));

            } catch (err: any) {
                setError(err.message || 'Failed to fetch analytics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 mt-10 bg-red-100 p-4 rounded-lg flex items-center justify-center gap-2"><AlertCircle/>{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Financial Analytics</h1>

            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-white/20">
                        <TrendingUp />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Next Month's Expense Forecast</h2>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(prediction?.nextMonthPrediction || 0)}</p>
                        <p className="text-sm opacity-80">Based on your recent spending habits.</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Monthly Spending Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyExpenses}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="expense" stroke="#4f46e5" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryExpenses} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {categoryExpenses.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip formatter={(value: number) => formatCurrency(value)} />
                             <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;