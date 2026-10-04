import React from 'react';
import { AssessmentRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { Printer, ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react';

interface PrintableReportProps {
  assessment: AssessmentRecord;
  onBack: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ assessment, onBack }) => {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top action toolbar (Hidden in print) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 py-2 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Sheet (Standard A4 / Letter format) */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200 text-slate-800 space-y-8 print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">GradGuide</h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Education Loan Assessment & Underwriting Support Report
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="font-bold text-slate-900 block">CONFIDENTIAL ASSESSMENT</span>
            <span className="text-slate-500 block">Report ID: {assessment.id.slice(0, 16)}</span>
            <span className="text-slate-500 block">Generated: {new Date(assessment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* 1. Student Information */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            1. Student & Co-Applicant Profile Information
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Applicant Name</span>
              <span className="font-semibold text-slate-900">{user?.fullName || 'Candidate Applicant'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Contact Email</span>
              <span className="font-semibold text-slate-900">{user?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Supplied CIBIL</span>
              <span className="font-semibold text-slate-900">
                {assessment.cibilScore !== null ? `${assessment.cibilScore}` : 'Not Supplied'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Financing Route</span>
              <span className="font-bold text-blue-600">{assessment.potentialRoute.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* 2. Funding & Loan Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            2. Funding Gap & Loan Requirement Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Total Study Cost</span>
              <span className="text-base font-extrabold text-slate-900">{formatCurrency(assessment.totalStudyCost)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Available Funding</span>
              <span className="text-base font-extrabold text-emerald-700">{formatCurrency(assessment.availableFunding)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Calculated Gap</span>
              <span className="text-base font-extrabold text-amber-700">{formatCurrency(assessment.fundingGap)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Required Loan</span>
              <span className="text-base font-extrabold text-blue-700">{formatCurrency(assessment.estimatedLoanRequirement)}</span>
            </div>
          </div>
        </div>

        {/* 3. Financial Profile & Balance Sheet */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            3. Financial Profile & Collateral Security Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Household Net Worth</span>
              <span className="font-bold text-slate-900">{formatCurrency(assessment.netWorth)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Pledgeable Collateral</span>
              <span className="font-bold text-slate-900">{formatCurrency(assessment.totalCollateral)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Collateral Coverage</span>
              <span className="font-bold text-slate-900">
                {assessment.estimatedLoanRequirement > 0
                  ? `${Math.round((assessment.totalCollateral / assessment.estimatedLoanRequirement) * 100)}%`
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Readiness Category</span>
              <span className="font-bold text-emerald-700">{assessment.readinessCategory}</span>
            </div>
          </div>
        </div>

        {/* 4. Relevant Lenders & Match Reasons */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            4. Potentially Relevant Lenders & Criteria Compatibility
          </h2>

          <div className="space-y-3">
            {assessment.lenderMatches
              .filter((m) => m.isPotentialMatch)
              .map((match, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 break-inside-avoid">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">{match.lenderName}</span>
                      <span className="text-slate-500 text-[11px] ml-2">
                        ({match.loanType} Route • {match.lenderType})
                      </span>
                    </div>
                    <span className="font-extrabold text-blue-700">{match.rateDisplay}</span>
                  </div>

                  {match.rateNote && (
                    <p className="text-[11px] text-emerald-800 font-semibold">{match.rateNote}</p>
                  )}

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Assessment Rationale:</span>
                    {match.matchReasons.map((r, rIdx) => (
                      <div key={rIdx} className="text-slate-700 flex items-start space-x-1 text-[11px]">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {match.missingDocuments && match.missingDocuments.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">Pending Documents:</span>
                      <p className="text-[11px] text-amber-900">{match.missingDocuments.join(', ')}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* 5. Missing Profile Information */}
        {assessment.missingInformation && assessment.missingInformation.length > 0 && (
          <div className="space-y-1.5 break-inside-avoid">
            <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider border-b border-amber-200 pb-1">
              5. Profile Caveats & Missing Information
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
              {assessment.missingInformation.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Document Checklist */}
        <div className="space-y-2 break-inside-avoid">
          <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            6. Document Evidence Status
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {assessment.documentChecklist.slice(0, 8).map((doc, idx) => (
              <div key={idx} className="flex justify-between p-1.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-700">{doc.documentName}</span>
                <span className={`font-semibold ${doc.isUploaded ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {doc.isUploaded ? '✓ Uploaded' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Regulatory Non-Guarantee Disclaimer */}
        <div className="border-t-2 border-slate-900 pt-4 text-[10px] text-slate-600 leading-relaxed break-inside-avoid">
          <strong>Mandatory Regulatory Disclaimer:</strong> {assessment.disclaimer}
          <div className="mt-2 text-slate-400">
            GradGuide Education Loan Assessment Engine • Candidate Hiring Assignment Assessment Report • Document Generated Programmatically
          </div>
        </div>
      </div>
    </div>
  );
};
