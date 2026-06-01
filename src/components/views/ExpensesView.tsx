import React, { useState } from 'react';
import { useData } from '../../context';
import { formatCurrency } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { ExpenseCategory } from '../../types';

export function ExpensesView() {
  const { expenses, addExpense } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Miscellaneous');
  const [description, setDescription] = useState('');

  const categories: ExpenseCategory[] = [
    'Restocking', 'Supplier Payment', 'Staff Salary', 'DJ Payment', 
    'Electricity', 'Generator Fuel', 'Security', 'Rent', 'Maintenance', 
    'Transportation', 'Entertainment', 'Miscellaneous'
  ];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    addExpense({
      id: `e-${Date.now()}`,
      date: new Date().toISOString(),
      amount: Number(amount),
      category,
      description
    });

    setAmount('');
    setDescription('');
    setShowAddForm(false);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-display font-semibold text-white">Expenses</h2>
          <p className="text-gray-400 text-sm mt-1">Total recorded: {formatCurrency(totalExpenses)}</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Expense'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-bar-800 border-gold-500/30">
          <CardHeader>
            <CardTitle>Record New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Amount (₦)</label>
                <input 
                  type="number" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g. 5000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="What was this expense for?"
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <Button type="submit" className="w-full md:w-auto">Save Expense</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-bar-800 text-xs uppercase tracking-wider text-gray-500 bg-bar-900/50">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bar-800">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-bar-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded-md bg-bar-800 border border-bar-700 text-xs font-medium text-gray-300">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400">{expense.description || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-red-400">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No expenses recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
