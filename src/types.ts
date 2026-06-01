export type PaymentMethod = 'Cash' | 'POS' | 'Bank Transfer';
export type SaleType = 'Table Order' | 'Bottle Sale' | 'Bulk Sale' | 'VIP Lounge';
export type DrinkCategory = 'Beer' | 'Spirits & Bitters' | 'Wine' | 'Non-Alcoholic' | 'Water & Mixers';

export interface Drink {
  id: string;
  name: string;
  category: DrinkCategory;
  price: number;
  stock: number; // in units
  minimumStock: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  items: { drinkId: string; quantity: number; price: number; name?: string }[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  saleType: SaleType;
  staffName: string;
}

export type ExpenseCategory =
  | 'Restocking'
  | 'Supplier Payment'
  | 'Staff Salary'
  | 'DJ Payment'
  | 'Electricity'
  | 'Generator Fuel'
  | 'Security'
  | 'Rent'
  | 'Maintenance'
  | 'Transportation'
  | 'Entertainment'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
}

export interface CashBalance {
  current: number;
  lastUpdated: string;
}

export interface CustomerDebt {
  id: string;
  name: string;
  phone: string;
  amount: number;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
  balanceOwed: number;
}

export interface CashAudit {
  id: string;
  date: string;
  systemAmount: number;
  physicalAmount: number;
  variance: number;
  note: string;
  loggedBy: string;
}
