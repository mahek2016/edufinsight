import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Lender, DocumentItem } from '../types';
import { CheckSquare, CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';

interface TrackedDocItem {
  id: string;
  name: string;
  category: 'Basic' | 'Academic' | 'CoApplicant' | 'Collateral';
  status: 'NOT_UPLOADED' | 'UPLOADED' | 'UNDER_REVIEW';
}

export const DocumentTracker: React.FC = () => {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [selectedLenderCode, setSelectedLenderCode] = useState<string>('SBI');
  const [selectedRoute, setSelectedRoute] = useState<'COLLATERAL' | 'NON_COLLATERAL'>('COLLATERAL');
  const [userDocs, setUserDocs] = useState<DocumentItem[]>([]);
  const [trackedItems, setTrackedItems] = useState<TrackedDocItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [lendersRes, docsRes] = await Promise.all([
          api.getLenders(),
          api.getDocuments()
        ]);

        if (lendersRes.lenders) {
          setLenders(lendersRes.lenders);
        }
        if (docsRes.documents) {
          setUserDocs(docsRes.documents);
        }
      } catch (err) {
        console.error('Failed to load lender document criteria:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update checklist when selected lender or route changes
  useEffect(() => {
    if (!lenders.length) return;

    const lender = lenders.find((l) => l.code === selectedLenderCode) || lenders[0];
    const crit = lender?.criteria.find((c) => c.loanType === selectedRoute);

    const docList: string[] = crit && Array.isArray(crit.requiredDocumentsList)
      ? crit.requiredDocumentsList
      : [
          'PAN Card',
          'Proof of residence (Passport / Aadhaar / Voter ID)',
          'Bank account statement for last 6 months',
          'Personal Asset & Liability Statement',
          'Proof of admission and course duration',
          'Academic marksheets (10th, 12th, Degree)',
          'Latest salary slips (last 3 months)',
          'Form 16 / ITR (last 2 years)',
          ...(selectedRoute === 'COLLATERAL'
            ? [
                'Property title deed and registered sale agreement',
                'Previous chain of sale deeds / Encumbrance Certificate (EC)',
                'Municipality-approved building plan or layout',
                'Occupancy Certificate (OC)'
              ]
            : [])
        ];

    const uploadedTypes = new Set(userDocs.map((d) => d.documentType));

    const items: TrackedDocItem[] = docList.map((docName, idx) => {
      let status: 'NOT_UPLOADED' | 'UPLOADED' | 'UNDER_REVIEW' = 'NOT_UPLOADED';

      const lower = docName.toLowerCase();
      if (lower.includes('itr') && uploadedTypes.has('ITR')) status = 'UPLOADED';
      else if (lower.includes('bank') && uploadedTypes.has('BANK_STATEMENT')) status = 'UPLOADED';
      else if (lower.includes('salary') && uploadedTypes.has('SALARY_SLIP')) status = 'UPLOADED';
      else if (lower.includes('property') && uploadedTypes.has('PROPERTY_DOCS')) status = 'UPLOADED';
      else if (lower.includes('pan') && uploadedTypes.has('PASSPORT_ID')) status = 'UPLOADED';
      else if (lower.includes('admission') && uploadedTypes.has('ADMISSION_LETTER')) status = 'UPLOADED';
      else if (lower.includes('marksheet') && uploadedTypes.has('ACADEMIC_MARKSHEET')) status = 'UPLOADED';

      // Assign category
      let category: 'Basic' | 'Academic' | 'CoApplicant' | 'Collateral' = 'Basic';
      if (lower.includes('admission') || lower.includes('marksheet') || lower.includes('degree') || lower.includes('ielts') || lower.includes('ranking')) {
        category = 'Academic';
      } else if (lower.includes('salary') || lower.includes('form 16') || lower.includes('itr') || lower.includes('balance sheet')) {
        category = 'CoApplicant';
      } else if (lower.includes('property') || lower.includes('encumbrance') || lower.includes('layout') || lower.includes('occupancy') || lower.includes('title')) {
        category = 'Collateral';
      }

      return {
        id: `doc-${idx}`,
        name: docName,
        category,
        status
      };
    });

    setTrackedItems(items);
  }, [lenders, selectedLenderCode, selectedRoute, userDocs]);

  const handleStatusChange = (id: string, newStatus: 'NOT_UPLOADED' | 'UPLOADED' | 'UNDER_REVIEW') => {
    setTrackedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // Readiness Percentage strictly based on document collection completion
  const totalCount = trackedItems.length;
  const completedCount = trackedItems.filter((i) => i.status === 'UPLOADED').length;
  const underReviewCount = trackedItems.filter((i) => i.status === 'UNDER_REVIEW').length;
  const readinessPercentage = totalCount > 0
    ? Math.round(((completedCount + underReviewCount * 0.5) / totalCount) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Document Readiness Tracker</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Original Feature #3
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive checklist mapped to specific lender underwriting requirements.
            </p>
          </div>
        </div>

        {/* Target Lender & Route Pickers */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedLenderCode}
            onChange={(e) => setSelectedLenderCode(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            {lenders.map((l) => (
              <option key={l.code} value={l.code}>
                Target Lender: {l.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="COLLATERAL">Collateral Loan</option>
            <option value="NON_COLLATERAL">Non-Collateral Loan</option>
          </select>
        </div>
      </div>

      {/* Readiness Progress Meter Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Evidence Collection Status for {selectedLenderCode}
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight mt-1">
              Document Readiness: {readinessPercentage}% Complete
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {completedCount} of {totalCount} verified documents collected ({underReviewCount} under review)
            </p>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-emerald-400">{readinessPercentage}%</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${readinessPercentage}%` }}
          ></div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Readiness percentage reflects strictly document evidence collection completion, NOT loan approval probability.
          </span>
        </div>
      </div>

      {/* Interactive Checklist by Category */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Lender Required Document Breakdown ({selectedLenderCode})
          </h3>
          <span className="text-xs text-slate-500">Click any status tag to update document state</span>
        </div>

        <div className="divide-y divide-slate-100">
          {trackedItems.map((item) => {
            const isUploaded = item.status === 'UPLOADED';
            const isUnderReview = item.status === 'UNDER_REVIEW';

            return (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {isUploaded ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isUnderReview ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Category: {item.category}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center space-x-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'NOT_UPLOADED')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      item.status === 'NOT_UPLOADED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Not Uploaded
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'UNDER_REVIEW')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      item.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Under Review
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'UPLOADED')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      item.status === 'UPLOADED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ✓ Uploaded
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
