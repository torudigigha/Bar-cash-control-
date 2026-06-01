import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Bell, UserCheck } from 'lucide-react';
import { useData } from '../context';
import { format } from 'date-fns';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function AppLayout({ children, currentView, onNavigate }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { drinks, staff, activeStaff, setActiveStaff } = useData();

  const lowStockCount = drinks.filter(d => d.stock <= d.minimumStock).length;
  const todayFormatted = format(new Date(), 'EEEE, dd MMM');

  return (
    <div className="min-h-screen bg-bar-950 flex">
      <Sidebar 
        currentView={currentView} 
        onNavigate={onNavigate} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <header className="h-[88px] flex items-center justify-between px-6 lg:px-8 bg-transparent sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-gray-400 hover:text-white rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <span className="label-caps mb-1 hidden sm:block">
                {currentView === 'dashboard' ? <span className="text-gold">Welcome back, Admin &bull;</span> : 'Control Panel'} {currentView === 'dashboard' && todayFormatted}
              </span>
              <h2 className="text-2xl font-semibold tracking-tight capitalize text-white">
                {currentView === 'dashboard' ? 'Dashboard Overview' : currentView.replace(/([A-Z])/g, ' $1')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Cashier/Staff Duty Selector */}
             <div className="hidden md:flex items-center gap-1.5 p-1 py-0.5 rounded-full border border-white/5 bg-white/5">
                <span className="text-[9px] text-[#D4AF37] ml-2.5 uppercase font-extrabold tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Shift Line:
                </span>
                <select
                  value={activeStaff}
                  onChange={(e) => setActiveStaff(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white/80 border-none outline-none mr-2 cursor-pointer p-1"
                >
                  {staff.map(st => (
                    <option key={st} value={st} className="bg-bar-900 text-white text-xs">{st}</option>
                  ))}
                </select>
             </div>

             <div className="hidden sm:flex gap-3">
                <button 
                  onClick={() => onNavigate('sales')} 
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gold-500 text-black hover:bg-gold-400 cursor-pointer transition-all active:scale-95"
                >
                  Quick Sale
                </button>
             </div>
             
            <button className="relative w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              {lowStockCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
