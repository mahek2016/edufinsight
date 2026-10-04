import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Asset, Liability, CoApplicantType } from '../types';
import {
  Wallet,
  Building,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Landmark,
  ShieldCheck,
  TrendingDown,
  Calculator,
  UserCheck
} from 'lucide-react';

export const FinancialProfile: React.FC = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(120000);
  const [annualIncome, setAnnualIncome] = useState<number>(1440000);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [cibilScore, setCibilScore] = useState<number | string>(760);
  const [coApplicantType, setCoApplicantType] = useState<CoApplicantType>('SALARIED');
  const [coApplicantIncome, setCoApplicantIncome] = useState<number>(120000);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);

  // New asset form
  const [newAssetType, setNewAssetType] = useState<'PROPERTY' | 'BANK_SAVINGS' | 'INVESTMENTS' | 'GOLD' | 'OTHER'>('PROPERTY');
  const [newAssetDesc, setNewAssetDesc] = useState('');
  const [newAssetVal, setNewAssetVal] = useState<number>(5000000);

  // New liability form
  const [newLiabType, setNewLiabType] = useState<'EXISTING_LOAN' | 'CREDIT_CARD_DEBT' | 'OTHER'>('EXISTING_LOAN');
  const [newLiabDesc, setNewLiabDesc] = useState('');
  const [newLiabAmount, setNewLiabAmount] = useState<number>(800000);
  const [newLiabEmi, setNewLiabEmi] = useState<number>(15000);

  const [savingIncome, setSavingIncome] = useState(false);
  const [incomeSuccess, setIncomeSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [profileRes, meRes] = await Promise.all([
        api.getFinancialProfile(),
        api.getMe()
      ]);

      if (profileRes.financialProfile) {
        const fp = profileRes.financialProfile;
        setMonthlyIncome(fp.monthlyIncome || 0);
        setAnnualIncome(fp.annualIncome || 0);
        setOtherIncome(fp.otherIncome || 0);
        setAssets(fp.assets || []);
        setLiabilities(fp.liabilities || []);
      }

      if (meRes.user?.studentProfile) {
        const sp = meRes.user.studentProfile;
        setCibilScore(sp.cibilScore !== null ? sp.cibilScore : '');
        setCoApplicantType(sp.coApplicantType || 'SALARIED');
        setCoApplicantIncome(sp.coApplicantIncome || 0);
      }
    } catch (err) {
      console.warn('Could not load financial profile:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingIncome(true);
    setError(null);
    setIncomeSuccess(false);

    try {
      await api.saveIncomeDetails({
        monthlyIncome: Number(monthlyIncome),
        annualIncome: Number(annualIncome),
        otherIncome: Number(otherIncome),
        cibilScore: cibilScore !== '' ? Number(cibilScore) : null,
        coApplicantType,
        coApplicantIncome: Number(coApplicantIncome)
      });
      setIncomeSuccess(true);
      setTimeout(() => setIncomeSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save income and CIBIL details.');
    } finally {
      setSavingIncome(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetVal || newAssetVal <= 0) return;

    try {
      const res = await api.addAsset({
        assetType: newAssetType,
        description: newAssetDesc || newAssetType.replace('_', ' '),
        value: Number(newAssetVal)
      });
      setAssets((prev) => [...prev, res.asset]);
      setNewAssetDesc('');
      setNewAssetVal(100000);
    } catch (err: any) {
      setError(err.message || 'Failed to add asset.');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await api.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete asset.');
    }
  };

  const handleAddLiability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiabAmount || newLiabAmount <= 0) return;

    try {
      const res = await api.addLiability({
        liabilityType: newLiabType,
        description: newLiabDesc || newLiabType.replace('_', ' '),
        outstandingAmount: Number(newLiabAmount),
        monthlyEmi: Number(newLiabEmi)
      });
      setLiabilities((prev) => [...prev, res.liability]);
      setNewLiabDesc('');
      setNewLiabAmount(50000);
      setNewLiabEmi(2000);
    } catch (err: any) {
      setError(err.message || 'Failed to add liability.');
    }
  };

  const handleDeleteLiability = async (id: string) => {
    try {
      await api.deleteLiability(id);
      setLiabilities((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete liability.');
    }
  };

  // Calculations
  const totalAssets = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (Number(l.outstandingAmount) || 0), 0);
  const totalMonthlyEmi = liabilities.reduce((sum, l) => sum + (Number(l.monthlyEmi) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Profile & Net Worth</h2>
          <p className="text-xs text-slate-500">
            Document your household income, assets, and liabilities to calculate balance sheet net worth.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50/80 border border-blue-200 p-5 rounded-3xl">
          <div className="flex items-center justify-between text-blue-900 text-xs font-bold uppercase tracking-wider">
            <span>Total Assets</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-950 mt-1">₹{totalAssets.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-600 mt-1">{assets.length} asset items recorded</p>
        </div>

        <div className="bg-rose-50/80 border border-rose-200 p-5 rounded-3xl">
          <div className="flex items-center justify-between text-rose-900 text-xs font-bold uppercase tracking-wider">
            <span>Total Liabilities</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-950 mt-1">₹{totalLiabilities.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-600 mt-1">Monthly EMI: ₹{totalMonthlyEmi.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-3xl">
          <div className="flex items-center justify-between text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <span>Calculated Net Worth</span>
            <Landmark className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1">₹{netWorth.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-600 mt-1">Assets minus Liabilities</p>
        </div>
      </div>

      {/* Income & CIBIL Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Co-Applicant Cashflow & Credit Profile</h3>
            <p className="text-xs text-slate-500">Crucial for debt-to-income and lender cutoffs</p>
          </div>
          {incomeSuccess && (
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveIncome} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Co-Applicant Monthly Income (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={monthlyIncome}
                onChange={(e) => {
                  const m = parseFloat(e.target.value) || 0;
                  setMonthlyIncome(m);
                  setAnnualIncome(m * 12);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Annual Income (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={annualIncome}
                onChange={(e) => setAnnualIncome(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Other / Rental Income (₹)
              </label>
              <input
                type="number"
                min="0"
                value={otherIncome}
                onChange={(e) => setOtherIncome(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Co-Applicant Employment Type
              </label>
              <select
                value={coApplicantType}
                onChange={(e) => setCoApplicantType(e.target.value as CoApplicantType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="SALARIED">Salaried (Form 16 / Salary Slips)</option>
                <option value="SELF_EMPLOYED">Self-Employed (ITR / P&L Balance Sheet)</option>
                <option value="NONE">None / Not Specified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Co-Applicant Annual Income (₹)
              </label>
              <input
                type="number"
                min="0"
                value={coApplicantIncome}
                onChange={(e) => setCoApplicantIncome(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                CIBIL Credit Score
              </label>
              <input
                type="number"
                min="300"
                max="900"
                value={cibilScore}
                onChange={(e) => setCibilScore(e.target.value)}
                placeholder="e.g. 750 (Optional)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                SBI requires 750+, BOB requires 700+, BOI requires 670+.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingIncome}
              className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {savingIncome ? 'Saving...' : 'Save Cashflow & Credit Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Assets & Liabilities 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Assets Portfolio</span>
            </h3>
            <span className="text-xs font-bold text-blue-900">Total: ₹{totalAssets.toLocaleString('en-IN')}</span>
          </div>

          {/* Add Asset Form */}
          <form onSubmit={handleAddAsset} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase">Asset Type</label>
                <select
                  value={newAssetType}
                  onChange={(e) => setNewAssetType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="PROPERTY">Real Estate Property</option>
                  <option value="BANK_SAVINGS">Bank Fixed Deposit / Savings</option>
                  <option value="INVESTMENTS">Mutual Funds / Stocks</option>
                  <option value="GOLD">Gold / Precious Assets</option>
                  <option value="OTHER">Other Assets</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase">Estimated Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newAssetVal}
                  onChange={(e) => setNewAssetVal(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase">Description</label>
              <input
                type="text"
                value={newAssetDesc}
                onChange={(e) => setNewAssetDesc(e.target.value)}
                placeholder="e.g. 3BHK Apartment in Mumbai"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Asset
            </button>
          </form>

          {/* Asset Items Table */}
          <div className="space-y-2">
            {assets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No assets added yet.</p>
            ) : (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 block">{asset.description || asset.assetType}</span>
                    <span className="text-[10px] text-slate-500">{asset.assetType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900">₹{asset.value.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-600" />
              <span>Liabilities & Obligations</span>
            </h3>
            <span className="text-xs font-bold text-rose-900">Total: ₹{totalLiabilities.toLocaleString('en-IN')}</span>
          </div>

          {/* Add Liability Form */}
          <form onSubmit={handleAddLiability} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase">Liability Type</label>
                <select
                  value={newLiabType}
                  onChange={(e) => setNewLiabType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="EXISTING_LOAN">Existing Home / Personal Loan</option>
                  <option value="CREDIT_CARD_DEBT">Credit Card Outstanding</option>
                  <option value="OTHER">Other Debt</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase">Outstanding (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newLiabAmount}
                  onChange={(e) => setNewLiabAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase">Description</label>
                <input
                  type="text"
                  value={newLiabDesc}
                  onChange={(e) => setNewLiabDesc(e.target.value)}
                  placeholder="e.g. Car Loan at HDFC"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase">Monthly EMI (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newLiabEmi}
                  onChange={(e) => setNewLiabEmi(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Liability
            </button>
          </form>

          {/* Liabilities Items Table */}
          <div className="space-y-2">
            {liabilities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No liabilities added. Profile is unencumbered by debt.</p>
            ) : (
              liabilities.map((liab) => (
                <div
                  key={liab.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 block">{liab.description || liab.liabilityType}</span>
                    <span className="text-[10px] text-slate-500">EMI: ₹{liab.monthlyEmi.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-rose-950">₹{liab.outstandingAmount.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => handleDeleteLiability(liab.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
