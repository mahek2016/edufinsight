import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BookOpen, CheckCircle2, DollarSign, Calculator, Globe, Award, Sparkles } from 'lucide-react';

interface StudyDetailsProps {
  onSaved?: () => void;
}

const CURRENCY_PRESETS: Record<string, number> = {
  USD: 83.5,
  EUR: 91.2,
  GBP: 108.0,
  CAD: 61.5,
  AUD: 55.2,
  INR: 1.0
};

export const StudyDetails: React.FC<StudyDetailsProps> = ({ onSaved }) => {
  const [country, setCountry] = useState('United States');
  const [university, setUniversity] = useState('');
  const [courseName, setCourseName] = useState('');
  const [durationYears, setDurationYears] = useState<number>(1.5);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(83.5);
  const [tuitionFee, setTuitionFee] = useState<number>(35000);
  const [livingCost, setLivingCost] = useState<number>(15000);
  const [otherExpenses, setOtherExpenses] = useState<number>(4000);
  const [isTop100, setIsTop100] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getStudyPlan();
        if (res.studyPlan) {
          const sp = res.studyPlan;
          setCountry(sp.country || 'United States');
          setUniversity(sp.university || '');
          setCourseName(sp.courseName || '');
          setDurationYears(sp.durationYears || 1.5);
          setCurrency(sp.currency || 'USD');
          setExchangeRate(sp.exchangeRateToBase || 83.5);
          setTuitionFee(sp.tuitionFee || 0);
          setLivingCost(sp.livingCost || 0);
          setOtherExpenses(sp.otherExpenses || 0);
          setIsTop100(Boolean(sp.isTop100University));
        }
      } catch (err) {
        console.warn('No existing study plan found:', err);
      }
    }
    loadData();
  }, []);

  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    if (CURRENCY_PRESETS[newCurr]) {
      setExchangeRate(CURRENCY_PRESETS[newCurr]);
    }
  };

  // Real-time calculation formulas
  const annualTotalInCurrency = Number(tuitionFee || 0) + Number(livingCost || 0) + Number(otherExpenses || 0);
  const totalCostInCurrency = annualTotalInCurrency * Number(durationYears || 1);
  const totalStudyCostINR = Math.round(totalCostInCurrency * Number(exchangeRate || 1));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await api.saveStudyPlan({
        country,
        university,
        courseName,
        durationYears: Number(durationYears),
        currency,
        exchangeRateToBase: Number(exchangeRate),
        tuitionFee: Number(tuitionFee),
        livingCost: Number(livingCost),
        otherExpenses: Number(otherExpenses),
        isTop100University: isTop100
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onSaved) onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save study details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Study Details & Cost Estimator</h2>
          <p className="text-xs text-slate-500">
            Define your program parameters and convert international academic expenses into base INR currency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Input Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          {savedSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Study plan and total cost calculations updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Destination Country
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States, UK, Germany"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  University / Institution
                </label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Columbia University"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Degree / Course Name
                </label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Master of Science in Data Science"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Course Duration (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="6"
                  required
                  value={durationYears}
                  onChange={(e) => setDurationYears(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* University Ranking Checkbox */}
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start space-x-3">
              <input
                type="checkbox"
                id="top100"
                checked={isTop100}
                onChange={(e) => setIsTop100(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <label htmlFor="top100" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold text-blue-950 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  Target University is Ranked in the Global Top 100
                </span>
                <span className="block text-slate-500 mt-0.5">
                  Critical criteria: Bank of Baroda (8.45%) and State Bank of India (9.40%) require Top 100 global ranking for non-collateral loan sanction.
                </span>
              </label>
            </div>

            {/* Currency & Exchange Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Program Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Exchange Rate to INR (₹)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Expenses in Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Annual Tuition Fee ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Annual Living Cost ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={livingCost}
                  onChange={(e) => setLivingCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Other / Travel ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={otherExpenses}
                  onChange={(e) => setOtherExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving Details...' : 'Save & Calculate Total Study Cost'}
            </button>
          </form>
        </div>

        {/* Live Calculation Sidebar Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4" />
              <span>Cost Computation Breakdown</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Total Study Cost</h3>
            <p className="text-xs text-slate-400 mt-1">
              Formula: (Tuition + Living + Other) × Duration × Exchange Rate
            </p>

            <div className="mt-6 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Annual Tuition Fee:</span>
                <span className="font-semibold text-slate-200">{currency} {tuitionFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Annual Living Cost:</span>
                <span className="font-semibold text-slate-200">{currency} {livingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Other Ancillary:</span>
                <span className="font-semibold text-slate-200">{currency} {otherExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Annual Cost Subtotal:</span>
                <span className="font-bold text-blue-400">{currency} {annualTotalInCurrency.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Program Duration:</span>
                <span className="font-semibold text-slate-200">{durationYears} Years</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Total Program ({currency}):</span>
                <span className="font-semibold text-slate-200">{currency} {totalCostInCurrency.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Exchange Rate (1 {currency}):</span>
                <span className="font-semibold text-slate-200">₹{exchangeRate}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 bg-slate-900/80 p-4 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Estimated Total Study Cost (INR)
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              ₹{totalStudyCostINR.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              This total serves as the baseline for evaluating your funding gap and lender loan requirement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
