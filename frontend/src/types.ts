export type Role = 'STUDENT' | 'COUNSELLOR';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type CoApplicantType = 'SALARIED' | 'SELF_EMPLOYED' | 'NONE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  studentProfileId?: string;
}

export interface StudyPlan {
  id?: string;
  country: string;
  university: string;
  courseName: string;
  durationYears: number;
  currency: string;
  exchangeRateToBase: number;
  tuitionFee: number;
  livingCost: number;
  otherExpenses: number;
  totalStudyCost: number;
  isTop100University: boolean;
}

export interface FundingSource {
  id?: string;
  savings: number;
  scholarship: number;
  feesAlreadyPaid: number;
  familyContribution: number;
  otherFunding: number;
  totalAvailableFunding: number;
  fundingGap: number;
  estimatedLoanRequirement: number;
}

export interface Asset {
  id: string;
  assetType: 'PROPERTY' | 'BANK_SAVINGS' | 'INVESTMENTS' | 'GOLD' | 'OTHER';
  description: string;
  value: number;
}

export interface Liability {
  id: string;
  liabilityType: 'EXISTING_LOAN' | 'CREDIT_CARD_DEBT' | 'OTHER';
  description: string;
  outstandingAmount: number;
  monthlyEmi: number;
}

export interface FinancialProfile {
  id?: string;
  monthlyIncome: number;
  annualIncome: number;
  otherIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assets?: Asset[];
  liabilities?: Liability[];
}

export interface Collateral {
  id: string;
  collateralType: 'RESIDENTIAL_PROPERTY' | 'COMMERCIAL_PROPERTY' | 'FIXED_DEPOSIT' | 'LAND' | 'OTHER';
  description: string;
  propertyValue: number;
  eligibleAssetValue: number;
  ownershipInfo: string;
  availableCollateralValue: number;
  hasEncumbranceCert: boolean;
  hasApprovedLayout: boolean;
  hasOccupancyCert: boolean;
  state?: string | null;
}

export interface DocumentItem {
  id: string;
  documentType:
    | 'ITR'
    | 'BANK_STATEMENT'
    | 'SALARY_SLIP'
    | 'CA_NET_WORTH_CERTIFICATE'
    | 'PROPERTY_DOCS'
    | 'PASSPORT_ID'
    | 'ADMISSION_LETTER'
    | 'ACADEMIC_MARKSHEET'
    | 'OTHER';
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: 'NOT_UPLOADED' | 'UPLOADED' | 'UNDER_REVIEW';
  notes?: string | null;
  createdAt: string;
}

export interface LenderCriteria {
  id: string;
  lenderId: string;
  loanType: 'COLLATERAL' | 'NON_COLLATERAL';
  isOffered: boolean;
  baseInterestRate: number;
  boysInterestRate?: number | null;
  girlsInterestRate?: number | null;
  maxRate?: number | null;
  requiresTop100: boolean;
  requiresCollateral: boolean;
  conditionNote?: string | null;
  requiredDocumentsList: string[];
}

export interface Lender {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string;
  minCibilScore: number | null;
  criteria: LenderCriteria[];
}

export interface EvaluatedLenderMatch {
  lenderId: string;
  lenderCode: string;
  lenderName: string;
  lenderType: string;
  loanType: 'COLLATERAL' | 'NON_COLLATERAL';
  effectiveRate: number;
  rateDisplay: string;
  rateNote?: string;
  isPotentialMatch: boolean;
  relevanceScore: number;
  matchReasons: string[];
  unmetCriteria: string[];
  missingDocuments: string[];
  caveats: string[];
}

export interface ReadinessDimension {
  dimension: string;
  status: 'STRONG' | 'MODERATE' | 'NEEDS_ATTENTION';
  observation: string;
  rationale: string;
}

export interface FinancialReadinessResult {
  category: 'STRONG' | 'MODERATE' | 'NEEDS_ATTENTION';
  summary: string;
  dimensions: ReadinessDimension[];
  actionableRecommendations: string[];
}

export interface AssessmentRecord {
  id: string;
  totalStudyCost: number;
  availableFunding: number;
  fundingGap: number;
  estimatedLoanRequirement: number;
  netWorth: number;
  totalCollateral: number;
  cibilScore?: number | null;
  potentialRoute: 'COLLATERAL' | 'NON_COLLATERAL' | 'BOTH' | 'NO_LOAN_REQUIRED' | 'INSUFFICIENT_INFORMATION';
  routeExplanation?: string;
  readinessCategory: 'STRONG' | 'MODERATE' | 'NEEDS_ATTENTION';
  readinessScoreExplanation: FinancialReadinessResult;
  readinessSnapshot?: FinancialReadinessResult;
  missingInformation: string[];
  documentChecklist: {
    documentName: string;
    category: 'Basic' | 'Academic' | 'CoApplicant' | 'Collateral';
    isUploaded: boolean;
  }[];
  disclaimer: string;
  lenderMatches: EvaluatedLenderMatch[];
  createdAt: string;
}
