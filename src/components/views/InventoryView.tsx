import React, { useState } from 'react';
import { useData } from '../../context';
import { formatCurrency } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertCircle, Plus, Search, Trash2, ArrowUpCircle, AlertTriangle, Edit2 } from 'lucide-react';
import { DrinkCategory, Drink } from '../../types';

export function InventoryView() {
  const { 
    drinks, 
    addDrink, 
    restockDrink, 
    flagDamagedOrMissing, 
    batchRestockDrinks, 
    suppliers, 
    addSupplierInvoice, 
    addExpense,
    deleteAllPrices,
    updateDrinkPrice
  } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<DrinkCategory | 'All'>('All');
  const [showDeleteAllPricesConfirm, setShowDeleteAllPricesConfirm] = useState(false);

  // Modal and form Toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeRestockDrink, setActiveRestockDrink] = useState<Drink | null>(null);
  const [activeLossDrink, setActiveLossDrink] = useState<Drink | null>(null);
  const [activeEditPriceDrink, setActiveEditPriceDrink] = useState<Drink | null>(null);

  // New Drink Form state
  const [newDrinkName, setNewDrinkName] = useState('');
  const [newDrinkCategory, setNewDrinkCategory] = useState<DrinkCategory>('Beer');
  const [newDrinkPrice, setNewDrinkPrice] = useState('');
  const [newDrinkStock, setNewDrinkStock] = useState('');
  const [newDrinkMinStock, setNewDrinkMinStock] = useState('');

  // Active inputs
  const [restockQty, setRestockQty] = useState('');
  const [lossQty, setLossQty] = useState('');
  const [lossReason, setLossReason] = useState('Damaged/Broken'); // or 'Missing'
  const [editPriceInput, setEditPriceInput] = useState('');

  // Batch restocking state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchUpdates, setBatchUpdates] = useState<Record<string, number>>({});
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [batchTotalCost, setBatchTotalCost] = useState<string>('');
  const [batchMemo, setBatchMemo] = useState<string>('');
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  const handleBatchQtyChange = (drinkId: string, value: string) => {
    const num = parseInt(value, 10);
    setBatchUpdates(prev => ({
      ...prev,
      [drinkId]: isNaN(num) || num < 0 ? 0 : num
    }));
  };

  const addShortcutQty = (drinkId: string, increment: number) => {
    setBatchUpdates(prev => {
      const current = prev[drinkId] || 0;
      return {
        ...prev,
        [drinkId]: current + increment
      };
    });
  };

  const clearBatchQty = (drinkId: string) => {
    setBatchUpdates(prev => {
      const next = { ...prev };
      delete next[drinkId];
      return next;
    });
  };

  const handleExecuteBatchRestock = (e: React.FormEvent) => {
    e.preventDefault();
    const updatesToSubmit = Object.entries(batchUpdates)
      .map(([drinkId, qty]) => ({ drinkId, quantityToAdd: Number(qty) }))
      .filter(u => u.quantityToAdd > 0);

    if (updatesToSubmit.length === 0) {
      alert('Please enter at least one positive restock quantity to perform batch updates.');
      return;
    }

    // Process bulk stock count updates
    batchRestockDrinks(updatesToSubmit);

    // Process linked financial parameters optionally
    const cost = Number(batchTotalCost) || 0;
    const itemsCount = updatesToSubmit.length;
    const descriptionText = batchMemo || `Bulk stocking of ${itemsCount} brands`;

    if (selectedSupplierId && selectedSupplierId !== '') {
      // Add balance owed to supplier as an invoice log
      addSupplierInvoice(selectedSupplierId, cost, descriptionText);
    } else if (cost > 0) {
      // Add cash purchase expense log directly
      addExpense({
        id: `e-batch-res-${Date.now()}`,
        date: new Date().toISOString(),
        category: 'Restocking',
        amount: cost,
        description: `Direct paid cash restock: ${descriptionText}`
      });
    }

    // Success notification
    const totalBottles = updatesToSubmit.reduce((sum, u) => sum + u.quantityToAdd, 0);
    setBatchSuccessMessage(`Successfully restocked ${totalBottles} bottles across ${itemsCount} products!`);
    setTimeout(() => {
      setBatchSuccessMessage(null);
    }, 5000);

    // Reset batch states
    setBatchUpdates({});
    setBatchTotalCost('');
    setSelectedSupplierId('');
    setBatchMemo('');
    setIsBatchMode(false);
  };

  const categories: (DrinkCategory | 'All')[] = ['All', 'Beer', 'Spirits & Bitters', 'Wine', 'Non-Alcoholic', 'Water & Mixers'];

  const filteredDrinks = drinks.filter(drink => {
    const matchesSearch = drink.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || drink.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddNewDrink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrinkName || !newDrinkPrice || !newDrinkStock) return;

    addDrink({
      id: `d-${Date.now()}`,
      name: newDrinkName,
      category: newDrinkCategory,
      price: Number(newDrinkPrice),
      stock: Number(newDrinkStock),
      minimumStock: newDrinkMinStock === '' ? 12 : Number(newDrinkMinStock)
    });

    setNewDrinkName('');
    setNewDrinkPrice('');
    setNewDrinkStock('');
    setNewDrinkMinStock('');
    setShowAddForm(false);
  };

  const handleExecuteRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRestockDrink || !restockQty || isNaN(Number(restockQty))) return;

    restockDrink(activeRestockDrink.id, Number(restockQty));
    setRestockQty('');
    setActiveRestockDrink(null);
  };

  const handleExecuteLoss = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLossDrink || !lossQty || isNaN(Number(lossQty))) return;

    flagDamagedOrMissing(activeLossDrink.id, Number(lossQty), lossReason === 'Damaged/Broken');
    setLossQty('');
    setActiveLossDrink(null);
  };

  const handleExecuteEditPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditPriceDrink || !editPriceInput || isNaN(Number(editPriceInput))) return;

    updateDrinkPrice(activeEditPriceDrink.id, Number(editPriceInput));
    setEditPriceInput('');
    setActiveEditPriceDrink(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder={isBatchMode ? "Search bulk worksheet..." : "Search drinks..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bar-900 border border-bar-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div className="flex w-full sm:w-auto items-center flex-wrap gap-3">
          <Button 
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              setShowAddForm(false);
            }} 
            variant={isBatchMode ? 'danger' : 'outline'}
            className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1.5 font-bold"
          >
            <ArrowUpCircle className="w-4 h-4 text-current" />
            {isBatchMode ? 'Exit Batch Mode' : 'Bulk Restock Matrix'}
          </Button>
          {!isBatchMode && (
            <>
              <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1.5 font-bold">
                <Plus className="w-4 h-4 text-current" />
                {showAddForm ? 'Cancel' : 'Add New Item'}
              </Button>
              <Button 
                onClick={() => setShowDeleteAllPricesConfirm(true)} 
                variant="outline"
                className="w-full sm:w-auto border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center justify-center gap-1.5 font-bold"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Prices
              </Button>
            </>
          )}
        </div>
      </div>

      {showDeleteAllPricesConfirm && (
        <Card className="bg-red-950/20 border border-red-500/30 overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Confirm Global Deletion of Prices</h4>
                <p className="text-xs text-gray-400 mt-1">This will instantly modify all {drinks.length} brands in the database, setting their unit selling price to <span className="text-red-400 font-bold">₦0.00</span>.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <Button 
                onClick={() => {
                  deleteAllPrices();
                  setShowDeleteAllPricesConfirm(false);
                }} 
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 w-full sm:w-auto"
              >
                Yes, Delete All Prices
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteAllPricesConfirm(false)} 
                className="text-xs px-4 py-2 w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {batchSuccessMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold rounded-lg animate-pulse">
          ✓ {batchSuccessMessage}
        </div>
      )}

      {showAddForm && (
        <Card className="bg-bar-800 border-gold-500/30">
          <CardHeader>
            <CardTitle>Register Custom Drink Stock Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNewDrink} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Name</label>
                <input 
                  type="text" 
                  required
                  value={newDrinkName}
                  onChange={(e) => setNewDrinkName(e.target.value)}
                  placeholder="e.g. Desperados"
                  className="w-full px-3 py-2 bg-bar-950 border border-bar-700 rounded text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Category</label>
                <select 
                  value={newDrinkCategory}
                  onChange={(e) => setNewDrinkCategory(e.target.value as DrinkCategory)}
                  className="w-full px-3 py-2 bg-bar-950 border border-bar-700 rounded text-white text-sm"
                >
                  <option value="Beer">Beer</option>
                  <option value="Spirits & Bitters">Spirits & Bitters</option>
                  <option value="Wine">Wine</option>
                  <option value="Non-Alcoholic">Non-Alcoholic</option>
                  <option value="Water & Mixers">Water & Mixers</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Price (₦)</label>
                <input 
                  type="number" 
                  required
                  value={newDrinkPrice}
                  onChange={(e) => setNewDrinkPrice(e.target.value)}
                  placeholder="Retail Price"
                  className="w-full px-3 py-2 bg-bar-950 border border-bar-700 rounded text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Stock Qty (Units)</label>
                <input 
                  type="number" 
                  required
                  value={newDrinkStock}
                  onChange={(e) => setNewDrinkStock(e.target.value)}
                  placeholder="Total bottles"
                  className="w-full px-3 py-2 bg-bar-950 border border-bar-700 rounded text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Min Alert Qty</label>
                <input 
                  type="number" 
                  value={newDrinkMinStock}
                  onChange={(e) => setNewDrinkMinStock(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full px-3 py-2 bg-bar-950 border border-bar-700 rounded text-white text-sm"
                />
              </div>

              <div className="md:col-span-5 pt-1.5">
                <Button type="submit" className="w-full md:w-auto">Add Brand</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category Pills (Normal mode only) */}
      {!isBatchMode && (
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat 
                  ? 'bg-gold-500 text-bar-950 font-bold' 
                  : 'bg-bar-800 text-gray-300 hover:bg-bar-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isBatchMode ? (
        <form onSubmit={handleExecuteBatchRestock} className="space-y-6">
          <Card className="border border-gold-500/20">
            <CardHeader className="bg-gradient-to-r from-bar-900 to-black p-5 border-b border-bar-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ArrowUpCircle className="w-5 h-5 text-gold animate-bounce" /> Bulk Restocking Grid Matrix
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-1">
                    Direct entry mass restocks. Standard Nigerian distribution crate presets (+12 & +24) are included.
                  </p>
                </div>
                <div className="bg-bar-950/70 py-1.5 px-3 rounded text-xs border border-white/5 flex items-center gap-2 text-gold">
                  <span className="font-bold">Matched Items:</span> {filteredDrinks.length} brands
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-bar-800 text-xs uppercase tracking-wider text-gray-500 bg-bar-900/30">
                      <th className="px-6 py-4 font-medium">Drink Brand</th>
                      <th className="px-6 py-4 font-medium text-center">Available Stock</th>
                      <th className="px-6 py-4 font-medium text-center">Restock Qty (Bottles)</th>
                      <th className="px-6 py-4 font-medium text-center">Crate Shortcuts</th>
                      <th className="px-6 py-4 font-medium text-right">Projected Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bar-800">
                    {filteredDrinks.map((drink) => {
                      const added = batchUpdates[drink.id] || 0;
                      const finalStock = drink.stock + added;
                      return (
                        <tr key={drink.id} className="hover:bg-bar-800/10">
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-white block">{drink.name}</span>
                            <span className="text-[10px] text-gray-500">{drink.category} &bull; {formatCurrency(drink.price)}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-gray-400">{drink.stock} units</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                min="0"
                                value={batchUpdates[drink.id] || ''}
                                onChange={(e) => handleBatchQtyChange(drink.id, e.target.value)}
                                placeholder="0"
                                className="w-20 px-2.5 py-1.5 bg-bar-950 border border-bar-700 rounded-lg text-white font-bold text-center focus:outline-none focus:border-gold-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={() => addShortcutQty(drink.id, 12)}
                                className="px-2 py-1 bg-bar-800 hover:bg-bar-700 border border-white/5 rounded text-[10px] text-gray-300 font-semibold cursor-pointer active:scale-95"
                                title="Add 1 Crate (12 Bottles)"
                              >
                                +12
                              </button>
                              <button
                                type="button"
                                onClick={() => addShortcutQty(drink.id, 24)}
                                className="px-2 py-1 bg-gold/10 hover:bg-gold/25 border border-gold-500/20 rounded text-[10px] text-gold font-bold cursor-pointer active:scale-95"
                                title="Add 2 Crates / Standard Pack (24 Bottles)"
                              >
                                +24
                              </button>
                              {added > 0 && (
                                <button
                                  type="button"
                                  onClick={() => clearBatchQty(drink.id)}
                                  className="px-2 py-1 bg-red-950/45 hover:bg-red-900/30 border border-red-500/20 rounded text-[10px] text-red-400 font-medium cursor-pointer"
                                  title="Reset count"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {added > 0 ? (
                              <div className="text-xs">
                                <span className="text-white/40 block line-through">{drink.stock}</span>
                                <span className="text-emerald-400 font-extrabold text-sm block">→ {finalStock} units</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">{drink.stock} units</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredDrinks.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No brands matched your search selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Ledger and Expenses Auto Integration */}
          <Card className="border border-white/5">
            <CardHeader className="bg-bar-900/40 p-5 border-b border-bar-800">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                💰 Purchase Accounting & Supplier Ledger Integration (Optional)
              </CardTitle>
              <p className="text-xs text-gray-400">
                Log the bulk purchase invoice against standard suppliers or write-down direct cash replenishment.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Link Supplier Ledger</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white text-xs focus:outline-none focus:border-gold-500"
                  >
                    <option value="">-- No Supplier (Paid cash or direct adjustment) --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Invoice Total Purchase Cost (₦)</label>
                  <input
                    type="number"
                    value={batchTotalCost}
                    onChange={(e) => setBatchTotalCost(e.target.value)}
                    placeholder="Input total invoice cost"
                    className="w-full px-3 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white text-xs focus:outline-none focus:border-gold-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Description / Memo</label>
                  <input
                    type="text"
                    value={batchMemo}
                    onChange={(e) => setBatchMemo(e.target.value)}
                    placeholder="e.g. Mass restocking delivery Heineken & Goldberg crates"
                    className="w-full px-3 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center bg-bar-900 border border-gold-500/10 rounded-xl p-5 gap-4">
            <div className="text-left">
              <span className="text-xs text-gray-300 uppercase font-extrabold tracking-wider block">Scheduled Restock Queue</span>
              <span className="text-lg font-bold text-white mt-1 block">
                Applying updates to <span className="text-gold">{(Object.values(batchUpdates) as number[]).filter(q => q > 0).length} unique brands</span> for a total of <span className="text-emerald-400">{(Object.values(batchUpdates) as number[]).reduce((sum, q) => sum + q, 0)} bottles</span>.
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto text-gray-300 cursor-pointer"
                onClick={() => {
                  setBatchUpdates({});
                  setBatchTotalCost('');
                  setSelectedSupplierId('');
                  setBatchMemo('');
                  setIsBatchMode(false);
                }}
              >
                Reset & Exit
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#b08e27] text-bar-950 font-black cursor-pointer shadow-lg active:scale-95"
              >
                Post Batch Replenishment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-bar-800 text-xs uppercase tracking-wider text-gray-500 bg-bar-900/50">
                  <th className="px-6 py-4 font-medium">Drink Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">In Stock</th>
                  <th className="px-6 py-4 font-medium text-center">Audits & Actions</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bar-800">
                {filteredDrinks.map((drink) => {
                  const isLowStock = drink.stock <= drink.minimumStock;
                  return (
                    <tr key={drink.id} className="hover:bg-bar-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{drink.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400 bg-bar-850 border border-white/5 py-1 px-2.5 rounded-full">{drink.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white">{formatCurrency(drink.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${isLowStock ? 'text-red-400' : 'text-gray-300'}`}>
                          {drink.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            onClick={() => {
                              setActiveEditPriceDrink(drink);
                              setEditPriceInput(drink.price.toString());
                            }}
                            variant="outline"
                            className="py-1 px-3 text-[10px] bg-transparent border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-black cursor-pointer flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Price
                          </Button>
                          <Button 
                            onClick={() => setActiveRestockDrink(drink)}
                            className="py-1 px-3 text-[10px] bg-gold text-bar-950 font-bold hover:bg-[#b08e27] cursor-pointer flex items-center gap-1"
                          >
                            <ArrowUpCircle className="w-3 h-3" /> Restock
                          </Button>
                          <Button 
                            onClick={() => setActiveLossDrink(drink)}
                            variant="outline"
                            className="py-1 px-3 text-[10px] bg-transparent border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Damage
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredDrinks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No drinks found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Restock dialog */}
      {activeRestockDrink && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-bar-900 border border-gold-500/35 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-1">
              <ArrowUpCircle className="w-5 h-5 text-gold" /> Restock Brand Units
            </h3>
            <p className="text-xs text-gray-400 mb-4">Adding stock to <span className="text-white font-semibold">{activeRestockDrink.name}</span></p>

            <form onSubmit={handleExecuteRestock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex justify-between">
                  <span>Quantity to Add (Bottles)</span>
                  <span className="text-gold font-normal">Currently: {activeRestockDrink.stock}</span>
                </label>
                <input 
                  type="number" 
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white font-bold"
                  placeholder="e.g. 24"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setActiveRestockDrink(null)}>Cancel</Button>
                <Button type="submit" className="bg-[#D4AF37] text-bar-950 font-bold hover:bg-[#b08e27]">Execute restock</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Loss/Damage dialog */}
      {activeLossDrink && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-bar-900 border border-red-500/35 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" /> Report Breakage / Wastage
            </h3>
            <p className="text-xs text-gray-400 mb-4">Deducting from <span className="text-white font-semibold">{activeLossDrink.name}</span></p>

            <form onSubmit={handleExecuteLoss} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-gray-300">Quantity (Units)</label>
                  <input 
                    type="number" 
                    required
                    max={activeLossDrink.stock}
                    value={lossQty}
                    onChange={(e) => setLossQty(e.target.value)}
                    className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white font-bold text-red-400"
                    placeholder="e.g. 2"
                  />
                </div>
                
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-gray-300">Discrepancy Cause</label>
                  <select
                    value={lossReason}
                    onChange={(e) => setLossReason(e.target.value)}
                    className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white text-xs"
                  >
                    <option value="Damaged/Broken">Damaged / Bottle Breakage</option>
                    <option value="Missing">Expired / Cork Taint wastage</option>
                    <option value="Theft">Stolen / Unaccounted loss</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setActiveLossDrink(null)}>Cancel</Button>
                <Button type="submit" className="bg-red-500 text-black hover:bg-red-400 font-bold">Write-off Stocks</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Price dialog */}
      {activeEditPriceDrink && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-bar-900 border border-blue-500/35 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-400" /> Update Price
            </h3>
            <p className="text-xs text-gray-400 mb-4">Setting new unit selling price for <span className="text-white font-semibold">{activeEditPriceDrink.name}</span></p>

            <form onSubmit={handleExecuteEditPrice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Unit Price (₦)</label>
                <input 
                  type="number" 
                  required
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(e.target.value)}
                  className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white font-bold text-blue-400"
                  placeholder="e.g. 1500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setActiveEditPriceDrink(null)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-500 font-bold">Save Price</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

