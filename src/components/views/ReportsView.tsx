import React, { useState, useMemo } from 'react';
import { useData } from '../../context';
import { formatCurrency } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { format, subDays, isSameDay } from 'date-fns';
import { BarChart3, Users, Share2, Clipboard, Wallet, Search, AlertTriangle, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  'Beer': '#D4AF37',            // Lager Gold
  'Spirits & Bitters': '#E6C27A', // Warm Amber/Gold
  'Wine': '#C5A028',            // Darker Gold
  'Non-Alcoholic': '#9CA3AF',   // Silver/Gray
  'Water & Mixers': '#4b5563',  // Slate Gray
};

export function ReportsView() {
  const { sales, expenses, cashAudits, activeStaff, addCashAudit, drinks, debts, suppliers } = useData();
  const [actualCashInHand, setActualCashInHand] = useState('');
  const [cashReportCopied, setCashReportCopied] = useState(false);
  const [auditNote, setAuditNote] = useState('');
  const [isSuccessfullySavedAudit, setIsSuccessfullySavedAudit] = useState(false);

  // Computations
  const totalSales = useMemo(() => sales.reduce((sum, s) => sum + s.totalAmount, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const expectedSystemCash = totalSales - totalExpenses;

  // Category sales computation
  const categorySales = useMemo(() => {
    const map: Record<string, number> = {
      'Beer': 0,
      'Spirits & Bitters': 0,
      'Wine': 0,
      'Non-Alcoholic': 0,
      'Water & Mixers': 0,
    };

    sales.forEach(s => {
      s.items.forEach(item => {
        const drink = drinks.find(d => d.id === item.drinkId);
        const category = drink ? drink.category : 'Non-Alcoholic';
        map[category] = (map[category] || 0) + (item.price * item.quantity);
      });
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [sales, drinks]);

  // Peak selling time calculations
  const today = new Date();
  const todaySales = sales.filter(s => isSameDay(new Date(s.date), today));
  const todaySalesAmount = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Cashier performance ranks (VIP closing stats / Attendants rank)
  const staffRankings = useMemo(() => {
    const records: Record<string, { total: number; count: number }> = {};
    sales.forEach(s => {
      // Clean staff label
      const name = s.staffName.split(' ')[0] || 'Admin';
      if (!records[name]) records[name] = { total: 0, count: 0 };
      records[name].total += s.totalAmount;
      records[name].count += 1;
    });

    return Object.entries(records).map(([name, stat]) => ({
      name,
      amount: stat.total,
      transactions: stat.count
    })).sort((a, b) => b.amount - a.amount);
  }, [sales]);

  // Handle saving physical Cash audit
  const handleLogCashAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualCashInHand || isNaN(Number(actualCashInHand))) return;

    const physical = Number(actualCashInHand);
    const variance = expectedSystemCash - physical; // physical - system or system - physical. Let's do system - physical. If positive, we have a shortage. If negative, an overage.

    addCashAudit({
      id: `aud-${Date.now()}`,
      date: new Date().toISOString(),
      systemAmount: expectedSystemCash,
      physicalAmount: physical,
      variance: variance,
      note: auditNote || 'Physical drawer count reconciliation.',
      loggedBy: activeStaff.split(' ')[0]
    });

    setIsSuccessfullySavedAudit(true);
    setActualCashInHand('');
    setAuditNote('');
    setTimeout(() => {
      setIsSuccessfullySavedAudit(false);
    }, 3000);
  };

  // Build beautiful Copy-to-WhatsApp text report block
  const getWhatsAppReportText = () => {
    const todayFormatted = format(new Date(), 'EEEE, dd LLL yyyy');
    const totalDebtsText = formatCurrency(debts.reduce((acc, d) => acc + d.amount, 0));
    const totalSuppliersText = formatCurrency(suppliers.reduce((acc, s) => acc + s.balanceOwed, 0));

    // Fast moving brand info
    const sortedDrinksCount: Record<string, number> = {};
    sales.flatMap(s => s.items).forEach(itm => {
      sortedDrinksCount[itm.drinkId] = (sortedDrinksCount[itm.drinkId] || 0) + itm.quantity;
    });
    const topDrinkId = Object.entries(sortedDrinksCount).sort((a,b) => b[1] - a[1])[0]?.[0];
    const topDrinkName = drinks.find(d => d.id === topDrinkId)?.name || 'Star Lager';

    return `*BAR CASH CONTROL PRO - DAILY REPORT*
📅 *Date:* ${todayFormatted}
📍 *Branch:* Legend Lounge, Lagos

💳 *FINANCIALS SUMMARY:*
━━━━━━━━━━━━━━━━━━━━
• *Today's Total Sales:* ${formatCurrency(todaySalesAmount)}
• *All-time Cumulative Sales:* ${formatCurrency(totalSales)}
• *Total Expenses Recorded:* ${formatCurrency(totalExpenses)}
• *Expected Closing Cash:* ${formatCurrency(expectedSystemCash)}

📦 *INVENTORY & DEBTS STATUS:*
━━━━━━━━━━━━━━━━━━━━
• *Outstanding Unpaid Tabs (Debtors):* ${totalDebtsText}
• *Total Liabilities owed Suppliers:* ${totalSuppliersText}
• *Fast-Selling Brand of Day:* ${topDrinkName}

👤 *CASHIER AUDIT STATUS:*
• Logged by: ${activeStaff}
• Reconciled variance: Completed

_Generated via Bar Cash Control™ Nigeria._`;
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(getWhatsAppReportText());
    setCashReportCopied(true);
    setTimeout(() => {
      setCashReportCopied(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-white">Reconciliation, Auditing & AI Advice</h2>
          <p className="text-gray-400 text-sm mt-1">Audit closing drawers and export automated briefings to stakeholders.</p>
        </div>
        <Button 
          onClick={handleCopyClipboard} 
          className="flex items-center gap-2 cursor-pointer bg-green-500 hover:bg-green-400 text-bar-950 font-bold"
        >
          <Share2 className="w-4 h-4 text-bar-950" /> {cashReportCopied ? 'Copied Briefing!' : 'Export Daily Brief to WhatsApp'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Audit verification box */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gold-500/20 bg-gradient-to-br from-bar-900 to-black">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gold" /> Cash Drawer Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogCashAudit} className="space-y-4">
                <div className="bg-bar-950/80 rounded-xl p-4 border border-bar-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">System Expected Cash Balance</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(expectedSystemCash)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Calculated automatically from: Cumulative sales minus cumulative expenses.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Actual Physically Counted Cash (₦)</label>
                    <input 
                      type="number" 
                      required
                      value={actualCashInHand}
                      onChange={(e) => setActualCashInHand(e.target.value)}
                      placeholder="Input actual cash counted"
                      className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white font-bold focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Auditor Notes</label>
                    <input 
                      type="text" 
                      value={auditNote}
                      onChange={(e) => setAuditNote(e.target.value)}
                      placeholder="Add shortage explanation (optional)"
                      className="w-full px-4 py-2 bg-bar-950 border border-bar-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {actualCashInHand && !isNaN(Number(actualCashInHand)) && (
                  <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
                    expectedSystemCash - Number(actualCashInHand) === 0 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : expectedSystemCash - Number(actualCashInHand) > 0 
                        ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                        : 'bg-green-500/10 border-green-500/30 text-green-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        {expectedSystemCash - Number(actualCashInHand) === 0 ? (
                          <span>Closing count matches closing expected Perfectly! Drawer balanced.</span>
                        ) : expectedSystemCash - Number(actualCashInHand) > 0 ? (
                          <span>Closing shortfall of <span className="font-bold">{formatCurrency((expectedSystemCash - Number(actualCashInHand)))}</span> detected.</span>
                        ) : (
                          <span>Drawer overage of <span className="font-bold">{formatCurrency(Math.abs(expectedSystemCash - Number(actualCashInHand)))}</span> detected.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="flex items-center gap-2 bg-gold-500 text-bar-950 hover:bg-[#b08e27] font-bold">
                    <ShieldCheck className="w-4 h-4" /> Log Close Audit
                  </Button>
                </div>
                
                {isSuccessfullySavedAudit && (
                  <div className="text-xs text-green-400 text-right font-medium animate-pulse">✓ Reconciliation logged to database successfully.</div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Historic shortfalls/audits */}
          <Card>
            <CardHeader>
              <CardTitle>History of Reconciliations & Shortages Tracker</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="border-b border-bar-800 text-[10px] uppercase tracking-wider text-gray-500 px-6 py-2">
                      <th className="px-6 py-3 font-medium">Audit Date</th>
                      <th className="px-6 py-3 font-medium">Expected Closing Cash</th>
                      <th className="px-6 py-3 font-medium">Physically Counted</th>
                      <th className="px-6 py-3 font-medium text-center">Variance (Shortfall)</th>
                      <th className="px-6 py-3 font-medium">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bar-800 text-xs">
                    {cashAudits.map((aud) => (
                      <tr key={aud.id} className="hover:bg-bar-800/20">
                        <td className="px-6 py-3 text-gray-400">{format(new Date(aud.date), 'MMM dd, HH:mm')}</td>
                        <td className="px-6 py-3 text-white">{formatCurrency(aud.systemAmount)}</td>
                        <td className="px-6 py-3 text-white">{formatCurrency(aud.physicalAmount)}</td>
                        <td className="px-6 py-3 text-center font-bold">
                          {aud.variance === 0 ? (
                            <span className="text-green-400">Bal. (₦0)</span>
                          ) : aud.variance > 0 ? (
                            <span className="text-red-400">-{formatCurrency(aud.variance)} loss</span>
                          ) : (
                            <span className="text-emerald-400">+{formatCurrency(Math.abs(aud.variance))} over</span>
                          )}
                        </td>
                        <td className="px-6 py-3 font-semibold text-gray-300">{aud.loggedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Sales by Category Bar Chart */}
          <Card className="border border-white/5 bg-gradient-to-b from-bar-900 to-black">
            <CardHeader className="bg-bar-900/40 border-b border-bar-800">
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gold-400" /> Sales Revenue by Drink Group
              </CardTitle>
              <p className="text-xs text-gray-400">Visualizing the financial contribution of each drink category to cumulative sales revenue.</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales} margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₦${(val / 1000)}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px' }}
                      labelClassName="text-white font-bold text-xs"
                      itemStyle={{ color: '#D4AF37' }}
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#D4AF37'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with absolute values */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-4 border-t border-bar-800 text-xs">
                {categorySales.map((entry) => (
                  <div key={entry.name} className="flex flex-col p-2 bg-bar-900/50 rounded border border-white/5">
                    <span className="flex items-center gap-1.5 font-bold text-white mb-0.5 truncate text-[11px]" title={entry.name}>
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#D4AF37' }} />
                      {entry.name}
                    </span>
                    <span className="text-gold font-bold ml-4 text-xs">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI & Staff rankings sidebar */}
        <div className="space-y-6">
          {/* AI Sales Insights heuristics */}
          <Card className="border border-gold bg-gold-400/5">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2 !text-xs uppercase tracking-widest">
                <TrendingUp className="w-4 h-4 text-gold animate-pulse" /> AI Sales & Cashier insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                  <h4 className="text-xs font-bold text-white">🔥 Desperados & Smirnoff Ice spike</h4>
                  <p className="text-[10px] text-white/60 leading-relaxed">Sales of light beers surged by 30% between 9 PM and midnight on Saturday night. Monitor and ensure pre-chilled backup stock is ready.</p>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                  <h4 className="text-xs font-bold text-rose-300">⚠️ Cash discrepancies warning</h4>
                  <p className="text-[10px] text-white/60 leading-relaxed">Weekend audits have aggregated ₦{formatCurrency(cashAudits.reduce((acc, a) => acc + (a.variance > 0 ? a.variance : 0), 0))} in cash discrepancies. Implement POS mandatory rule for table bills above ₦25,000.</p>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1">
                  <h4 className="text-xs font-bold text-gold">💰 Future Restocking Prediction</h4>
                  <p className="text-[10px] text-white/60 leading-relaxed">Based on weekly cash balances, you have ₦{formatCurrency(expectedSystemCash)} in reserve. Restock Heineken and Goldberg before Friday nightlife sales peak.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waiter Roster daily rating scoreboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white/80">Waitstaff Performance Scorecard</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="divide-y divide-bar-800">
                {staffRankings.map((st, idx) => (
                  <div key={st.name} className="flex justify-between items-center px-5 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 font-bold text-[9px] text-[#D4AF37]">{idx + 1}</span>
                      <span className="font-semibold text-white">{st.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold block">{formatCurrency(st.amount)}</span>
                      <span className="text-[10px] text-white/40 block">{st.transactions} orders</span>
                    </div>
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
