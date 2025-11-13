import React, { useState, useEffect } from 'react';
import request from '../services/api';
import { Goal } from '../types';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { Target, PlusCircle, Edit, CheckCircle, AlertCircle } from 'lucide-react';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const GoalCard: React.FC<{ goal: Goal; onEdit: (goal: Goal) => void }> = ({ goal, onEdit }) => {
    const progress = (goal.savedAmount / goal.targetAmount) * 100;
    const isCompleted = goal.status === 'Completed';

    return (
        <Card className={`relative overflow-hidden ${isCompleted ? 'bg-green-50' : ''}`}>
            {isCompleted && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    <CheckCircle size={14} /> Completed
                </div>
            )}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-semibold">{goal.title}</h3>
                    <p className="text-sm text-slate-500">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(goal)} className="text-slate-500 hover:text-primary"><Edit size={18}/></button>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-slate-700">{formatCurrency(goal.savedAmount)}</span>
                    <span className="text-slate-500">Target: {formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                        className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
                <p className="text-right text-xs mt-1 font-semibold text-primary-dark">{progress.toFixed(1)}%</p>
            </div>
        </Card>
    );
};


const GoalsPage: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [formData, setFormData] = useState({ title: '', targetAmount: '', savedAmount: '', deadline: '' });

    const fetchGoals = async () => {
        try {
            const data = await request<Goal[]>('/api/goals');
            setGoals(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch goals.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const resetForm = () => {
        setShowForm(false);
        setEditingGoal(null);
        setFormData({ title: '', targetAmount: '', savedAmount: '', deadline: '' });
        setError('');
    };

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setFormData({
            title: goal.title,
            targetAmount: goal.targetAmount.toString(),
            savedAmount: goal.savedAmount.toString(),
            deadline: new Date(goal.deadline).toISOString().split('T')[0]
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleToggleNewGoalForm = () => {
        if (showForm && !editingGoal) {
            // Form is open for a new goal, so close it.
            resetForm();
        } else {
            // If form is closed, or open for editing, open it for a new goal.
            resetForm();
            setShowForm(true);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const apiData = {
            ...formData,
            targetAmount: parseFloat(formData.targetAmount),
            savedAmount: parseFloat(formData.savedAmount)
        };

        if (apiData.savedAmount > apiData.targetAmount) {
            setError('Saved amount cannot be greater than the target amount.');
            return;
        }

        try {
            if (editingGoal) {
                await request(`/api/goals/${editingGoal._id}`, { method: 'PUT', body: JSON.stringify(apiData) });
            } else {
                await request('/api/goals', { method: 'POST', body: JSON.stringify(apiData) });
            }
            resetForm();
            await fetchGoals();
        } catch (err: any) {
            setError(err.message || 'Failed to save goal.');
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Financial Goals</h1>
                <button onClick={handleToggleNewGoalForm} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <PlusCircle size={20} />
                    {showForm && !editingGoal ? 'Cancel' : 'New Goal'}
                </button>
            </div>
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg flex items-center justify-center gap-2"><AlertCircle/>{error}</p>}
            
            {showForm && (
                <Card>
                    <h2 className="text-xl font-semibold mb-4">{editingGoal ? 'Edit Goal' : 'Create a New Goal'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Goal Title (e.g., Vacation)" required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50"/>
                        <input type="number" name="targetAmount" min="0" value={formData.targetAmount} onChange={handleInputChange} placeholder="Target Amount (₹)" required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50"/>
                        <input type="number" name="savedAmount" min="0" value={formData.savedAmount} onChange={handleInputChange} placeholder="Saved Amount (₹)" required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50"/>
                        <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-50"/>
                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                            <button type="submit" className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-opacity">{editingGoal ? 'Update Goal' : 'Save Goal'}</button>
                        </div>
                    </form>
                </Card>
            )}

            {loading ? <Spinner /> : goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => <GoalCard key={goal._id} goal={goal} onEdit={handleEdit} />)}
                </div>
            ) : (
                <Card className="text-center py-12">
                     <Target className="mx-auto h-12 w-12 text-slate-400" />
                     <h3 className="mt-2 text-lg font-medium text-slate-900">No Goals Yet</h3>
                     <p className="mt-1 text-sm text-slate-500">Start by creating a new financial goal.</p>
                </Card>
            )}
        </div>
    );
};

export default GoalsPage;