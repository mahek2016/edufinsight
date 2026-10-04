import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PiggyBank, CheckCircle2, Calculator, ArrowRight, Sliders, AlertTriangle } from 'lucide-react';

interface FundingDetailsProps {
  onNavigateToPlanner?: () => void;
  onSaved?: () => void;
}

export const FundingDetails: React.FC<FundingDetailsProps> = ({ onNavigateToPlanner, onSaved }) => {
  const [totalStudyCost, setTotalStudyCost] = useState<number>(0);
  const [savings, setSavings] = useState<number>(500000);
  const [scholarship, setScholarship] = useState<number>(1000000);
  const [feesAlreadyPaid, setFeesAlreadyPaid] = useState<number>(200000);
  const [familyContribution, setFamilyContribution] = useState<number>(800000);
  const [otherFunding, setOtherFunding] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [fundingRes, studyRes] = await Promise.all([
          api.getFunding(),
          api.getStudyPlan()
        ]);

        if (studyRes.studyPlan) {
          setTotalStudyCost(studyRes.studyPlan.totalStudyCost || 0);
        }

        if (fundingRes.fundingSource) {
          const fs = fundingRes.fundingSource;
          setSavings(fs.savings || 0);
          setScholarship(fs.scholarship || 0);
          setFeesAlreadyPaid(fs.feesAlreadyPaid || 0);
          setFamilyContribution(fs.familyContribution || 0);
          setOtherFunding(fs.otherFunding || 0);
        }
      } catch (err) {
        console.warn('Could not load funding data:', err);
      }
    }
    loadData();
  }, []);

  // Real-time calculations
  const totalAvailableFunding =
    Number(savings || 0) +
    Number(scholarship || 0) +
    Number(feesAlreadyPaid || 0) +
    Number(familyContribution || 0) +
    Number(otherFunding || 0);

  const fundingGap = totalStudyCost - totalAvailableFunding;
  const estimatedLoanRequirement = Math.max(0, fundingGap);
  const fundedPercent = totalStudyCost > 0
    ? Math.min(100, Math.round((totalAvailableFunding / totalStudyCost) * 100))
    : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await api.saveFunding({
        savings: Number(savings),
        scholarship: Number(scholarship),
        feesAlreadyPaid: Number(feesAlreadyPaid),
        familyContribution: Number(familyContribution),
        otherFunding: Number(otherFunding)
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save funding details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
          <PiggyBank className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Funding Details & Loan Gap</h2>
          <p className="text-xs text-slate-500">
            Declare your confirmed personal savings, scholarships, and family contributions to determine your borrowing requirement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          {savedSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Funding sources and loan requirement saved successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <div className="mb-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider block">Baseline Study Cost</span>
              <span className="text-xl font-bold text-blue-950">₹{totalStudyCost.toLocaleString('en-IN')}</span>
            </div>
            {totalStudyCost === 0 && (
              <span className="text-[11px] text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300">
                Please set study costs first in the Study Details tab.
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Personal Savings (INR ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={savings}
                  onChange={(e) => setSavings(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Scholarship / Grants (INR ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={scholarship}
                  onChange={(e) => setScholarship(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Family / Parental Contribution (INR ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={familyContribution}
                  onChange={(e) => setFamilyContribution(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tuition Fees Already Paid (INR ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={feesAlreadyPaid}
                  onChange={(e) => setFeesAlreadyPaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Other Funding / Sponsorships (INR ₹)
              </label>
              <input
                type="number"
                min="0"
                value={otherFunding}
                onChange={(e) => setOtherFunding(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {saving ? 'Updating Calculations...' : 'Save Funding & Update Gap'}
              </button>
            </div>
          </form>

          {onNavigateToPlanner && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Want to test different scholarship or savings scenarios?</span>
              <button
                type="button"
                onClick={onNavigateToPlanner}
                className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Funding Gap Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Calculation Sidebar Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4" />
              <span>Dynamic Gap Analysis</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Funding Computation</h3>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Program Cost:</span>
                <span className="font-semibold text-slate-200">₹{totalStudyCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Savings:</span>
                <span className="text-slate-200">₹{savings.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Scholarship:</span>
                <span className="text-slate-200">₹{scholarship.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Family Contribution:</span>
                <span className="text-slate-200">₹{familyContribution.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Fees Already Paid:</span>
                <span className="text-slate-200">₹{feesAlreadyPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-emerald-400 font-bold">Total Available Funding:</span>
                <span className="font-bold text-emerald-400">₹{totalAvailableFunding.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Coverage Meter */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Funding Coverage Ratio:</span>
                <span className="font-bold text-slate-200">{fundedPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, fundedPercent)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 bg-slate-900/90 p-4 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Estimated Loan Requirement
            </span>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">
              ₹{estimatedLoanRequirement.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {fundingGap <= 0
                ? 'Your available funding covers 100% of study expenses. No loan requirement detected.'
                : 'Formula: Maximum(Total Study Cost - Available Funding, 0)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
