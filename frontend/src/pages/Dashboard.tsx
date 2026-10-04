import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  GraduationCap,
  PiggyBank,
  AlertCircle,
  Coins,
  Building,
  TrendingDown,
  Landmark,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  Sliders,
  FileCheck2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    studyCost: number;
    funding: number;
    gap: number;
    loanReq: number;
    assets: number;
    liabilities: number;
    netWorth: number;
    collateral: number;
    relevantLendersCount: number;
    hasAssessment: boolean;
    readinessCategory: string;
  }>({
    studyCost: 0,
    funding: 0,
    gap: 0,
    loanReq: 0,
    assets: 0,
    liabilities: 0,
    netWorth: 0,
    collateral: 0,
    relevantLendersCount: 0,
    hasAssessment: false,
    readinessCategory: 'NOT_EVALUATED'
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [studyRes, fundingRes, finRes, colRes, assessRes, lendersRes] = await Promise.allSettled([
        api.getStudyPlan(),
        api.getFunding(),
        api.getFinancialProfile(),
        api.getCollateral(),
        api.getLatestAssessment(),
        api.getLenders()
      ]);

      const studyPlan = studyRes.status === 'fulfilled' ? studyRes.value.studyPlan : null;
      const fundingSource = fundingRes.status === 'fulfilled' ? fundingRes.value.fundingSource : null;
      const finProfile = finRes.status === 'fulfilled' ? finRes.value.financialProfile : null;
      const collateral = colRes.status === 'fulfilled' ? colRes.value.summary : null;
      const latestAssessment = assessRes.status === 'fulfilled' ? assessRes.value.assessment : null;
      const lenders = lendersRes.status === 'fulfilled' ? lendersRes.value.lenders : [];

      const studyCost = studyPlan?.totalStudyCost || 0;
      const funding = fundingSource?.totalAvailableFunding || 0;
      const gap = fundingSource?.fundingGap || studyCost;
      const loanReq = fundingSource?.estimatedLoanRequirement || Math.max(0, gap);
      const assets = finProfile?.totalAssets || 0;
      const liabilities = finProfile?.totalLiabilities || 0;
      const netWorth = finProfile?.netWorth || 0;
      const colVal = collateral?.totalAvailableCollateral || 0;

      const potentialMatchesCount = latestAssessment?.lenderMatches
        ? latestAssessment.lenderMatches.filter((m: any) => m.isPotentialMatch).length
        : lenders.length;

      setData({
        studyCost,
        funding,
        gap,
        loanReq,
        assets,
        liabilities,
        netWorth,
        collateral: colVal,
        relevantLendersCount: potentialMatchesCount,
        hasAssessment: Boolean(latestAssessment),
        readinessCategory: latestAssessment?.readinessCategory || 'NOT_EVALUATED'
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  // Chart data
  const fundingChartData = [
    { name: 'Available Funding', value: data.funding, color: '#10B981' },
    { name: 'Estimated Loan', value: data.loanReq, color: '#2563EB' }
  ];

  const netWorthChartData = [
    { name: 'Assets', amount: data.assets, fill: '#3B82F6' },
    { name: 'Liabilities', amount: data.liabilities, fill: '#EF4444' },
    { name: 'Net Worth', amount: Math.max(0, data.netWorth), fill: '#10B981' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GradGuide Decision Support Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Education Loan Assessment Overview
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Evaluate your study budget, bridge funding gaps, verify unencumbered collateral, and match dynamically with certified public banks and NBFC lenders.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('assessment')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30"
            >
              <span>{data.hasAssessment ? 'View Assessment Report' : 'Generate Full Assessment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('gap-planner')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Launch Funding Gap Planner</span>
            </button>
            <button
              onClick={() => onNavigate('doc-tracker')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Document Readiness</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid (The 9 Core Required Metrics) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Key Financial Metrics</h2>
          <span className="text-xs text-slate-500">Live Calculated Summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Study Cost"
            value={formatCurrency(data.studyCost)}
            subtitle="Tuition, living, & ancillary expenses"
            icon={GraduationCap}
            variant="blue"
            onClick={() => onNavigate('study')}
          />

          <StatCard
            title="Available Funding"
            value={formatCurrency(data.funding)}
            subtitle="Savings, scholarships & contributions"
            icon={PiggyBank}
            variant="emerald"
            onClick={() => onNavigate('funding')}
          />

          <StatCard
            title="Funding Gap"
            value={formatCurrency(data.gap)}
            subtitle={data.gap <= 0 ? 'Fully covered' : 'Deficit to be funded'}
            icon={AlertCircle}
            variant={data.gap <= 0 ? 'emerald' : 'amber'}
            onClick={() => onNavigate('gap-planner')}
          />

          <StatCard
            title="Estimated Loan Requirement"
            value={formatCurrency(data.loanReq)}
            subtitle="Target borrowing requirement"
            icon={Coins}
            variant="indigo"
            onClick={() => onNavigate('funding')}
          />

          <StatCard
            title="Total Assets"
            value={formatCurrency(data.assets)}
            subtitle="Property, bank deposits, investments"
            icon={Building}
            variant="blue"
            onClick={() => onNavigate('financials')}
          />

          <StatCard
            title="Total Liabilities"
            value={formatCurrency(data.liabilities)}
            subtitle="Existing loans & credit obligations"
            icon={TrendingDown}
            variant="rose"
            onClick={() => onNavigate('financials')}
          />

          <StatCard
            title="Net Worth"
            value={formatCurrency(data.netWorth)}
            subtitle="Assets minus total liabilities"
            icon={Landmark}
            variant="emerald"
            onClick={() => onNavigate('financials')}
          />

          <StatCard
            title="Available Collateral"
            value={formatCurrency(data.collateral)}
            subtitle="Unencumbered pledged security"
            icon={ShieldCheck}
            variant={data.collateral >= data.loanReq ? 'emerald' : 'amber'}
            onClick={() => onNavigate('collateral')}
          />

          <StatCard
            title="Relevant Lenders"
            value={`${data.relevantLendersCount} Lenders`}
            subtitle="Matched against criteria in PostgreSQL"
            icon={Scale}
            variant="indigo"
            onClick={() => onNavigate('comparison')}
          />
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funding Breakdown Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Study Cost Funding Structure</h3>
              <p className="text-xs text-slate-500">Self-funded share vs loan requirement</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {data.studyCost > 0 ? `${Math.round((data.funding / data.studyCost) * 100)}% Funded` : '0%'}
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {data.studyCost > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fundingChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {fundingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val), 'Amount']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                Please enter study cost and funding details to view breakdown.
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-6 text-xs mt-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Available Funding ({formatCurrency(data.funding)})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-slate-600 font-medium">Loan Requirement ({formatCurrency(data.loanReq)})</span>
            </div>
          </div>
        </div>

        {/* Balance Sheet Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Household Balance Sheet</h3>
              <p className="text-xs text-slate-500">Assets vs Liabilities vs Net Worth</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Net: {formatCurrency(data.netWorth)}
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {data.assets > 0 || data.liabilities > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={netWorthChartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val), 'Amount']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                Please add assets and liabilities in the Financial Profile tab to view balance sheet.
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-500 mt-2">
            Values shown in Indian Rupees (INR) based on student/co-applicant declarations.
          </div>
        </div>
      </div>
    </div>
  );
};
