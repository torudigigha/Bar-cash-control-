import React, { useState } from 'react';
import { useData } from '../../context';
import { formatCurrency } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { User, Smartphone, Send, Wallet, Search, Plus, Trash2, CheckCircle } from 'lucide-react';

export function DebtsView() {
  const { debts, addDebt, payDebt, activeStaff } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPayModal, setShowPayModal] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Debt Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  // Pay Debt Form State
  const [payAmount, setPayAmount] = useState('');

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || isNaN(Number(amount))) return;

    addDebt({
      id: `debt-${Date.now()}`,
      name,
      phone: phone || 'N/A',
      amount: Number(amount),
      lastUpdated: new Date().toISOString()
    });

    setName('');
    setPhone('');
    setAmount('');
    setShowAddForm(false);
  };

  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal || !payAmount || isNaN(Number(payAmount))) return;

    payDebt(showPayModal.id, Number(payAmount));
    setPayAmount('');
    setShowPayModal(null);
  };

  const filteredDebts = debts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone.includes(searchTerm)
  );

  const totalOwedDebts = debts.reduce((sum, d) => sum + d.amount, 0);

  // Generate a customized professional WhatsApp warning reminder
  const getWhatsAppLink = (debtorName: string, amountOwed: number, phone: string) => {
    const formattedAmount = formatCurrency(amountOwed);
    const message = `Hello ${debtorName}, this is a gentle reminder from Bar Cash Control Pro on behalf of Legend Lounge. We have an outstanding balance of ${formattedAmount} logged under your tab. Kindly make payment to complete reconciliation. Thank you for your patronage!`;
    const encodedText = encodeURIComponent(message);
    const standardDigits = phone.replace(/\D/g, '');
    const finalPhone = standardDigits.startsWith('0') ? '234' + standardDigits.slice(1) : standardDigits;
    return `https://wa.me/${finalPhone}?text=${encodedText}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-white">Customer Debtor Registry</h2>
          <p className="text-gray-400 text-sm mt-1">
            Total Outstanding Customer Debts: <span className="text-red-400 font-bold">{formatCurrency(totalOwedDebts)}</span>
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="cursor-pointer">
          {showAddForm ? 'Cancel' : 'Register New Debt / Tab'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-bar-800 border-gold-500/30">
          <CardHeader>
            <CardTitle>Open Bar Tab / Record Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDebt} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Debtor / Table Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g. Chief Princewell, Table 3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">WhatsApp / Phone Line</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g. 08033221144"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Initial Debt Amount (₦)</label>
                <input 
                  type="number" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g. 45000"
                />
              </div>
              <div className="md:col-span-3 pt-2">
                <Button type="submit" className="w-full md:w-auto">Open Tab</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Debt List */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4 max-w-md bg-bar-950/40 p-2 rounded-lg border border-bar-800">
          <Search className="w-4 h-4 text-gray-500 ml-2" />
          <input
            type="text"
            placeholder="Search debtor name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-bar-800 text-xs uppercase tracking-wider text-gray-500 bg-bar-900/50">
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">Contact line</th>
                <th className="px-6 py-4 font-medium">Last active date</th>
                <th className="px-6 py-4 font-medium text-right">Amount Owed</th>
                <th className="px-6 py-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bar-800">
              {filteredDebts.map((debtor) => (
                <tr key={debtor.id} className="hover:bg-bar-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center font-bold text-red-400">
                        {debtor.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">{debtor.name}</span>
                        <span className="text-[10px] text-gray-500">Premium lounge regular</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      <span>{debtor.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">
                      {format(new Date(debtor.lastUpdated), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-red-400">
                      {formatCurrency(debtor.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <Button 
                        onClick={() => setShowPayModal(debtor)}
                        className="py-1 px-3 text-xs bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer"
                      >
                        Clear Partial/Full
                      </Button>
                      <a 
                        href={getWhatsAppLink(debtor.name, debtor.amount, debtor.phone)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-black transition-colors"
                        title="Send WhatsApp Reminder"
                      >
                        <Send className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDebts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No matching debtors registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pay Debt Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-bar-900 border border-emerald-500/35 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Collect Payment - {showPayModal.name}</h3>
            <p className="text-xs text-gray-400 mb-4">
              Current Outstanding Balance: <span className="text-red-400 font-bold">{formatCurrency(showPayModal.amount)}</span>
            </p>

            <form onSubmit={handlePayDebt} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Amount Paid (₦)</label>
                <input 
                  type="number" 
                  required
                  max={showPayModal.amount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowPayModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-500 text-black hover:bg-emerald-400">Post Payment</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
