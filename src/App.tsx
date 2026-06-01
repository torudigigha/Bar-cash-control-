import React, { useState } from 'react';
import { DataProvider } from './context';
import { AppLayout } from './components/AppLayout';
import { DashboardView } from './components/views/DashboardView';
import { SalesView } from './components/views/SalesView';
import { InventoryView } from './components/views/InventoryView';
import { ExpensesView } from './components/views/ExpensesView';
import { DebtsView } from './components/views/DebtsView';
import { SuppliersView } from './components/views/SuppliersView';
import { ReportsView } from './components/views/ReportsView';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'sales':
        return <SalesView />;
      case 'inventory':
        return <InventoryView />;
      case 'expenses':
        return <ExpensesView />;
      case 'debts':
        return <DebtsView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
