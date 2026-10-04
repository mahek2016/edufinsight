import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sliders, ArrowDown, Sparkles, CheckCircle2, RefreshCw, Calculator, Coins } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const FundingGapPlanner: React.FC = () => {
  const [totalStudyCost, setTotalStudyCost] = useState<number>(4500000);
  const [savings, setSavings] = useState<number>(600000);
  const [scholarship, setScholarship] = useState<number>(1000000);
  const [familyContribution, setFamilyContribution] = useState<number>(800000);
  const [feesAlreadyPaid, setFeesAlreadyPaid] = useState<number>(200000);

  const [savingToProfile, setSavingToProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [studyRes, fundingRes] = await Promise.all([
          api.getStudyPlan(),
          api.getFunding()
        ]);

        if (studyRes.studyPlan?.totalStudyCost) {
          setTotalStudyCost(studyRes.studyPlan.totalStudyCost);
        }

        if (fundingRes.fundingSource) {
          const fs = fundingRes.fundingSource;
          setSavings(fs.savings || 0);
          setScholarship(fs.scholarship || 0);
          setFamilyContribution(fs.familyContribution || 0);
          setFeesAlreadyPaid(fs.feesAlreadyPaid || 0);
        }
      } catch (err) {
        console.warn('Could not load planner defaults:', err);
      }
    }
    loadData();
  }, []);

  // Live Calculations
  const totalFunding = savings + scholarship + familyContribution + feesAlreadyPaid;
  const fundingGap = totalStudyCost - totalFunding;
  const estimatedLoanRequirement = Math.max(0, fundingGap);

  // EMI Estimate preview (assumes 10 year repayment at 8.95% average rate)
  const monthlyRate = 0.0895 / 12;
  const totalTenureMonths = 120;
  const estimatedMonthlyEmi =
    estimatedLoanRequirement > 0
      ? Math.round(
          (estimatedLoanRequirement * monthlyRate * Math.pow(1 + monthlyRate, totalTenureMonths)) /
            (Math.pow(1 + monthlyRate, totalTenureMonths) - 1)
        )
      : 0;

  const handleApplyToProfile = async () => {
    setSavingToProfile(true);
    try {
      await api.saveFunding({
        savings,
        scholarship,
        familyContribution,
        feesAlreadyPaid,
        otherFunding: 0
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to sync funding to profile:', err);
    } finally {
      setSavingToProfile(false);
    }
  };

  const waterfallData = [
    { step: 'Study Cost', amount: totalStudyCost, fill: '#1E3A8A' },
    { step: 'Scholarship', amount: -scholarship, fill: '#059669' },
    { step: 'Savings', amount: -savings, fill: '#10B981' },
    { step: 'Family Contrib', amount: -familyContribution, fill: '#34D399' },
    { step: 'Fees Paid', amount: -feesAlreadyPaid, fill: '#6EE7B7' },
    { step: 'Loan Required', amount: estimatedLoanRequirement, fill: '#2563EB' }
  ];

  const formatCurrency = (amt: number) => `₹${Math.round(amt).toLocaleString('en-IN')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Funding Gap Planner</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                Original Feature #1
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive simulator: Adjust scholarships and self-funding sources to see real-time borrowing impact.
            </p>
          </div>
        </div>

        <button
          onClick={handleApplyToProfile}
          disabled={savingToProfile}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{savingToProfile ? 'Applying...' : 'Apply Simulation to Profile'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Simulation values successfully saved to your master Funding Profile!</span>
        </div>
      )}

      {/* Waterfall Visualization & Live Metrics Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Capital Waterfall Breakdown</h3>
              <p className="text-xs text-slate-500">How each funding source chips away at the total education budget</p>
            </div>
            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {formatCurrency(totalFunding)} Self-Funded
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData}>
                <XAxis dataKey="step" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${Math.abs(v) / 100000}L`} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(Math.abs(val)), 'Impact']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[11px] text-slate-600 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-900"></span> Total Study Cost
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Self/Family Funding Reductions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Final Loan Requirement
            </span>
          </div>
        </div>

        {/* Live Calculation KPI Summary */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4" />
              <span>Real-Time Output</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Borrowing Impact</h3>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Program Cost:</span>
                <span className="font-semibold text-slate-200">{formatCurrency(totalStudyCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Self-Funded:</span>
                <span className="font-semibold text-emerald-400">{formatCurrency(totalFunding)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Net Funding Gap:</span>
                <span className="font-semibold text-amber-400">{formatCurrency(fundingGap)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 font-bold">
                <span className="text-blue-400">Loan Requirement:</span>
                <span className="text-blue-400">{formatCurrency(estimatedLoanRequirement)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 bg-slate-900/90 p-4 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Estimated Monthly Repayment (EMI)
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {formatCurrency(estimatedMonthlyEmi)} <span className="text-xs font-normal text-slate-400">/month</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Estimated indicative post-moratorium EMI based on 10-year repayment at ~8.95% p.a.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sliders Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Adjust Funding Variables</h3>
          <p className="text-xs text-slate-500">
            Slide each component to test how winning scholarships or contributing savings shrinks your required loan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Scholarship */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Scholarship / University Grant</span>
              <span className="text-emerald-700 font-bold">{formatCurrency(scholarship)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={totalStudyCost}
              step="50000"
              value={scholarship}
              onChange={(e) => setScholarship(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>Max: {formatCurrency(totalStudyCost)}</span>
            </div>
          </div>

          {/* Slider 2: Personal Savings */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Personal Savings Allocation</span>
              <span className="text-emerald-700 font-bold">{formatCurrency(savings)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={totalStudyCost}
              step="25000"
              value={savings}
              onChange={(e) => setSavings(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>Max: {formatCurrency(totalStudyCost)}</span>
            </div>
          </div>

          {/* Slider 3: Family Contribution */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Family / Parental Contribution</span>
              <span className="text-emerald-700 font-bold">{formatCurrency(familyContribution)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={totalStudyCost}
              step="25000"
              value={familyContribution}
              onChange={(e) => setFamilyContribution(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>Max: {formatCurrency(totalStudyCost)}</span>
            </div>
          </div>

          {/* Slider 4: Fees Already Paid */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Tuition Deposit Already Paid</span>
              <span className="text-emerald-700 font-bold">{formatCurrency(feesAlreadyPaid)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={totalStudyCost}
              step="10000"
              value={feesAlreadyPaid}
              onChange={(e) => setFeesAlreadyPaid(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>Max: {formatCurrency(totalStudyCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
