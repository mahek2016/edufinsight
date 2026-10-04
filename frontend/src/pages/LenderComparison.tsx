import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Lender } from '../types';
import { Scale, Filter, ArrowUpDown, CheckCircle2, XCircle, Info, FileText } from 'lucide-react';

export const LenderComparison: React.FC = () => {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<'ALL' | 'COLLATERAL' | 'NON_COLLATERAL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rate' | 'cibil' | 'name'>('rate');
  const [selectedDocsModal, setSelectedDocsModal] = useState<{ lenderName: string; docs: string[] } | null>(null);

  useEffect(() => {
    async function fetchLenders() {
      setLoading(true);
      try {
        const res = await api.getLenders();
        if (res.lenders) {
          setLenders(res.lenders);
        }
      } catch (err) {
        console.error('Failed to load lenders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLenders();
  }, []);

  // Flatten criteria for row-by-row comparative evaluation
  const comparisonRows = lenders.flatMap((lender) => {
    return lender.criteria.map((crit) => ({
      lenderId: lender.id,
      code: lender.code,
      name: lender.name,
      type: lender.type,
      minCibil: lender.minCibilScore,
      loanType: crit.loanType,
      isOffered: crit.isOffered,
      baseRate: crit.baseInterestRate,
      boysRate: crit.boysInterestRate,
      girlsRate: crit.girlsInterestRate,
      maxRate: crit.maxRate,
      requiresTop100: crit.requiresTop100,
      requiresCollateral: crit.requiresCollateral,
      conditionNote: crit.conditionNote,
      requiredDocs: Array.isArray(crit.requiredDocumentsList) ? crit.requiredDocumentsList : []
    }));
  });

  // Filter rows
  const filteredRows = comparisonRows.filter((row) => {
    if (selectedRoute === 'COLLATERAL' && row.loanType !== 'COLLATERAL') return false;
    if (selectedRoute === 'NON_COLLATERAL' && row.loanType !== 'NON_COLLATERAL') return false;
    if (selectedType !== 'ALL' && !row.type.toLowerCase().includes(selectedType.toLowerCase())) return false;
    return true;
  });

  // Sort rows
  filteredRows.sort((a, b) => {
    if (sortBy === 'rate') {
      if (!a.isOffered) return 1;
      if (!b.isOffered) return -1;
      return a.baseRate - b.baseRate;
    }
    if (sortBy === 'cibil') {
      return (a.minCibil || 999) - (b.minCibil || 999);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Lender Matrix Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Side-by-side comparison of public banks and NBFC criteria loaded dynamically from PostgreSQL.
            </p>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value as any)}
              className="bg-transparent border-0 text-slate-700 font-medium focus:ring-0 text-xs py-1"
            >
              <option value="ALL">All Routes</option>
              <option value="COLLATERAL">Collateral Only</option>
              <option value="NON_COLLATERAL">Non-Collateral Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent border-0 text-slate-700 font-medium focus:ring-0 text-xs py-1"
            >
              <option value="ALL">All Lenders</option>
              <option value="Public">Public Sector</option>
              <option value="NBFC">NBFCs</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-0 text-slate-700 font-medium focus:ring-0 text-xs py-1"
            >
              <option value="rate">Sort: Lowest Interest Rate</option>
              <option value="cibil">Sort: Min CIBIL Cutoff</option>
              <option value="name">Sort: Lender Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Lender</th>
                <th className="py-3.5 px-4">Loan Route</th>
                <th className="py-3.5 px-4">Interest Rate</th>
                <th className="py-3.5 px-4">Min CIBIL</th>
                <th className="py-3.5 px-4">Top 100 Univ Required?</th>
                <th className="py-3.5 px-4">Required Documents</th>
                <th className="py-3.5 px-4">Conditions & Concessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{row.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{row.type}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.loanType === 'COLLATERAL'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {row.loanType.replace('_', '-')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {!row.isOffered ? (
                      <span className="text-slate-400 font-medium italic">Not Possible</span>
                    ) : (
                      <div>
                        <span className="text-blue-600 text-sm">
                          {row.maxRate ? `${row.baseRate}% - ${row.maxRate}%` : `${row.baseRate}%`}
                        </span>
                        {row.girlsRate && row.girlsRate !== row.baseRate && (
                          <span className="text-[10px] text-emerald-700 block font-semibold">
                            Girls: {row.girlsRate}%
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-semibold">
                    {row.minCibil ? (
                      <span className="text-slate-900">{row.minCibil}+</span>
                    ) : (
                      <span className="text-slate-400 italic">Flexible (NBFC)</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {row.requiresTop100 ? (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                        Yes (Mandatory)
                      </span>
                    ) : (
                      <span className="text-slate-500">No (General Accredited)</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {row.requiredDocs.length > 0 ? (
                      <button
                        onClick={() =>
                          setSelectedDocsModal({
                            lenderName: `${row.name} (${row.loanType})`,
                            docs: row.requiredDocs
                          })
                        }
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View {row.requiredDocs.length} Docs</span>
                      </button>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-xs">
                    {row.conditionNote || 'Standard underwriting criteria.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Required Docs Modal */}
      {selectedDocsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Required Document Checklist</h3>
                <p className="text-xs text-slate-500">{selectedDocsModal.lenderName}</p>
              </div>
              <button
                onClick={() => setSelectedDocsModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 text-xs text-slate-700">
              {selectedDocsModal.docs.map((doc, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>{doc}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDocsModal(null)}
                className="py-1.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
