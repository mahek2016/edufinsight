import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Collateral } from '../types';
import { ShieldCheck, Plus, Trash2, AlertCircle, FileCheck, Building, HelpCircle } from 'lucide-react';

export const CollateralPage: React.FC = () => {
  const [collaterals, setCollaterals] = useState<Collateral[]>([]);
  const [collateralType, setCollateralType] = useState<
    'RESIDENTIAL_PROPERTY' | 'COMMERCIAL_PROPERTY' | 'FIXED_DEPOSIT' | 'LAND' | 'OTHER'
  >('RESIDENTIAL_PROPERTY');
  const [description, setDescription] = useState('');
  const [propertyValue, setPropertyValue] = useState<number>(6000000);
  const [eligibleAssetValue, setEligibleAssetValue] = useState<number>(4800000);
  const [ownershipInfo, setOwnershipInfo] = useState('Parents (Jointly Owned)');
  const [availableCollateralValue, setAvailableCollateralValue] = useState<number>(4500000);
  const [hasEncumbranceCert, setHasEncumbranceCert] = useState(true);
  const [hasApprovedLayout, setHasApprovedLayout] = useState(true);
  const [hasOccupancyCert, setHasOccupancyCert] = useState(true);
  const [state, setState] = useState('Maharashtra');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await api.getCollateral();
      if (res.collaterals) {
        setCollaterals(res.collaterals);
      }
    } catch (err) {
      console.warn('Could not load collateral records:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePropertyValueChange = (val: number) => {
    setPropertyValue(val);
    // Standard bank haircut: 80% eligible valuation for residential property, 90% for FD
    const standardEligible = collateralType === 'FIXED_DEPOSIT' ? val * 0.9 : val * 0.8;
    setEligibleAssetValue(standardEligible);
    setAvailableCollateralValue(standardEligible);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.addCollateral({
        collateralType,
        description: description || collateralType.replace('_', ' '),
        propertyValue: Number(propertyValue),
        eligibleAssetValue: Number(eligibleAssetValue),
        ownershipInfo,
        availableCollateralValue: Number(availableCollateralValue),
        hasEncumbranceCert,
        hasApprovedLayout,
        hasOccupancyCert,
        state
      });

      setCollaterals((prev) => [...prev, res.collateral]);
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to add collateral record.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCollateral(id);
      setCollaterals((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete collateral record.');
    }
  };

  // Summaries
  const totalPropertyValue = collaterals.reduce((sum, c) => sum + (Number(c.propertyValue) || 0), 0);
  const totalEligibleValue = collaterals.reduce((sum, c) => sum + (Number(c.eligibleAssetValue) || 0), 0);
  const totalAvailableCollateral = collaterals.reduce(
    (sum, c) => sum + (Number(c.availableCollateralValue) || 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Collateral & Security Assessment</h2>
          <p className="text-xs text-slate-500">
            Pledgeable immovable properties or liquid deposits evaluated against GradGuide lender criteria.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* KPI Summary Banner clearly distinguishing Property Value vs Available Collateral */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Market Value of Security
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalPropertyValue.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-500 mt-1">Gross declared market appraisal</p>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-3xl">
          <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
            Eligible Asset Valuation (LTV)
          </span>
          <div className="text-2xl font-extrabold text-blue-950 mt-1">₹{totalEligibleValue.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-600 mt-1">After standard bank margin haircut</p>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-3xl">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Net Available Collateral
          </span>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1">₹{totalAvailableCollateral.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-emerald-700 mt-1">Pledgeable unencumbered value</p>
        </div>
      </div>

      {/* Add Collateral Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Add Pledgeable Collateral Asset</h3>
          <p className="text-xs text-slate-500">
            Lenders require clear title, 30-year Encumbrance Certificate (EC), and municipal building approvals.
          </p>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Collateral Type
              </label>
              <select
                value={collateralType}
                onChange={(e) => setCollateralType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="RESIDENTIAL_PROPERTY">Residential Property (Apartment / Independent House)</option>
                <option value="COMMERCIAL_PROPERTY">Commercial Property / Office</option>
                <option value="FIXED_DEPOSIT">Bank Fixed Deposit (100% Liquid)</option>
                <option value="LAND">Non-Agricultural NA Land</option>
                <option value="OTHER">Other Tangible Security</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Market Valuation (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={propertyValue}
                onChange={(e) => handlePropertyValueChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Eligible Bank Value (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={eligibleAssetValue}
                onChange={(e) => setEligibleAssetValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ownership Title
              </label>
              <input
                type="text"
                required
                value={ownershipInfo}
                onChange={(e) => setOwnershipInfo(e.target.value)}
                placeholder="e.g. Sole / Parents Joint"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Available Collateral Value (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={availableCollateralValue}
                onChange={(e) => setAvailableCollateralValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Jurisdiction State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra, Delhi, Karnataka"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Property Description / Location
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Flat 402, Green Valley Towers, Pune"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Legal Compliance Checkboxes */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Lender Compliance & Verification Checkpoints
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEncumbranceCert}
                  onChange={(e) => setHasEncumbranceCert(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>30-Year EC / Chain of Deeds</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasApprovedLayout}
                  onChange={(e) => setHasApprovedLayout(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Municipality Approved Plan</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasOccupancyCert}
                  onChange={(e) => setHasOccupancyCert(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Occupancy Certificate (OC)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Pledge Collateral Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Collateral Items List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Recorded Collateral Securities</h3>

        {collaterals.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <Building className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p>No collateral securities recorded yet.</p>
            <p className="text-[11px] mt-1">If you intend to pursue non-collateral loans, collateral is optional.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaterals.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{item.description}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                      {item.collateralType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Owner: {item.ownershipInfo} • State: {item.state || 'N/A'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.hasEncumbranceCert && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                        ✓ 30-Yr EC
                      </span>
                    )}
                    {item.hasApprovedLayout && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                        ✓ Approved Layout
                      </span>
                    )}
                    {item.hasOccupancyCert && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                        ✓ Occupancy Cert
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pledgeable Value</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      ₹{item.availableCollateralValue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Market: ₹{item.propertyValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-2 text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
