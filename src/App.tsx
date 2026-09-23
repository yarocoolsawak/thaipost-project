import React, { useState } from 'react';
import { CaseProvider, useCases } from './context/CaseContext';
import { MyOrderProvider } from './context/MyOrderContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import type { AppTab } from './components/layout/Sidebar';
import { CentralQueue } from './components/central/CentralQueue';
import { CecWorkspace } from './components/cec/CecWorkspace';
import { BranchWorkspace } from './components/branch/BranchWorkspace';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { MerchantOrders } from './components/myorder/MerchantOrders';
import { MerchantCaseTracking } from './components/myorder/MerchantCaseTracking';
import { MyOrderAdminMonitor } from './components/myorder/MyOrderAdminMonitor';
import { MyOrderEmailLog } from './components/myorder/MyOrderEmailLog';
import { BulkReportModal } from './components/myorder/BulkReportModal';

const MainContent: React.FC = () => {
  const { role } = useCases();
  const [currentTab, setCurrentTab] = useState<AppTab>('CASES');
  const [isBulkReportOpen, setIsBulkReportOpen] = useState(false);

  // Each role lands on its own home page
  const [tabRole, setTabRole] = useState(role);
  if (tabRole !== role) {
    setTabRole(role);
    setCurrentTab(role === 'MERCHANT' ? 'ORDERS' : 'CASES');
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header />

      {/* Main Body */}
      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenBulkReport={() => setIsBulkReportOpen(true)}
        />

        {/* Content Area */}
        <main className="content-area">
          {role === 'MERCHANT' ? (
            currentTab === 'ORDERS' ? <MerchantOrders /> : <MerchantCaseTracking />
          ) : role === 'MYORDER_ADMIN' ? (
            currentTab === 'EMAILS' ? (
              <MyOrderEmailLog />
            ) : (
              <MyOrderAdminMonitor onOpenBulkReport={() => setIsBulkReportOpen(true)} />
            )
          ) : currentTab === 'DASHBOARD' ? (
            <AnalyticsDashboard />
          ) : role === 'CENTRAL' ? (
            <CentralQueue />
          ) : role === 'CEC' ? (
            <CecWorkspace />
          ) : (
            <BranchWorkspace />
          )}
        </main>
      </div>

      {isBulkReportOpen && role === 'MYORDER_ADMIN' && <BulkReportModal onClose={() => setIsBulkReportOpen(false)} />}
    </div>
  );
};

export function App() {
  return (
    <CaseProvider>
      <MyOrderProvider>
        <MainContent />
      </MyOrderProvider>
    </CaseProvider>
  );
}

export default App;
