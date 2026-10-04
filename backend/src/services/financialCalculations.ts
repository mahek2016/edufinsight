/**
 * Financial Calculation Engine for EduFinSight (GradGuide Education Loan Assessment Tool)
 * Pure, deterministic functions with no side effects for core financial formulas.
 */

export interface StudyCostInput {
  tuitionFee: number;
  livingCost: number;
  otherExpenses: number;
  durationYears: number;
  exchangeRateToBase?: number;
}

export interface StudyCostResult {
  annualCostInCurrency: number;
  totalCostInCurrency: number;
  exchangeRateToBase: number;
  totalStudyCost: number; // in base currency (e.g. INR)
}

export interface FundingInput {
  totalStudyCost: number;
  savings: number;
  scholarship: number;
  feesAlreadyPaid: number;
  familyContribution: number;
  otherFunding: number;
}

export interface FundingResult {
  totalAvailableFunding: number;
  fundingGap: number;
  estimatedLoanRequirement: number;
  selfFundedPercentage: number;
}

export interface AssetItem {
  assetType: string;
  value: number;
  description?: string;
}

export interface LiabilityItem {
  liabilityType: string;
  outstandingAmount: number;
  monthlyEmi?: number;
  description?: string;
}

export interface FinancialProfileResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalMonthlyEmi: number;
  debtToAssetRatio: number;
}

export interface CollateralItem {
  collateralType: string;
  propertyValue: number;
  eligibleAssetValue: number;
  availableCollateralValue: number;
  hasEncumbranceCert?: boolean;
  hasApprovedLayout?: boolean;
}

export interface CollateralResult {
  totalAssetValue: number;
  totalEligibleValue: number;
  totalAvailableCollateral: number;
  collateralToLoanRatio: number; // calculated against loan requirement
}

export type ReadinessCategory = 'STRONG' | 'MODERATE' | 'NEEDS_ATTENTION';

export interface ReadinessDimension {
  dimension: string;
  status: ReadinessCategory;
  observation: string;
  rationale: string;
}

export interface FinancialReadinessResult {
  category: ReadinessCategory;
  summary: string;
  dimensions: ReadinessDimension[];
  actionableRecommendations: string[];
}

/**
 * 1. Calculate Total Study Cost
 * Formula: ((Tuition + Living + Other) * Duration) * Exchange Rate
 */
export function calculateStudyCost(input: StudyCostInput): StudyCostResult {
  const tuition = Math.max(0, Number(input.tuitionFee) || 0);
  const living = Math.max(0, Number(input.livingCost) || 0);
  const other = Math.max(0, Number(input.otherExpenses) || 0);
  const duration = Math.max(0.5, Number(input.durationYears) || 1);
  const exchangeRate = Math.max(0.0001, Number(input.exchangeRateToBase) || 1);

  const annualCostInCurrency = tuition + living + other;
  const totalCostInCurrency = annualCostInCurrency * duration;
  const totalStudyCost = Math.round(totalCostInCurrency * exchangeRate * 100) / 100;

  return {
    annualCostInCurrency,
    totalCostInCurrency,
    exchangeRateToBase: exchangeRate,
    totalStudyCost
  };
}

/**
 * 2. Calculate Funding Details & Loan Requirement
 * Formula:
 * Available Funding = Savings + Scholarship + Fees Paid + Family Contribution + Other Funding
 * Funding Gap = Total Study Cost - Available Funding
 * Loan Requirement = Math.max(Funding Gap, 0)
 */
export function calculateFunding(input: FundingInput): FundingResult {
  const totalCost = Math.max(0, Number(input.totalStudyCost) || 0);
  const savings = Math.max(0, Number(input.savings) || 0);
  const scholarship = Math.max(0, Number(input.scholarship) || 0);
  const feesAlreadyPaid = Math.max(0, Number(input.feesAlreadyPaid) || 0);
  const familyContribution = Math.max(0, Number(input.familyContribution) || 0);
  const otherFunding = Math.max(0, Number(input.otherFunding) || 0);

  const totalAvailableFunding = Math.round(
    (savings + scholarship + feesAlreadyPaid + familyContribution + otherFunding) * 100
  ) / 100;

  const fundingGap = Math.round((totalCost - totalAvailableFunding) * 100) / 100;
  const estimatedLoanRequirement = Math.max(0, fundingGap);

  const selfFundedPercentage = totalCost > 0
    ? Math.min(100, Math.round((totalAvailableFunding / totalCost) * 10000) / 100)
    : 0;

  return {
    totalAvailableFunding,
    fundingGap,
    estimatedLoanRequirement,
    selfFundedPercentage
  };
}

/**
 * 3. Calculate Financial Profile & Net Worth
 * Formula:
 * Total Assets = Sum of asset values
 * Total Liabilities = Sum of liability outstanding balances
 * Net Worth = Total Assets - Total Liabilities
 */
export function calculateNetWorth(
  assets: AssetItem[] = [],
  liabilities: LiabilityItem[] = []
): FinancialProfileResult {
  const totalAssets = assets.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const totalLiabilities = liabilities.reduce(
    (sum, item) => sum + (Number(item.outstandingAmount) || 0),
    0
  );
  const totalMonthlyEmi = liabilities.reduce(
    (sum, item) => sum + (Number(item.monthlyEmi) || 0),
    0
  );

  const netWorth = Math.round((totalAssets - totalLiabilities) * 100) / 100;
  const debtToAssetRatio = totalAssets > 0
    ? Math.round((totalLiabilities / totalAssets) * 10000) / 100
    : (totalLiabilities > 0 ? 100 : 0);

  return {
    totalAssets: Math.round(totalAssets * 100) / 100,
    totalLiabilities: Math.round(totalLiabilities * 100) / 100,
    netWorth,
    totalMonthlyEmi: Math.round(totalMonthlyEmi * 100) / 100,
    debtToAssetRatio
  };
}

/**
 * 4. Calculate Collateral Summary
 * Explicitly separates Total Asset Value from Available Collateral Value
 */
export function calculateCollateralSummary(
  collaterals: CollateralItem[] = [],
  loanRequirement: number = 0
): CollateralResult {
  const totalAssetValue = collaterals.reduce(
    (sum, item) => sum + (Number(item.propertyValue) || 0),
    0
  );
  const totalEligibleValue = collaterals.reduce(
    (sum, item) => sum + (Number(item.eligibleAssetValue) || 0),
    0
  );
  const totalAvailableCollateral = collaterals.reduce(
    (sum, item) => sum + (Number(item.availableCollateralValue) || 0),
    0
  );

  const collateralToLoanRatio = loanRequirement > 0
    ? Math.round((totalAvailableCollateral / loanRequirement) * 10000) / 100
    : (totalAvailableCollateral > 0 ? 100 : 0);

  return {
    totalAssetValue: Math.round(totalAssetValue * 100) / 100,
    totalEligibleValue: Math.round(totalEligibleValue * 100) / 100,
    totalAvailableCollateral: Math.round(totalAvailableCollateral * 100) / 100,
    collateralToLoanRatio
  };
}

/**
 * 5. Original Feature #2: Financial Readiness Snapshot
 * Transparent, multi-factor readiness evaluation with explainable "WHY" reasons.
 * Strictly avoids fake precision or credit scores.
 */
export function evaluateFinancialReadiness(params: {
  monthlyIncome: number;
  totalMonthlyEmi: number;
  netWorth: number;
  loanRequirement: number;
  totalAvailableFunding: number;
  totalStudyCost: number;
  availableCollateral: number;
  uploadedDocumentCount: number;
}): FinancialReadinessResult {
  const {
    monthlyIncome,
    totalMonthlyEmi,
    netWorth,
    loanRequirement,
    totalAvailableFunding,
    totalStudyCost,
    availableCollateral,
    uploadedDocumentCount
  } = params;

  const dimensions: ReadinessDimension[] = [];
  const recommendations: string[] = [];

  // Dimension A: Funding Gap Cushion
  const selfFundRatio = totalStudyCost > 0 ? (totalAvailableFunding / totalStudyCost) : 0;
  if (loanRequirement === 0) {
    dimensions.push({
      dimension: 'Funding Coverage',
      status: 'STRONG',
      observation: '100% self-funded or covered by scholarships/savings.',
      rationale: 'No external borrowing required based on declared funding.'
    });
  } else if (selfFundRatio >= 0.35) {
    dimensions.push({
      dimension: 'Funding Coverage',
      status: 'STRONG',
      observation: `Available funding covers ${Math.round(selfFundRatio * 100)}% of the total study cost.`,
      rationale: 'Strong family contribution / savings cushion significantly reduces borrowing stress.'
    });
  } else if (selfFundRatio >= 0.15) {
    dimensions.push({
      dimension: 'Funding Coverage',
      status: 'MODERATE',
      observation: `Available funding covers ${Math.round(selfFundRatio * 100)}% of total study cost.`,
      rationale: 'Moderate contribution; the student will rely primarily on financing for remaining expenses.'
    });
    recommendations.push('Explore university assistantships or additional external scholarships to narrow the funding gap.');
  } else {
    dimensions.push({
      dimension: 'Funding Coverage',
      status: 'NEEDS_ATTENTION',
      observation: `Available funding covers less than 15% of total study cost.`,
      rationale: 'High dependency on loan financing (>85% of program budget).'
    });
    recommendations.push('Increase co-applicant savings allocation or search for merit-based tuition waivers to decrease borrowing exposure.');
  }

  // Dimension B: Net Worth vs Loan Requirement
  if (loanRequirement <= 0) {
    dimensions.push({
      dimension: 'Net Worth Backing',
      status: 'STRONG',
      observation: 'Zero loan requirement.',
      rationale: 'Financial balance sheet is completely unencumbered by new student debt.'
    });
  } else if (netWorth >= loanRequirement * 1.5) {
    dimensions.push({
      dimension: 'Net Worth Backing',
      status: 'STRONG',
      observation: `Household net worth exceeds 1.5x of estimated loan requirement.`,
      rationale: 'Family asset position provides strong solvency support.'
    });
  } else if (netWorth >= loanRequirement * 0.75) {
    dimensions.push({
      dimension: 'Net Worth Backing',
      status: 'MODERATE',
      observation: `Household net worth covers between 75% and 150% of the loan amount.`,
      rationale: 'Sufficient balance sheet strength, but limited buffer for unplanned expenses.'
    });
  } else {
    dimensions.push({
      dimension: 'Net Worth Backing',
      status: 'NEEDS_ATTENTION',
      observation: `Household net worth is lower than 75% of the loan requirement.`,
      rationale: 'Limited asset buffer increases sensitivity to underwriting scrutiny.'
    });
    recommendations.push('A co-applicant with established property or investment backing will strengthen the profile.');
  }

  // Dimension C: Co-Applicant Cashflow & Debt Burden
  const dti = monthlyIncome > 0 ? (totalMonthlyEmi / monthlyIncome) : 1;
  if (monthlyIncome > 0 && dti <= 0.3) {
    dimensions.push({
      dimension: 'Debt-to-Income Buffer',
      status: 'STRONG',
      observation: `Existing monthly EMI obligations represent ${Math.round(dti * 100)}% of monthly income.`,
      rationale: 'Healthy disposable income available to service potential interest payments during moratorium.'
    });
  } else if (monthlyIncome > 0 && dti <= 0.5) {
    dimensions.push({
      dimension: 'Debt-to-Income Buffer',
      status: 'MODERATE',
      observation: `Existing monthly EMI obligations represent ${Math.round(dti * 100)}% of monthly income.`,
      rationale: 'Moderate debt servicing load; leaves manageable margin for additional debt.'
    });
  } else {
    dimensions.push({
      dimension: 'Debt-to-Income Buffer',
      status: 'NEEDS_ATTENTION',
      observation: monthlyIncome > 0
        ? `Existing EMIs consume ${Math.round(dti * 100)}% of monthly income.`
        : 'Co-applicant monthly income details have not been declared.',
      rationale: 'High existing debt commitments or unverified cash flow creates risk during lender underwriting.'
    });
    recommendations.push('Consider consolidating or prepaying high-interest personal debt / credit cards before applying.');
  }

  // Dimension D: Collateral Readiness
  if (loanRequirement <= 0) {
    dimensions.push({
      dimension: 'Collateral Positioning',
      status: 'STRONG',
      observation: 'Not applicable (No loan needed).',
      rationale: 'Collateral is not required.'
    });
  } else if (availableCollateral >= loanRequirement) {
    dimensions.push({
      dimension: 'Collateral Positioning',
      status: 'STRONG',
      observation: 'Available collateral fully covers 100%+ of the estimated loan requirement.',
      rationale: 'Qualifies applicant for lower public bank interest rates (e.g. SBI 8.40%, BOI 8.60%/9.00%).'
    });
  } else if (availableCollateral > 0) {
    dimensions.push({
      dimension: 'Collateral Positioning',
      status: 'MODERATE',
      observation: 'Partial collateral available, but insufficient to cover 100% of the loan.',
      rationale: 'May require split financing or opting for an unsecured NBFC route with slightly higher interest rates.'
    });
    recommendations.push('Obtain latest title search / 30-year Encumbrance Certificate (EC) to maximize eligible collateral valuation.');
  } else {
    dimensions.push({
      dimension: 'Collateral Positioning',
      status: 'NEEDS_ATTENTION',
      observation: 'Zero collateral pledged.',
      rationale: 'Limits financing options strictly to non-collateral routes, requiring strong academic pedigree and university ranking.'
    });
    recommendations.push('Focus on lenders offering non-collateral products (SBI, BOB, Auxilo, Credila) and ensure top 100 ranking documentation.');
  }

  // Dimension E: Document Evidence
  if (uploadedDocumentCount >= 5) {
    dimensions.push({
      dimension: 'Document Evidence',
      status: 'STRONG',
      observation: `${uploadedDocumentCount} supporting documents uploaded.`,
      rationale: 'Good foundation of KYC, academic, and financial evidence submitted.'
    });
  } else if (uploadedDocumentCount >= 2) {
    dimensions.push({
      dimension: 'Document Evidence',
      status: 'MODERATE',
      observation: `${uploadedDocumentCount} supporting documents uploaded.`,
      rationale: 'Core documents partially supplied, but key income or academic proofs are pending.'
    });
    recommendations.push('Upload recent 6 months bank statements, 2 years ITR, and university admission/fee structure.');
  } else {
    dimensions.push({
      dimension: 'Document Evidence',
      status: 'NEEDS_ATTENTION',
      observation: 'Minimal or no supporting documentation uploaded.',
      rationale: 'Lenders require verifiable documentation before initiating credit assessment.'
    });
    recommendations.push('Prepare basic KYC (PAN, Aadhaar/Passport), 6 months bank statements, and salary slips / ITR.');
  }

  // Aggregate Category
  const needsAttentionCount = dimensions.filter((d) => d.status === 'NEEDS_ATTENTION').length;
  const strongCount = dimensions.filter((d) => d.status === 'STRONG').length;

  let category: ReadinessCategory = 'MODERATE';
  let summary = '';

  if (needsAttentionCount >= 2) {
    category = 'NEEDS_ATTENTION';
    summary = 'Your profile has important gaps in funding coverage, collateral, or documentation that require attention prior to formal application.';
  } else if (strongCount >= 3 && needsAttentionCount === 0) {
    category = 'STRONG';
    summary = 'Your financial profile demonstrates solid backing with comfortable coverage and healthy debt capacity.';
  } else {
    category = 'MODERATE';
    summary = 'Your profile is moderately positioned; addressing a few key documentation and co-applicant details will improve lender interest.';
  }

  return {
    category,
    summary,
    dimensions,
    actionableRecommendations: recommendations
  };
}
