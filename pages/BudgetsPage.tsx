import React, { useState, useEffect } from 'react';
import request from '../services/api';
import { Budget } from '../types';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { AlertCircle } from 'lucide-react';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const BudgetsPage: React.FC = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [newAmount, setNewAmount] = useState('');

  const fetchBudget = async (currentMonth: string) => {
    setLoading(true);
    setError('');
    setBudget(null);
    try {
      const data = await request<Budget>(`/api/budget?month=${currentMonth}`);
      setBudget(data);
      setNewAmount(data?.amount.toString() || '');
    } catch (err: any) {
       if (err.message.includes('not found')) {
        setBudget(null);
        setNewAmount('');
      } else {
        setError(err.message || 'Failed to fetch budget.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget(month);
  }, [month]);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await request('/api/budget', {
        method: 'POST',
        body: JSON.stringify({ month, amount: parseFloat(newAmount) }),
      });
      fetchBudget(month);
    } catch (err: any) {
      setError(err.message || 'Failed to set budget.');
    }
  };

  const progress = budget ? (budget.spent / budget.amount) * 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Monthly Budgets</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <label htmlFor="month-select" className="font-medium">Select Month:</label>
          <input
            type="month"
            id="month-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50"
          />
        </div>

        {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg flex items-center justify-center gap-2"><AlertCircle/>{error}</p>}
        {loading ? <Spinner /> : (
          <div>
            {budget ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Budget for {new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 text-sm font-medium">
                    <span className="text-slate-600">{formatCurrency(budget.spent)} spent</span>
                    <span className="text-slate-800">Budget: {formatCurrency(budget.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${progress > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-secondary'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  {progress > 100 && <p className="text-red-600 text-sm mt-2 font-medium">You've exceeded your budget!</p>}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No budget set for this month.</p>
            )}
            
            <form onSubmit={handleSetBudget} className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-medium mb-2">{budget ? 'Update' : 'Set'} Budget Amount</h3>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        placeholder="Enter budget amount"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        required
                        className="flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50"
                    />
                    <button type="submit" className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-opacity">
                        {budget ? 'Update Budget' : 'Set Budget'}
                    </button>
                </div>
            </form>

          </div>
        )}
      </Card>
    </div>
  );
};

export default BudgetsPage;