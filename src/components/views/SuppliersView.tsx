import React, { useState } from 'react';
import { useData } from '../../context';
import { formatCurrency } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Phone, Users, Wallet, Plus, CreditCard, Receipt, FileText } from 'lucide-react';

export function SuppliersView() {
  const { suppliers, addSupplier, paySupplier, addSupplierInvoice } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeInvoiceSupplier, setActiveInvoiceSupplier] = useState<any | null>(null);
  const [activePaymentSupplier, setActivePaymentSupplier] = useState<any | null>(null);

  // New Supplier form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Beers');
  const [balanceOwed, setBalanceOwed] = useState('');

  // Invoice form state
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('');

  // Payment form state
  const [payAmount, setPayAmount] = useState('');

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addSupplier({
      id: `sup-${Date.now()}`,
      name,
      phone: phone || 'N/A',
      category,
      balanceOwed: balanceOwed === '' ? 0 : Number(balanceOwed)
    });

    setName('');
    setPhone('');
    setCategory('Beers');
    setBalanceOwed('');
    setShowAddForm(false);
  };

  const handlePostInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoiceSupplier || !invoiceAmount || isNaN(Number(invoiceAmount))) return;

    addSupplierInvoice(activeInvoiceSupplier.id, Number(invoiceAmount), invoiceDesc || 'Stock Purchase');
    setInvoiceAmount('');
    setInvoiceDesc('');
    setActiveInvoiceSupplier(null);
  };

  const handlePostPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentSupplier || !payAmount || isNaN(Number(payAmount))) return;

    paySupplier(activePaymentSupplier.id, Number(payAmount));
    setPayAmount('');
    setActivePaymentSupplier(null);
  };

  const totalOwedSuppliers = suppliers.reduce((sum, s) => sum + s.balanceOwed, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-white">Supplier Ledgers</h2>
          <p className="text-gray-400 text-sm mt-1">
            Total Owed to Key Stock Distributors: <span className="text-gold font-bold">{formatCurrency(totalOwedSuppliers)}</span>
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="cursor-pointer">
          {showAddForm ? 'Cancel' : 'Register New Supplier'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-bar-800 border-gold-500/30">
          <CardHeader>
            <CardTitle>Register Distributor / Partner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSupplier} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Supplier Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g. Nigerian Breweries Plc"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Representative Phone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g. 08122334455"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Main Category Supplied</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="Beers & Malts">Beers & Malts</option>
                  <option value="Wine & Champagnes">Wine & Champagnes</option>
                  <option value="Stouts & Bitters">Stouts & Bitters</option>
                  <option value="Cognacs & Whiskey">Cognacs & Whiskey</option>
                  <option value="Non-Alcoholic/Energetics">Non-Alcoholic/Energetics</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Initial Debt Balance (₦)</label>
                <input 
                  type="number" 
                  value={balanceOwed}
                  onChange={(e) => setBalanceOwed(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="0 (Or previous ledger balance)"
                />
              </div>
              <div className="md:col-span-4 pt-2">
                <Button type="submit" className="w-full md:w-auto">Save Supplier details</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Distributors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suppliers.map(sup => (
          <Card key={sup.id} className="border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <span className="absolute top-0 right-0 py-1.5 px-3 rounded-bl-lg bg-gold/10 border-l border-b border-gold-500/20 text-[10px] text-gold font-semibold uppercase">{sup.category}</span>
            <CardContent className="p-5 flex flex-col justify-between h-full pt-8">
              <div>
                <h3 className="text-lg font-bold text-white block truncate">{sup.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-white/50 mt-1">
                  <Phone className="w-3 h-3" />
                  <span>{sup.phone}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="label-caps block text-[9px]">Looming Ledger Balance</span>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {formatCurrency(sup.balanceOwed)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6 pt-2">
                <Button 
                  onClick={() => setActiveInvoiceSupplier(sup)}
                  variant="outline"
                  className="py-1 px-3 text-xs flex items-center justify-center gap-1 bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 rounded cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" /> Log Invoice
                </Button>
                <Button 
                  onClick={() => setActivePaymentSupplier(sup)}
                  className="py-1 px-3 text-xs flex items-center justify-center gap-1 bg-[#D4AF37] hover:bg-[#b08e27] text-bar-950 font-bold rounded cursor-pointer"
                  disabled={sup.balanceOwed <= 0}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Pay Supplier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal - Log Invoice */}
      {activeInvoiceSupplier && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-bar-900 border border-gold-500/35 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-gold" /> Log Restock Invoice
            </h3>
            <p className="text-xs text-gray-400 mb-4">Add amount owed to partner: <span className="text-white font-semibold">{activeInvoiceSupplier.name}</span></p>

            <form onSubmit={handlePostInvoice} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Invoice Amount (₦)</label>
                <input 
                  type="number" 
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:border-gold-500"
                  placeholder="e.g. 500000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Description / Restock Details</label>
                <input 
                  type="text" 
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  placeholder="e.g. Heineken crates and Jameson VS Restock"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setActiveInvoiceSupplier(null)}>Cancel</Button>
                <Button type="submit" className="bg-[#D4AF37] text-bar-950 font-bold hover:bg-[#b08e27]">Credit Supplier Ledger</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal - Pay Supplier */}
      {activePaymentSupplier && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-bar-900 border border-emerald-500/35 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Pay Distributor
            </h3>
            <p className="text-xs text-gray-400 mb-4">Send payment to: <span className="text-white font-semibold">{activePaymentSupplier.name}</span></p>

            <form onSubmit={handlePostPayment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Paid Amount (₦)</label>
                <input 
                  type="number" 
                  required
                  max={activePaymentSupplier.balanceOwed}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 100000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setActivePaymentSupplier(null)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-500 text-black hover:bg-emerald-400">Post Payment & Deduct Debt</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
