import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LogOut,
  UserCheck,
  LayoutDashboard,
  BookOpen,
  PiggyBank,
  Wallet,
  ShieldCheck,
  FileText,
  Scale,
  Sparkles,
  Sliders,
  CheckSquare
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'study', label: 'Study Details', icon: BookOpen },
    { id: 'funding', label: 'Funding', icon: PiggyBank },
    { id: 'financials', label: 'Net Worth', icon: Wallet },
    { id: 'collateral', label: 'Collateral', icon: ShieldCheck },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'assessment', label: 'Assessment', icon: Sparkles },
    { id: 'comparison', label: 'Lenders', icon: Scale },
    { id: 'gap-planner', label: 'Gap Planner', icon: Sliders, badge: 'Feature #1' },
    { id: 'readiness', label: 'Readiness', icon: Sparkles, badge: 'Feature #2' },
    { id: 'doc-tracker', label: 'Doc Tracker', icon: CheckSquare, badge: 'Feature #3' }
  ];

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">GradGuide</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  Loan Assessment
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Education Financing Decision Engine</p>
            </div>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200">{user.fullName}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>{user.role}</span>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-nav navigation pills */}
      <nav className="bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 py-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive
                        ? 'bg-blue-800 text-blue-100'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
