import React from 'react';
import { LayoutDashboard, ReceiptText, Wine, Receipt, User, HelpCircle, BarChart3, Users, Building } from 'lucide-react';
import { cn } from '../utils';
import { useData } from '../context';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'New Sale', icon: ReceiptText },
  { id: 'inventory', label: 'Inventory', icon: Wine },
  { id: 'expenses', label: 'Expenses & salaries', icon: Receipt },
  { id: 'debts', label: 'Customer Debts', icon: Users },
  { id: 'suppliers', label: 'Supplier Ledger', icon: User },
  { id: 'reports', label: 'Reports & AI Insights', icon: BarChart3 },
];

const branches = [
  'Legend Lounge, Lagos',
  'Abuja Bistro (Wuse II)',
  'PH Club & Garden'
];

export function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps) {
  const { branch, setBranch } = useData();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-bar-900 border-r border-bar-800 flex flex-col transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="py-6 px-6 mb-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded gold-gradient flex items-center justify-center font-black text-bar-950">
              BC
            </div>
            <span className="font-sans font-bold text-xl tracking-tighter text-white uppercase">
              Bar Cash<span className="text-gold">Pro</span>
            </span>
          </div>
          <p className="text-[10px] text-white/30 tracking-[0.2em] mt-1 ml-1 uppercase">Nightlife Control System</p>
          <button onClick={onClose} className="lg:hidden absolute top-6 right-6 text-gray-400 hover:text-white">
            <X className="w-5 h-5 font-bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors cursor-pointer",
                    isActive 
                      ? "bg-gold-500/10 text-gold border-l-2 border-gold-500 font-semibold" 
                      : "text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                  )}
                >
                  <Icon className="w-5 h-5 text-current" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="glass-card bg-gold-500/5 p-4 border-gold">
            <div className="label-caps mb-1.5 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> Select Branch
            </div>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white outline-none w-full border-none cursor-pointer p-0"
            >
              {branches.map(b => (
                <option key={b} value={b} className="bg-bar-900 text-white text-xs">{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

// Inline export X for closing Mobile overlay so that it compiles gracefully
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
