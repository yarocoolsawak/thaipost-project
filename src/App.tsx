import React, { useState } from 'react';
import { CaseProvider, useCases } from './context/CaseContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CentralQueue } from './components/central/CentralQueue';
import { AdminInbox } from './components/admin/AdminInbox';
import { CecWorkspace } from './components/cec/CecWorkspace';
import { BranchWorkspace } from './components/branch/BranchWorkspace';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';

const MainContent: React.FC = () => {
  const { role } = useCases();
  const [currentTab, setCurrentTab] = useState<'CASES' | 'DASHBOARD'>('CASES');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
          onOpenCreateCase={() => {
            setCurrentTab('CASES');
            setIsCreateModalOpen(true);
          }}
        />

        {/* Content Area */}
        <main className="content-area">
          {currentTab === 'DASHBOARD' ? (
            <AnalyticsDashboard />
          ) : role === 'CENTRAL' ? (
            <CentralQueue />
          ) : role === 'ADMIN' ? (
            <AdminInbox
              isCreateModalOpen={isCreateModalOpen}
              setIsCreateModalOpen={setIsCreateModalOpen}
            />
          ) : role === 'CEC' ? (
            <CecWorkspace />
          ) : (
            <BranchWorkspace />
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <CaseProvider>
      <MainContent />
    </CaseProvider>
  );
}

export default App;
