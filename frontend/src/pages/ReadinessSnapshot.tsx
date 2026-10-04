import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FinancialReadinessResult, AssessmentRecord } from '../types';
import { Sparkles, ShieldCheck, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight, Lightbulb } from 'lucide-react';

export const ReadinessSnapshot: React.FC = () => {
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getLatestAssessment();
        if (res.assessment) {
          setAssessment(res.assessment);
        }
      } catch (err) {
        console.warn('Could not load latest assessment for readiness snapshot:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const readiness: FinancialReadinessResult | null =
    assessment?.readinessScoreExplanation || assessment?.readinessSnapshot || null;

  const categoryTheme = {
    STRONG: {
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      border: 'border-emerald-300',
      cardBg: 'bg-emerald-50/40',
      icon: CheckCircle2,
      label: 'Strong Readiness'
    },
    MODERATE: {
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      border: 'border-amber-300',
      cardBg: 'bg-amber-50/40',
      icon: AlertTriangle,
      label: 'Moderate Readiness'
    },
    NEEDS_ATTENTION: {
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      border: 'border-rose-300',
      cardBg: 'bg-rose-50/40',
      icon: AlertTriangle,
      label: 'Needs Attention'
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Readiness Snapshot</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Original Feature #2
            </span>
          </div>
          <p className="text-xs text-slate-500">
            A transparent health check evaluating capital cushion, net worth buffer, and document evidence.
          </p>
        </div>
      </div>

      {!readiness ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Sparkles className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Readiness Snapshot Evaluated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Please run an assessment in the Assessment tab to evaluate your profile readiness.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Category Banner */}
          {(() => {
            const theme = categoryTheme[readiness.category] || categoryTheme.MODERATE;
            const ThemeIcon = theme.icon;

            return (
              <div className={`rounded-3xl border ${theme.border} ${theme.cardBg} p-6 sm:p-8 shadow-sm`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl ${theme.badgeBg} ${theme.badgeText} shadow-sm`}>
                      <ThemeIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}>
                        {theme.label}
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                        Overall Profile Status: {readiness.category.replace('_', ' ')}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                        {readiness.summary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Dimension-by-Dimension "WHY" Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Transparent Dimension-by-Dimension Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readiness.dimensions.map((dim, idx) => {
                const isStrong = dim.status === 'STRONG';
                const isModerate = dim.status === 'MODERATE';

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{dim.dimension}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          isStrong
                            ? 'bg-emerald-100 text-emerald-800'
                            : isModerate
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {dim.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong className="text-slate-900">Observation:</strong> {dim.observation}
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-800">Why this matters:</strong> {dim.rationale}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations */}
          {readiness.actionableRecommendations && readiness.actionableRecommendations.length > 0 && (
            <div className="bg-white rounded-3xl border border-blue-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Actionable Recommendations to Strengthen Your Profile</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {readiness.actionableRecommendations.map((rec, rIdx) => (
                  <li key={rIdx} className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold shrink-0">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explicit No Fake Precision Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>Zero Fake Precision Notice:</strong> GradGuide intentionally avoids generating artificial "credit scores" or arbitrary approval percentages. This readiness assessment provides an educational overview of financial balance sheet coverage and document evidence based strictly on published lender policies.
          </div>
        </div>
      )}
    </div>
  );
};
