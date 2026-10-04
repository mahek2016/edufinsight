import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GraduationCap, ArrowRight, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role: 'student' | 'counsellor') => {
    if (role === 'student') {
      setEmail('student@gradguide.demo');
      setPassword('password123');
    } else {
      setEmail('counsellor@gradguide.demo');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center shadow-xl shadow-blue-500/20 mb-3">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">GradGuide</h2>
        <p className="mt-1 text-sm text-slate-400 font-medium">Education Loan Assessment & Lender Matching Engine</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/90 border border-slate-700/80 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold text-white">Sign In to Your Workspace</h3>
            <p className="text-xs text-slate-400 mt-1">Review funding requirements and explore dynamic lender criteria.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2">
              Assignment Reviewer Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-blue-500 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Fill Student Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('counsellor')}
                className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-emerald-500 transition-colors"
              >
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>Fill Counsellor</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Don't have an account yet? <span className="underline font-semibold">Create one</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
