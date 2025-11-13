import React, { useEffect, useState, useMemo } from 'react';
import request from '../services/api';
import { Transaction } from '../types';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { PlusCircle, AlertCircle, Edit } from 'lucide-react';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const TransactionRow: React.FC<{ transaction: Transaction, onEdit: (transaction: Transaction) => void }> = ({ transaction, onEdit }) => (
    <tr className="hover:bg-slate-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{transaction.title}</td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {transaction.type === 'expense' && '- '}{formatCurrency(transaction.amount)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{transaction.category}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString()}</td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button onClick={() => onEdit(transaction)} className="text-primary hover:text-primary-dark" aria-label={`Edit ${transaction.title}`}>
                <Edit size={18} />
            </button>
        </td>
    </tr>
);

const TransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState = {
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
    };

    const [newTransaction, setNewTransaction] = useState(initialFormState);

    const fetchTransactions = async () => {
        try {
            const data = await request<Transaction[]>('/api/transactions');
            setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch transactions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchTransactions();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTransaction(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setNewTransaction(initialFormState);
        setError('');
    };

    const handleAddNewClick = () => {
        setEditingId(null);
        setNewTransaction(initialFormState);
        setShowForm(true);
    };

    const handleEditClick = (transaction: Transaction) => {
        setEditingId(transaction._id);
        setNewTransaction({
            title: transaction.title,
            category: transaction.category,
            amount: transaction.amount.toString(),
            type: transaction.type,
            date: new Date(transaction.date).toISOString().split('T')[0],
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newTransaction.title.trim() || !newTransaction.category.trim()) {
            setError('Title and category are required.');
            return;
        }
        const amountValue = parseFloat(newTransaction.amount);
        if (isNaN(amountValue) || amountValue <= 0) {
            setError('Please enter a valid, positive amount.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await request(`/api/transactions/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ ...newTransaction, amount: amountValue }),
                });
            } else {
                 await request('/api/transactions', {
                    method: 'POST',
                    body: JSON.stringify({ ...newTransaction, amount: amountValue }),
                });
            }
            handleCancel();
            await fetchTransactions();
        } catch (err: any) {
            setError(err.message || `Failed to ${editingId ? 'update' : 'add'} transaction.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        if (filter === 'all') return transactions;
        return transactions.filter(t => t.type === filter);
    }, [transactions, filter]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Transactions</h1>
                <button onClick={showForm ? handleCancel : handleAddNewClick} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <PlusCircle size={20} />
                    {showForm && !editingId ? 'Cancel' : 'Add Transaction'}
                </button>
            </div>

            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg flex items-center justify-center gap-2"><AlertCircle/>{error}</p>}

            {showForm && (
                <Card>
                    <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit' : 'Add'} Transaction</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Title</label>
                                <input type="text" name="title" value={newTransaction.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50" placeholder="e.g., Coffee"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Category</label>
                                <input type="text" name="category" value={newTransaction.category} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50" placeholder="e.g., Food"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Amount (₹)</label>
                                <input type="number" name="amount" step="0.01" value={newTransaction.amount} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50" placeholder="0.00"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Type</label>
                                <select name="type" value={newTransaction.type} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50">
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Date</label>
                                <input type="date" name="date" value={newTransaction.date} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50"/>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                             <button type="button" onClick={handleCancel} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Add Transaction')}
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <div className="flex justify-end mb-4">
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-white shadow' : 'text-slate-600'}`}>All</button>
                        <button onClick={() => setFilter('income')} className={`px-3 py-1 text-sm font-medium rounded-md ${filter === 'income' ? 'bg-white shadow' : 'text-slate-600'}`}>Income</button>
                        <button onClick={() => setFilter('expense')} className={`px-3 py-1 text-sm font-medium rounded-md ${filter === 'expense' ? 'bg-white shadow' : 'text-slate-600'}`}>Expense</button>
                    </div>
                </div>

                {loading ? <Spinner/> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                                    <TransactionRow key={t._id} transaction={t} onEdit={handleEditClick} />
                                )) : <tr><td colSpan={5} className="text-center py-10 text-slate-500">No transactions found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TransactionsPage;