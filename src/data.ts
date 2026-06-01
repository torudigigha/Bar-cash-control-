import { Drink, Sale, Expense } from './types';
import { subDays, subHours } from 'date-fns';

export const INITIAL_DRINKS: Drink[] = [
  // BEERS
  { id: 'd1', name: 'Star Lager', category: 'Beer', price: 0, stock: 120, minimumStock: 48 },
  { id: 'd2', name: 'Heineken', category: 'Beer', price: 0, stock: 85, minimumStock: 48 },
  { id: 'd3', name: 'Trophy Lager', category: 'Beer', price: 0, stock: 150, minimumStock: 48 },
  { id: 'd4', name: 'Goldberg Lager', category: 'Beer', price: 0, stock: 90, minimumStock: 24 },
  { id: 'd5', name: 'Hero Lager', category: 'Beer', price: 0, stock: 110, minimumStock: 24 },
  { id: 'd6', name: 'Guinness Stout', category: 'Beer', price: 0, stock: 65, minimumStock: 24 },
  { id: 'd7', name: 'Smirnoff Ice', category: 'Beer', price: 0, stock: 45, minimumStock: 24 },
  
  // SPIRITS & BITTERS
  { id: 'd8', name: 'Orijin Bitters', category: 'Spirits & Bitters', price: 0, stock: 20, minimumStock: 12 },
  { id: 'd9', name: 'Action Bitters', category: 'Spirits & Bitters', price: 0, stock: 35, minimumStock: 12 },
  { id: 'd10', name: 'Hennessy VS', category: 'Spirits & Bitters', price: 0, stock: 8, minimumStock: 3 },
  { id: 'd11', name: 'Martell Blue Swift', category: 'Spirits & Bitters', price: 0, stock: 5, minimumStock: 2 },
  { id: 'd12', name: 'Jameson', category: 'Spirits & Bitters', price: 0, stock: 15, minimumStock: 5 },
  { id: 'd13', name: 'Jack Daniel’s', category: 'Spirits & Bitters', price: 0, stock: 12, minimumStock: 4 },
  { id: 'd14', name: 'Azul', category: 'Spirits & Bitters', price: 0, stock: 1, minimumStock: 1 },
  { id: 'd15', name: 'Captain Morgan', category: 'Spirits & Bitters', price: 0, stock: 22, minimumStock: 6 },
  
  // WINES
  { id: 'd16', name: 'Four Cousins', category: 'Wine', price: 0, stock: 30, minimumStock: 10 },
  { id: 'd17', name: 'Carlo Rossi', category: 'Wine', price: 0, stock: 25, minimumStock: 10 },
  { id: 'd18', name: 'Veleta', category: 'Wine', price: 0, stock: 40, minimumStock: 12 },
  
  // NON-ALC
  { id: 'd19', name: 'Maltina', category: 'Non-Alcoholic', price: 0, stock: 80, minimumStock: 24 },
  { id: 'd20', name: 'Coca-Cola', category: 'Non-Alcoholic', price: 0, stock: 150, minimumStock: 48 },
  { id: 'd21', name: 'Monster Energy', category: 'Non-Alcoholic', price: 0, stock: 40, minimumStock: 12 },
  
  // WATER/MIXERS
  { id: 'd22', name: 'Eva Water', category: 'Water & Mixers', price: 0, stock: 200, minimumStock: 50 },
  { id: 'd23', name: 'Schweppes Tonic', category: 'Water & Mixers', price: 0, stock: 60, minimumStock: 24 },
];

const now = new Date();

export const INITIAL_SALES: Sale[] = [
  // Today
  {
    id: 's1',
    date: subHours(now, 2).toISOString(),
    items: [{ drinkId: 'd10', quantity: 1, price: 85000 }, { drinkId: 'd20', quantity: 4, price: 800 }],
    totalAmount: 88200,
    paymentMethod: 'POS',
    saleType: 'VIP Lounge',
    staffName: 'Chike',
  },
  {
    id: 's2',
    date: subHours(now, 4).toISOString(),
    items: [{ drinkId: 'd2', quantity: 6, price: 2000 }, { drinkId: 'd6', quantity: 2, price: 1800 }],
    totalAmount: 15600,
    paymentMethod: 'Cash',
    saleType: 'Table Order',
    staffName: 'Amaka',
  },
  // Yesterday
  {
    id: 's3',
    date: subDays(now, 1).toISOString(),
    items: [{ drinkId: 'd12', quantity: 2, price: 35000 }],
    totalAmount: 70000,
    paymentMethod: 'Bank Transfer',
    saleType: 'Bottle Sale',
    staffName: 'Chike',
  },
  {
    id: 's4',
    date: subDays(now, 1).toISOString(),
    items: [{ drinkId: 'd1', quantity: 24, price: 1500 }],
    totalAmount: 36000,
    paymentMethod: 'POS',
    saleType: 'Bulk Sale',
    staffName: 'Obi',
  },
  // 2 days ago
  {
    id: 's5',
    date: subDays(now, 2).toISOString(),
    items: [{ drinkId: 'd8', quantity: 5, price: 2000 }, { drinkId: 'd19', quantity: 10, price: 1000 }],
    totalAmount: 20000,
    paymentMethod: 'Cash',
    saleType: 'Table Order',
    staffName: 'Amaka',
  },
  // 3 days ago
  {
    id: 's6',
    date: subDays(now, 3).toISOString(),
    items: [{ drinkId: 'd14', quantity: 1, price: 450000 }, { drinkId: 'd22', quantity: 10, price: 500 }],
    totalAmount: 455000,
    paymentMethod: 'Bank Transfer',
    saleType: 'VIP Lounge',
    staffName: 'Obi',
  },
  // 4 days ago
  {
    id: 's7',
    date: subDays(now, 4).toISOString(),
    items: [{ drinkId: 'd3', quantity: 12, price: 1200 }, { drinkId: 'd16', quantity: 2, price: 12000 }],
    totalAmount: 38400,
    paymentMethod: 'POS',
    saleType: 'Table Order',
    staffName: 'Chike',
  },
  // 5 days ago
  {
    id: 's8',
    date: subDays(now, 5).toISOString(),
    items: [{ drinkId: 'd15', quantity: 2, price: 18000 }, { drinkId: 'd20', quantity: 8, price: 800 }],
    totalAmount: 42400,
    paymentMethod: 'Cash',
    saleType: 'Bottle Sale',
    staffName: 'Amaka',
  },
  // 6 days ago
  {
    id: 's9',
    date: subDays(now, 6).toISOString(),
    items: [{ drinkId: 'd4', quantity: 20, price: 1200 }, { drinkId: 'd5', quantity: 20, price: 1200 }],
    totalAmount: 48000,
    paymentMethod: 'POS',
    saleType: 'Bulk Sale',
    staffName: 'Obi',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', date: subDays(now, 1).toISOString(), category: 'Generator Fuel', amount: 45000, description: '50 liters of diesel' },
  { id: 'e2', date: subDays(now, 2).toISOString(), category: 'DJ Payment', amount: 30000, description: 'Weekend DJ guest' },
  { id: 'e3', date: subDays(now, 3).toISOString(), category: 'Restocking', amount: 450000, description: 'Restocked Spirited and Beers from supplier' },
];
