import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { StudyDetails } from './pages/StudyDetails';
import { FundingDetails } from './pages/FundingDetails';
import { FinancialProfile } from './pages/FinancialProfile';
import { CollateralPage } from './pages/Collateral';
import { DocumentsPage } from './pages/Documents';
import { AssessmentPage } from './pages/Assessment';
import { LenderComparison } from './pages/LenderComparison';
import { FundingGapPlanner } from './pages/FundingGapPlanner';
import { ReadinessSnapshot } from './pages/ReadinessSnapshot';
import { DocumentTracker } from './pages/DocumentTracker';
import { PrintableReport } from './components/PrintableReport';
import { AssessmentRecord } from './types';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [printableAssessment, setPrintableAssessment] = useState<AssessmentRecord | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Printable view override
  if (printableAssessment) {
    return (
      <PrintableReport
        assessment={printableAssessment}
        onBack={() => setPrintableAssessment(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="flex-1 pb-16">
        {currentTab === 'dashboard' && <Dashboard onNavigate={setCurrentTab} />}
        {currentTab === 'study' && <StudyDetails onSaved={() => {}} />}
        {currentTab === 'funding' && (
          <FundingDetails onNavigateToPlanner={() => setCurrentTab('gap-planner')} />
        )}
        {currentTab === 'financials' && <FinancialProfile />}
        {currentTab === 'collateral' && <CollateralPage />}
        {currentTab === 'documents' && <DocumentsPage />}
        {currentTab === 'assessment' && (
          <AssessmentPage onOpenReport={(a) => setPrintableAssessment(a)} />
        )}
        {currentTab === 'comparison' && <LenderComparison />}
        {currentTab === 'gap-planner' && <FundingGapPlanner />}
        {currentTab === 'readiness' && <ReadinessSnapshot />}
        {currentTab === 'doc-tracker' && <DocumentTracker />}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GradGuide Education Loan Assessment Engine • Production Hiring Assignment</span>
          <span className="text-slate-400">
            Certified reference data from BOI, BOB, SBI, Credila & Auxilo
          </span>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
