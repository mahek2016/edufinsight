import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AssessmentRecord } from '../types';
import {
  Sparkles,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  Building,
  GraduationCap,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';

interface AssessmentPageProps {
  onOpenReport?: (assessment: AssessmentRecord) => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({ onOpenReport }) => {
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getLatestAssessment();
      if (res.assessment) {
        setAssessment(res.assessment);
      }
    } catch (err) {
      console.warn('No prior assessment found:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAssessment();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.generateAssessment();
      setAssessment(res.assessment);
    } catch (err: any) {
      setError(err.message || 'Failed to generate assessment.');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amt: number) => `₹${Math.round(amt).toLocaleString('en-IN')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Trigger Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Explainable Loan Assessment & Matching
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic, non-guaranteed evaluation based strictly on the GradGuide reference lender database.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {assessment && onOpenReport && (
            <button
              onClick={() => onOpenReport(assessment)}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Report</span>
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Evaluating Profile...' : 'Run Assessment Engine'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {!assessment && !loading && !generating && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Sparkles className="w-12 h-12 mx-auto text-blue-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Assessment Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Click the button below to analyze your study details, funding sources, and collateral against all 5 GradGuide lenders.
          </p>
          <button
            onClick={handleGenerate}
            className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
          >
            Generate My Loan Assessment Now
          </button>
        </div>
      )}

      {assessment && (
        <div className="space-y-8">
          {/* Section D: Potential Financing Route Banner */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                Recommended Financing Route
              </span>
              <span className="text-xs text-slate-500">
                Generated: {new Date(assessment.createdAt).toLocaleString()}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-blue-950 tracking-tight">
              Route: {assessment.potentialRoute.replace(/_/g, ' ')}
            </h3>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {assessment.routeExplanation ||
                'Based on your collateral backing and loan requirement, the engine evaluates both collateral and non-collateral options.'}
            </p>
          </div>

          {/* Core Profile Metrics Summary Cards (A, B, C) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Funding Summary */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Coins className="w-4 h-4 text-blue-600" />
                <span>A. Funding Summary</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Study Cost:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(assessment.totalStudyCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Funding:</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(assessment.availableFunding)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold">
                  <span className="text-slate-700">Estimated Loan Req:</span>
                  <span className="text-blue-600">{formatCurrency(assessment.estimatedLoanRequirement)}</span>
                </div>
              </div>
            </div>

            {/* Financial Profile */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>B. Financial Profile</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Declared Net Worth:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(assessment.netWorth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplied CIBIL:</span>
                  <span className="font-semibold text-slate-900">
                    {assessment.cibilScore !== null ? `${assessment.cibilScore}` : 'Not Supplied'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold">
                  <span className="text-slate-700">Readiness Category:</span>
                  <span className={`px-2 py-0.2 rounded font-bold text-[10px] ${
                    assessment.readinessCategory === 'STRONG'
                      ? 'bg-emerald-100 text-emerald-800'
                      : assessment.readinessCategory === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {assessment.readinessCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Collateral Summary */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>C. Collateral Summary</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Collateral:</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(assessment.totalCollateral)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coverage of Loan:</span>
                  <span className="font-semibold text-slate-900">
                    {assessment.estimatedLoanRequirement > 0
                      ? `${Math.round((assessment.totalCollateral / assessment.estimatedLoanRequirement) * 100)}%`
                      : 'N/A (No Loan)'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold">
                  <span className="text-slate-700">Security Suitability:</span>
                  <span className="text-emerald-700">
                    {assessment.totalCollateral >= assessment.estimatedLoanRequirement
                      ? '100%+ Covered'
                      : 'Partial / Non-collateral'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section F: Missing Information Notice */}
          {assessment.missingInformation && assessment.missingInformation.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>F. Missing Profile Information & Underwriting Caveats</span>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-1 pl-1">
                {assessment.missingInformation.map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section E: Matched & Potentially Relevant Lenders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">E. Dynamic Lender Compatibility Analysis</h3>
                <p className="text-xs text-slate-500">
                  Evaluated dynamically against Bank of India, Bank of Baroda, SBI, HDFC Credila, and Auxilo.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {assessment.lenderMatches.filter((m) => m.isPotentialMatch).length} Potentially Relevant
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.lenderMatches.map((match) => (
                <div
                  key={`${match.lenderId}-${match.loanType}`}
                  className={`rounded-3xl border p-5 transition-all shadow-sm ${
                    match.isPotentialMatch
                      ? 'bg-white border-blue-200 hover:border-blue-300'
                      : 'bg-slate-50/70 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{match.lenderName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                          {match.lenderCode}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {match.loanType === 'COLLATERAL' ? 'Collateralised Route' : 'Non-Collateral Route'} • {match.lenderType}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-blue-600 block">
                        {match.rateDisplay}
                      </span>
                      {match.rateNote && (
                        <span className="text-[9px] text-emerald-700 font-semibold block">{match.rateNote}</span>
                      )}
                    </div>
                  </div>

                  {/* Relevance Indicator */}
                  <div className="mt-3 flex items-center justify-between text-[11px] py-1 border-t border-slate-100">
                    <span className="text-slate-500">Assessment Compatibility:</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        match.isPotentialMatch ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {match.isPotentialMatch ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Potentially Relevant ({match.relevanceScore}%)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Unmet Criteria</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Reasons for Match */}
                  {match.matchReasons && match.matchReasons.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                        Why It May Be Relevant:
                      </span>
                      {match.matchReasons.map((reason, rIdx) => (
                        <div key={rIdx} className="text-[11px] text-slate-700 flex items-start space-x-1.5">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Unmet Criteria */}
                  {match.unmetCriteria && match.unmetCriteria.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                        Unmet / Incompatible Criteria:
                      </span>
                      {match.unmetCriteria.map((unmet, uIdx) => (
                        <div key={uIdx} className="text-[11px] text-rose-800 flex items-start space-x-1.5">
                          <span className="text-rose-600 font-bold shrink-0">✕</span>
                          <span>{unmet}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Missing Documents */}
                  {match.missingDocuments && match.missingDocuments.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                        Pending Documents for this Lender:
                      </span>
                      {match.missingDocuments.map((doc, dIdx) => (
                        <div key={dIdx} className="text-[11px] text-amber-800 flex items-start space-x-1.5">
                          <span className="text-amber-600 font-bold shrink-0">⚠</span>
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section G: Document Checklist */}
          {assessment.documentChecklist && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">G. Document Evidence Checklist</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {assessment.documentChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      item.isUploaded
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{item.documentName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        item.isUploaded ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.isUploaded ? '✓ Uploaded' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Non-Guarantee Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-600 text-xs leading-relaxed">
            <strong>Legal Notice & Assessment Disclaimer:</strong> {assessment.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
