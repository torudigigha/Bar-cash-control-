import React, { useMemo, useState } from 'react';
import { useData } from '../../context';
import { formatCurrency, cn } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { TrendingUp, AlertTriangle, Wallet, ArrowDownRight, ArrowUpRight, Wine, Trash2 } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';

export function DashboardView() {
  const { drinks, sales, expenses, clearFinancials } = useData();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Metrics Calculations
  const totalSales = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const cashBalance = totalSales - totalExpenses;

  const today = new Date();
  const todaysSales = sales
    .filter(s => isSameDay(new Date(s.date), today))
    .reduce((acc, sale) => acc + sale.totalAmount, 0);

  const lowStockDrinks = drinks.filter(d => d.stock <= d.minimumStock);

  // Top Selling Drinks (by quantity)
  const drinkSalesCount = sales.flatMap(s => s.items).reduce((acc, item) => {
    acc[item.drinkId] = (acc[item.drinkId] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topDrinks = Object.entries(drinkSalesCount)
    .map(([id, quantity]) => ({
      drink: drinks.find(d => d.id === id),
      quantity
    }))
    .filter(item => item.drink)
    .sort((a, b) => (b.quantity as number) - (a.quantity as number))
    .slice(0, 5);

  // Revenue Trend (Last 7 days)
  const revenueData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const daySales = sales
        .filter(s => isSameDay(new Date(s.date), d))
        .reduce((acc, sale) => acc + sale.totalAmount, 0);
      data.push({
        name: format(d, 'MMM dd'),
        revenue: daySales
      });
    }
    return data;
  }, [sales, today]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm text-gray-400 font-medium">Real-time Performance Metrics</h3>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="outline"
            className="w-full sm:w-auto border-red-500/20 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Balances & Financial Logs
          </Button>
        </div>
      </div>

      {showResetConfirm && (
        <Card className="bg-red-950/20 border border-red-500/30 overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Confirm Reset of Financial Ledger</h4>
                <p className="text-xs text-gray-400 mt-1">
                  This will permanently delete all logged Sales transactions, Expenses registers, and Cash Audits. 
                  Your Cash Balance, Today's Sales, and Total Expenses will reset to <span className="text-red-400 font-bold">₦0.00</span>.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <Button 
                onClick={() => {
                  clearFinancials();
                  setShowResetConfirm(false);
                }} 
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 w-full sm:w-auto"
              >
                Yes, Delete All
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowResetConfirm(false)} 
                className="text-xs px-4 py-2 w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard 
          title="Cash Balance" 
          value={formatCurrency(cashBalance)} 
          icon={<Wallet className="text-gold-400" />}
          trend="+12%"
          trendUp={true}
        />
        <MetricCard 
          title="Today's Sales" 
          value={formatCurrency(todaysSales)} 
          icon={<TrendingUp className="text-green-400" />}
          trend="+5%"
          trendUp={true}
        />
        <MetricCard 
          title="Total Expenses" 
          value={formatCurrency(totalExpenses)} 
          icon={<ArrowDownRight className="text-red-400" />}
          trend="-2%"
          trendUp={false}
        />
        <MetricCard 
          title="Low Stock Alerts" 
          value={lowStockDrinks.length.toString()} 
          icon={<AlertTriangle className="text-amber-500" />}
          subtitle="Items need restocking"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>7-Day Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292929" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#525252" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#525252" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `₦${(val / 1000)}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#292929', borderRadius: '8px' }}
                    itemStyle={{ color: '#D4AF37' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#D4AF37" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Drinks OR Low Stock depending on priority */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fast Moving Drinks</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-bar-800">
                {topDrinks.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bar-800 flex items-center justify-center">
                        <Wine className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.drink?.name}</p>
                        <p className="text-xs text-gray-400">{item.drink?.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gold-300">{item.quantity} units</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, trendUp, subtitle }: any) {
  // Hardcode color treatment based on title to match design intent without altering App logic
  const isCash = title === 'Cash Balance';
  const isSales = title === "Today's Sales";
  const isExpenses = title === 'Total Expenses';
  const isAlerts = title === 'Low Stock Alerts';

  let valueColor = "text-white";
  if (isCash) valueColor = "text-gold";
  if (isExpenses) valueColor = "text-red-400";

  return (
    <Card className={cn(
      "flex flex-col justify-center border border-white/5",
      isCash && "border-l-4 border-l-[#D4AF37]"
    )}>
      <CardContent className="p-5">
        <span className="label-caps">{title}</span>
        <div className={cn("text-2xl font-mono font-bold tracking-tight mt-1", valueColor)}>
          {value}
        </div>
        {trend && (
          <div className={cn("text-[10px] mt-1", trendUp ? "text-green-500" : "text-red-400")}>
            {trendUp ? '▲' : '▼'} {trend} {subtitle && <span className="text-white/30 ml-1">{subtitle}</span>}
          </div>
        )}
        {!trend && subtitle && (
          <div className="text-[10px] text-white/30 mt-1">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}
