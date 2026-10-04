/**
 * Explainable Lender Matching Engine for EduFinSight (GradGuide)
 * Evaluates student profiles dynamically against database lender criteria.
 * Enforces non-guaranteed, objective, explainable decision support language.
 */

export interface CandidateEvaluationProfile {
  estimatedLoanRequirement: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  cibilScore?: number | null;
  isTop100University: boolean;
  university: string;
  courseName: string;
  totalAvailableCollateral: number;
  coApplicantType: 'SALARIED' | 'SELF_EMPLOYED' | 'NONE';
  coApplicantIncome: number;
  uploadedDocumentTypes: string[]; // e.g. ['ITR', 'BANK_STATEMENT', 'PROPERTY_DOCS']
}

export interface LenderCriteriaRecord {
  id: string;
  lenderId: string;
  loanType: 'COLLATERAL' | 'NON_COLLATERAL' | 'BOTH';
  isOffered: boolean;
  baseInterestRate: number;
  boysInterestRate?: number | null;
  girlsInterestRate?: number | null;
  maxRate?: number | null;
  requiresTop100: boolean;
  requiresCollateral: boolean;
  conditionNote?: string | null;
  requiredDocumentsList: string[] | any;
}

export interface LenderRecord {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string;
  minCibilScore?: number | null;
  criteria: LenderCriteriaRecord[];
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
  relevanceScore: number; // 0 to 100
  matchReasons: string[];
  unmetCriteria: string[];
  missingDocuments: string[];
  caveats: string[];
}

export interface OverallAssessmentResult {
  potentialFinancingRoute: 'COLLATERAL' | 'NON_COLLATERAL' | 'BOTH' | 'NO_LOAN_REQUIRED' | 'INSUFFICIENT_INFORMATION';
  routeExplanation: string;
  lenderMatches: EvaluatedLenderMatch[];
  missingInformation: string[];
  generalDocumentChecklist: {
    documentName: string;
    category: 'Basic' | 'Academic' | 'CoApplicant' | 'Collateral';
    isUploaded: boolean;
  }[];
}

/**
 * Match a candidate profile against lenders loaded from the database
 */
export function matchLenders(
  profile: CandidateEvaluationProfile,
  lenders: LenderRecord[]
): OverallAssessmentResult {
  const matches: EvaluatedLenderMatch[] = [];
  const missingInfoList: string[] = [];

  // Check critical profile information gaps
  if (profile.cibilScore === null || profile.cibilScore === undefined) {
    missingInfoList.push('CIBIL credit score is not supplied. Some public sector lenders require explicit CIBIL benchmarks (e.g. SBI 750, BOB 700, BOI 670).');
  }

  if (profile.coApplicantType === 'NONE' || profile.coApplicantIncome <= 0) {
    missingInfoList.push('Co-applicant financial backing is not specified. Education loans for overseas study universally require a creditworthy co-applicant.');
  }

  // Determine potential financing route
  let potentialRoute: 'COLLATERAL' | 'NON_COLLATERAL' | 'BOTH' | 'NO_LOAN_REQUIRED' | 'INSUFFICIENT_INFORMATION';
  let routeExplanation = '';

  if (profile.estimatedLoanRequirement <= 0) {
    potentialRoute = 'NO_LOAN_REQUIRED';
    routeExplanation = 'Based on your declared savings, scholarships, and contributions, your available funding fully covers the estimated study cost. No loan borrowing is required at this stage.';
  } else if (profile.totalAvailableCollateral >= profile.estimatedLoanRequirement) {
    potentialRoute = 'BOTH';
    routeExplanation = 'Your available collateral value covers 100%+ of the estimated loan requirement. You are well-positioned to explore low-cost public sector collateral loans or fast-track non-collateral routes if preferred.';
  } else if (profile.totalAvailableCollateral > 0) {
    potentialRoute = 'BOTH';
    routeExplanation = 'You have partial collateral available. You may explore partial collateral financing with lenders, or consider unsecured/non-collateral education loans from specialized NBFCs or participating banks.';
  } else {
    potentialRoute = 'NON_COLLATERAL';
    routeExplanation = 'With zero collateral pledged, your financing route is focused on non-collateral (unsecured) loan options. Eligibility will depend heavily on university ranking, academic credentials, and co-applicant income.';
  }

  // Evaluate each lender and their criteria
  for (const lender of lenders) {
    for (const criterion of lender.criteria) {
      // Skip if product is explicitly not offered (e.g. BOI Non-collateral)
      if (!criterion.isOffered) {
        matches.push({
          lenderId: lender.id,
          lenderCode: lender.code,
          lenderName: lender.name,
          lenderType: lender.type,
          loanType: criterion.loanType as 'COLLATERAL' | 'NON_COLLATERAL',
          effectiveRate: 0,
          rateDisplay: 'Not Offered',
          rateNote: criterion.conditionNote || 'Not offered by lender under this scheme',
          isPotentialMatch: false,
          relevanceScore: 0,
          matchReasons: [],
          unmetCriteria: [`${lender.name} does not offer non-collateral education loans in this dataset.`],
          missingDocuments: [],
          caveats: [
            'Lender policy restricts education lending to fully secured/collateral loans.',
            'All loan terms, margins, and sanction decisions require formal credit appraisal and physical document verification by the lender.'
          ]
        });
        continue;
      }

      const matchReasons: string[] = [];
      const unmetCriteria: string[] = [];
      const missingDocs: string[] = [];
      const caveats: string[] = [];
      let score = 50; // base score

      // 1. Calculate effective interest rate (with gender concessions)
      let effectiveRate = criterion.baseInterestRate;
      let rateNote = criterion.conditionNote || undefined;

      if (profile.gender === 'FEMALE' && criterion.girlsInterestRate !== null && criterion.girlsInterestRate !== undefined) {
        effectiveRate = criterion.girlsInterestRate;
        rateNote = `Girl student concessional rate: ${effectiveRate}% applied (${(criterion.baseInterestRate - effectiveRate).toFixed(2)}% concession).`;
      } else if (profile.gender === 'MALE' && criterion.boysInterestRate !== null && criterion.boysInterestRate !== undefined) {
        effectiveRate = criterion.boysInterestRate;
      }

      const rateDisplay = criterion.maxRate
        ? `${effectiveRate.toFixed(2)}% – ${criterion.maxRate.toFixed(2)}%`
        : `${effectiveRate.toFixed(2)}%`;

      // 2. Collateral evaluation
      if (criterion.loanType === 'COLLATERAL') {
        if (profile.totalAvailableCollateral >= profile.estimatedLoanRequirement) {
          score += 25;
          matchReasons.push(`Available collateral (₹${profile.totalAvailableCollateral.toLocaleString()}) covers 100%+ of the estimated loan requirement (₹${profile.estimatedLoanRequirement.toLocaleString()}).`);
        } else if (profile.totalAvailableCollateral > 0) {
          score += 10;
          caveats.push(`Partial collateral available; lender may require additional eligible security or scale back sanctioned loan amount.`);
        } else {
          score -= 30;
          unmetCriteria.push('Collateral loan route requires eligible, marketable immovable property or liquid security.');
        }
      } else {
        // Non-collateral route
        score += 15;
        matchReasons.push('Unsecured/non-collateral option does not require mortgaging property or pledging physical assets.');
      }

      // 3. Top 100 University check (BOB & SBI Non-collateral)
      if (criterion.requiresTop100) {
        if (profile.isTop100University) {
          score += 20;
          matchReasons.push(`University (${profile.university || 'Target University'}) is indicated as a Top 100 global institution, fulfilling lender's premier institution prerequisite.`);
        } else {
          score -= 35;
          unmetCriteria.push(`Lender explicitly restricts non-collateral financing to admitted students in Top 100 ranked global universities.`);
        }
      }

      // 4. CIBIL score check
      if (lender.minCibilScore !== null && lender.minCibilScore !== undefined) {
        if (profile.cibilScore !== null && profile.cibilScore !== undefined) {
          if (profile.cibilScore >= lender.minCibilScore) {
            score += 15;
            matchReasons.push(`Provided CIBIL score (${profile.cibilScore}) meets the lender's benchmark threshold of ${lender.minCibilScore}+.`);
          } else {
            score -= 25;
            unmetCriteria.push(`Provided CIBIL score (${profile.cibilScore}) is below lender's stated minimum cutoff of ${lender.minCibilScore}.`);
          }
        } else {
          caveats.push(`Lender requires a minimum CIBIL score of ${lender.minCibilScore}; applicant score needs to be verified.`);
        }
      } else {
        matchReasons.push('NBFC credit underwriting offers flexible CIBIL consideration based on overall co-applicant cashflow.');
      }

      // 5. Co-applicant check
      if (profile.coApplicantType === 'NONE') {
        caveats.push('A co-applicant is mandatory for processing; co-applicant financials will need to be provided.');
      } else {
        matchReasons.push(`Co-applicant declared (${profile.coApplicantType.toLowerCase().replace('_', '-')}).`);
      }

      // 6. Required Documents Cross-Reference
      const requiredDocsList: string[] = Array.isArray(criterion.requiredDocumentsList)
        ? criterion.requiredDocumentsList
        : [];

      // Check whether key documents are uploaded
      const uploaded = new Set(profile.uploadedDocumentTypes.map((t) => t.toUpperCase()));

      if (criterion.loanType === 'COLLATERAL' && !uploaded.has('PROPERTY_DOCS')) {
        missingDocs.push('Property title deeds / Encumbrance Certificate (EC) required for collateral mortgage');
      }

      if (!uploaded.has('BANK_STATEMENT')) {
        missingDocs.push('Bank account statement for last 6 months');
      }

      if (profile.coApplicantType === 'SALARIED' && !uploaded.has('SALARY_SLIP')) {
        missingDocs.push('Latest 3 months salary slips / Form 16');
      }

      if (!uploaded.has('ITR')) {
        missingDocs.push('Co-applicant Income Tax Returns (ITR) for last 2-3 years');
      }

      if (missingDocs.length > 0) {
        score -= Math.min(20, missingDocs.length * 5);
      } else {
        score += 10;
        matchReasons.push('Key preliminary documentation uploaded for verification.');
      }

      // Bound score between 5 and 98 (never 100% guaranteed approval)
      const boundedScore = Math.max(5, Math.min(95, score));
      const isPotentialMatch = unmetCriteria.length === 0 && boundedScore >= 50;

      // Standard regulatory non-guarantee caveat
      caveats.push('All loan terms, margins, and sanction decisions require formal credit appraisal and physical document verification by the lender.');

      matches.push({
        lenderId: lender.id,
        lenderCode: lender.code,
        lenderName: lender.name,
        lenderType: lender.type,
        loanType: criterion.loanType as 'COLLATERAL' | 'NON_COLLATERAL',
        effectiveRate,
        rateDisplay,
        rateNote,
        isPotentialMatch,
        relevanceScore: boundedScore,
        matchReasons,
        unmetCriteria,
        missingDocuments: missingDocs,
        caveats
      });
    }
  }

  // Sort matches: potential matches first, then descending by relevance score
  matches.sort((a, b) => {
    if (a.isPotentialMatch !== b.isPotentialMatch) {
      return a.isPotentialMatch ? -1 : 1;
    }
    return b.relevanceScore - a.relevanceScore;
  });

  // Build dynamic general document checklist
  const uploadedSet = new Set(profile.uploadedDocumentTypes.map((t) => t.toUpperCase()));
  const generalDocumentChecklist = [
    { documentName: 'PAN Card & Photo Identity Proof', category: 'Basic' as const, isUploaded: uploadedSet.has('PASSPORT_ID') },
    { documentName: 'Proof of Residence (Passport / Electricity Bill / Aadhaar)', category: 'Basic' as const, isUploaded: uploadedSet.has('PASSPORT_ID') },
    { documentName: 'Bank Account Statement (Last 6 Months)', category: 'Basic' as const, isUploaded: uploadedSet.has('BANK_STATEMENT') },
    { documentName: 'Personal Asset & Liability Statement (Self-Attested)', category: 'Basic' as const, isUploaded: uploadedSet.has('CA_NET_WORTH_CERTIFICATE') },
    { documentName: 'Proof of Admission & Course Duration', category: 'Academic' as const, isUploaded: uploadedSet.has('ADMISSION_LETTER') },
    { documentName: 'Fee Structure Breakdown / I-20 Form', category: 'Academic' as const, isUploaded: uploadedSet.has('ADMISSION_LETTER') },
    { documentName: 'Academic Marksheets (10th, 12th, Degree)', category: 'Academic' as const, isUploaded: uploadedSet.has('ACADEMIC_MARKSHEET') },
    { documentName: 'GRE / GMAT / IELTS / TOEFL Scorecard', category: 'Academic' as const, isUploaded: uploadedSet.has('ACADEMIC_MARKSHEET') },
    { documentName: 'Co-Applicant Salary Slips (Last 3 Months)', category: 'CoApplicant' as const, isUploaded: uploadedSet.has('SALARY_SLIP') },
    { documentName: 'Form 16 & Income Tax Returns (ITR - Last 2 Years)', category: 'CoApplicant' as const, isUploaded: uploadedSet.has('ITR') },
    { documentName: 'CA Certified Net Worth Statement', category: 'CoApplicant' as const, isUploaded: uploadedSet.has('CA_NET_WORTH_CERTIFICATE') },
    { documentName: 'Property Registered Title Deed & Sale Agreement', category: 'Collateral' as const, isUploaded: uploadedSet.has('PROPERTY_DOCS') },
    { documentName: '30-Year Encumbrance Certificate (EC) & Chain Deeds', category: 'Collateral' as const, isUploaded: uploadedSet.has('PROPERTY_DOCS') },
    { documentName: 'Approved Building Plan / Layout & Occupancy Certificate', category: 'Collateral' as const, isUploaded: uploadedSet.has('PROPERTY_DOCS') }
  ];

  return {
    potentialFinancingRoute: potentialRoute,
    routeExplanation,
    lenderMatches: matches,
    missingInformation: missingInfoList,
    generalDocumentChecklist
  };
}
