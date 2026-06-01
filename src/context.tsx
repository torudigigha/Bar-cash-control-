import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Drink, Sale, Expense, CustomerDebt, Supplier, CashAudit } from './types';
import { INITIAL_DRINKS, INITIAL_SALES, INITIAL_EXPENSES } from './data';

interface DataContextType {
  drinks: Drink[];
  sales: Sale[];
  expenses: Expense[];
  debts: CustomerDebt[];
  suppliers: Supplier[];
  cashAudits: CashAudit[];
  branch: string;
  setBranch: (branch: string) => void;
  staff: string[];
  activeStaff: string;
  setActiveStaff: (staff: string) => void;
  addSale: (sale: Sale) => void;
  addExpense: (expense: Expense) => void;
  updateDrinkStock: (drinkId: string, quantitySold: number) => void;
  updateDrinkPrice: (drinkId: string, newPrice: number) => void;
  addDrink: (drink: Drink) => void;
  restockDrink: (drinkId: string, quantityToAdd: number) => void;
  flagDamagedOrMissing: (drinkId: string, quantity: number, isDamaged: boolean) => void;
  addDebt: (debt: CustomerDebt) => void;
  payDebt: (debtId: string, amountPaid: number) => void;
  addSupplier: (supplier: Supplier) => void;
  paySupplier: (supplierId: string, amountPaid: number) => void;
  addSupplierInvoice: (supplierId: string, amountOwed: number, description: string) => void;
  addCashAudit: (audit: CashAudit) => void;
  batchRestockDrinks: (updates: { drinkId: string; quantityToAdd: number }[]) => void;
  deleteAllPrices: () => void;
  clearFinancials: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Prefill default Nigerian premium data
const INITIAL_DEBTS: CustomerDebt[] = [
  { id: 'debt-1', name: 'Prince Jude (VIP Table 4)', phone: '08033221199', amount: 185000, lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'debt-2', name: 'Chief Emeka', phone: '08124567890', amount: 340000, lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'debt-3', name: 'Sola (Regular)', phone: '07038884422', amount: 15000, lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Nigerian Breweries Plc', phone: '08011223344', category: 'Beers & Malts', balanceOwed: 1200000 },
  { id: 'sup-2', name: 'Guinness Nigeria Distributors', phone: '08055667788', category: 'Stouts & Spirits', balanceOwed: 450000 },
  { id: 'sup-3', name: 'Grand Spirits Lagos Ltd', phone: '09012345678', category: 'Cognacs & Premium Wines', balanceOwed: 2500000 }
];

const INITIAL_AUDITS: CashAudit[] = [
  { id: 'aud-1', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), systemAmount: 340000, physicalAmount: 338000, variance: 2000, note: 'Shortage on Saturday night shift, cashier desk discrepancy.', loggedBy: 'Amaka' },
  { id: 'aud-2', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), systemAmount: 185000, physicalAmount: 185000, variance: 0, note: 'Matched perfectly', loggedBy: 'Chike' }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [drinks, setDrinks] = useState<Drink[]>(INITIAL_DRINKS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [debts, setDebts] = useState<CustomerDebt[]>(INITIAL_DEBTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [cashAudits, setCashAudits] = useState<CashAudit[]>(INITIAL_AUDITS);
  const [branch, setBranch] = useState('Legend Lounge, Lagos');
  const [activeStaff, setActiveStaff] = useState('Admin (Manager)');

  const staff = ['Admin (Manager)', 'Amaka (Attendant)', 'Chike (Barman)', 'Obi (Waiter)', 'Sola (Cashier)'];

  const addSale = (sale: Sale) => {
    setSales((prev) => [sale, ...prev]);
  };

  const addExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const updateDrinkStock = (drinkId: string, quantitySold: number) => {
    setDrinks((prev) =>
      prev.map((d) =>
        d.id === drinkId ? { ...d, stock: Math.max(0, d.stock - quantitySold) } : d
      )
    );
  };

  const updateDrinkPrice = (drinkId: string, newPrice: number) => {
    setDrinks((prev) =>
      prev.map((d) =>
        d.id === drinkId ? { ...d, price: newPrice } : d
      )
    );
  };

  const restockDrink = (drinkId: string, quantityToAdd: number) => {
    setDrinks((prev) =>
      prev.map((d) =>
        d.id === drinkId ? { ...d, stock: d.stock + quantityToAdd } : d
      )
    );
  };

  const flagDamagedOrMissing = (drinkId: string, quantity: number, isDamaged: boolean) => {
    setDrinks((prev) =>
      prev.map((d) =>
        d.id === drinkId ? { ...d, stock: Math.max(0, d.stock - quantity) } : d
      )
    );
    // Automatically log expense for wastage / damage cost
    setDrinks((prevCurrent) => {
      const drink = prevCurrent.find(d => d.id === drinkId);
      if (drink) {
        const estimatedCost = drink.price * 0.6 * quantity; // roughly cost price is 60% of retail
        addExpense({
          id: `e-loss-${Date.now()}`,
          date: new Date().toISOString(),
          category: 'Miscellaneous',
          amount: estimatedCost,
          description: `Loss/Damage Write-off: ${quantity} units of ${drink.name} (${isDamaged ? 'Damaged' : 'Missing'})`
        });
      }
      return prevCurrent;
    });
  };

  const addDrink = (drink: Drink) => {
    setDrinks((prev) => [drink, ...prev]);
  };

  const addDebt = (debt: CustomerDebt) => {
    setDebts((prev) => [debt, ...prev]);
  };

  const payDebt = (debtId: string, amountPaid: number) => {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId ? { ...d, amount: Math.max(0, d.amount - amountPaid), lastUpdated: new Date().toISOString() } : d
      ).filter(d => d.amount > 0) // if fully paid, optionally clear or display zero. Let's keep it and show zero/reduced.
    );
    // Record sale/cash inflow for debt payment
    addSale({
      id: `s-debt-${Date.now()}`,
      date: new Date().toISOString(),
      items: [],
      totalAmount: amountPaid,
      paymentMethod: 'Cash',
      saleType: 'Table Order',
      staffName: activeStaff + ' (Debt Payment Collected)'
    });
  };

  const addSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => [supplier, ...prev]);
  };

  const paySupplier = (supplierId: string, amountPaid: number) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId ? { ...s, balanceOwed: Math.max(0, s.balanceOwed - amountPaid) } : s
      )
    );
    // Record as supplier payment expense
    addExpense({
      id: `e-sup-${Date.now()}`,
      date: new Date().toISOString(),
      category: 'Supplier Payment',
      amount: amountPaid,
      description: `Payment to Supplier: ${suppliers.find(s => s.id === supplierId)?.name || 'Direct Supplier'}`
    });
  };

  const addSupplierInvoice = (supplierId: string, amountOwed: number, description: string) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId ? { ...s, balanceOwed: s.balanceOwed + amountOwed } : s
      )
    );
    // Log restocking expense
    addExpense({
      id: `e-restock-${Date.now()}`,
      date: new Date().toISOString(),
      category: 'Restocking',
      amount: amountOwed,
      description: `Restock Invoice (${description}): credited to Supplier debt.`
    });
  };

  const addCashAudit = (audit: CashAudit) => {
    setCashAudits((prev) => [audit, ...prev]);
  };

  const batchRestockDrinks = (updates: { drinkId: string; quantityToAdd: number }[]) => {
    setDrinks((prev) =>
      prev.map((d) => {
        const update = updates.find((u) => u.drinkId === d.id);
        return update ? { ...d, stock: d.stock + update.quantityToAdd } : d;
      })
    );
  };

  const deleteAllPrices = () => {
    setDrinks((prev) => prev.map((d) => ({ ...d, price: 0 })));
  };

  const clearFinancials = () => {
    setSales([]);
    setExpenses([]);
    setCashAudits([]);
  };

  return (
    <DataContext.Provider
      value={{
        drinks,
        sales,
        expenses,
        debts,
        suppliers,
        cashAudits,
        branch,
        setBranch,
        staff,
        activeStaff,
        setActiveStaff,
        addSale,
        addExpense,
        updateDrinkStock,
        updateDrinkPrice,
        addDrink,
        restockDrink,
        flagDamagedOrMissing,
        addDebt,
        payDebt,
        addSupplier,
        paySupplier,
        addSupplierInvoice,
        addCashAudit,
        batchRestockDrinks,
        deleteAllPrices,
        clearFinancials,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
