export interface SeedLenderCriteria {
  loanType: 'COLLATERAL' | 'NON_COLLATERAL';
  isOffered: boolean;
  baseInterestRate: number;
  boysInterestRate?: number | null;
  girlsInterestRate?: number | null;
  maxRate?: number | null;
  requiresTop100: boolean;
  requiresCollateral: boolean;
  conditionNote?: string;
  requiredDocumentsList: string[];
}

export interface SeedLender {
  code: string;
  name: string;
  type: string;
  description: string;
  minCibilScore: number | null;
  criteria: SeedLenderCriteria[];
}

const basicDocuments = [
  'PAN Card',
  'Proof of residence (Voter ID / Passport / Electricity Bill / Aadhaar)',
  'Bank account statement for last 6 months (personal / salary)',
  'Personal Asset & Liability Statement (Self-attested)'
];

const academicDocuments = [
  '10th, 12th and Degree marksheets/certificates',
  'Proof of admission showing total course duration',
  'Fee structure (I-20 for US, if available)',
  'IELTS / GMAT / GRE score card',
  'University ranking print-out'
];

const salariedCoApplicantDocs = [
  'Latest salary slips (last 3 months)',
  'Form 16 (last 2 years)',
  'Employer ID card',
  'ITR (last 2 years)'
];

const collateralPropertyDocs = [
  'Property title deed and registered sale agreement',
  'Original registration receipt',
  'Allotment letter by Municipal Corporation / authorised government authority',
  'Previous chain of sale deeds / Encumbrance Certificate (EC) of last 30 years',
  'Latest property tax bill or electricity bill with same address',
  'Municipality-approved building plan or plot layout',
  'Occupancy Certificate (OC), if apartment'
];

export const LENDER_SEED_DATA: SeedLender[] = [
  {
    code: 'BOI',
    name: 'Bank of India',
    type: 'Public Sector Bank',
    description: 'Nationalised public sector bank offering competitive collateralised education loans with special girl student concessions.',
    minCibilScore: 670,
    criteria: [
      {
        loanType: 'COLLATERAL',
        isOffered: true,
        baseInterestRate: 9.00,
        boysInterestRate: 9.00,
        girlsInterestRate: 8.60,
        maxRate: null,
        requiresTop100: false,
        requiresCollateral: true,
        conditionNote: 'Girls concession rate: 8.60%',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs,
          ...collateralPropertyDocs
        ]
      },
      {
        loanType: 'NON_COLLATERAL',
        isOffered: false,
        baseInterestRate: 0,
        boysInterestRate: null,
        girlsInterestRate: null,
        maxRate: null,
        requiresTop100: false,
        requiresCollateral: false,
        conditionNote: 'Not possible (Non-collateral loans are not offered by Bank of India under this scheme)',
        requiredDocumentsList: []
      }
    ]
  },
  {
    code: 'BOB',
    name: 'Bank of Baroda',
    type: 'Public Sector Bank',
    description: 'Premier public bank with the Baroda Scholar Scheme offering concessional rates for female students and premier university applicants.',
    minCibilScore: 700,
    criteria: [
      {
        loanType: 'COLLATERAL',
        isOffered: true,
        baseInterestRate: 8.95,
        boysInterestRate: 8.95,
        girlsInterestRate: 8.75,
        maxRate: null,
        requiresTop100: false,
        requiresCollateral: true,
        conditionNote: 'Boys: 8.95%, Girls: 8.75%',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs,
          ...collateralPropertyDocs
        ]
      },
      {
        loanType: 'NON_COLLATERAL',
        isOffered: true,
        baseInterestRate: 8.45,
        boysInterestRate: 8.45,
        girlsInterestRate: 8.45,
        maxRate: null,
        requiresTop100: true,
        requiresCollateral: false,
        conditionNote: 'Strictly restricted to Top 100 universities',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs
        ]
      }
    ]
  },
  {
    code: 'SBI',
    name: 'State Bank of India',
    type: 'Public Sector Bank',
    description: "India's largest commercial bank offering SBI Global Ed-vantage scheme for overseas education.",
    minCibilScore: 750,
    criteria: [
      {
        loanType: 'COLLATERAL',
        isOffered: true,
        baseInterestRate: 8.40,
        boysInterestRate: 8.40,
        girlsInterestRate: 8.40,
        maxRate: null,
        requiresTop100: false,
        requiresCollateral: true,
        conditionNote: 'Market-leading collateral rate at 8.40%',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs,
          ...collateralPropertyDocs
        ]
      },
      {
        loanType: 'NON_COLLATERAL',
        isOffered: true,
        baseInterestRate: 9.40,
        boysInterestRate: 9.40,
        girlsInterestRate: 9.40,
        maxRate: null,
        requiresTop100: true,
        requiresCollateral: false,
        conditionNote: 'Applicable exclusively for Top 100 global universities',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs
        ]
      }
    ]
  },
  {
    code: 'CREDILA',
    name: 'HDFC Credila',
    type: 'NBFC (Non-Banking Financial Company)',
    description: 'Specialised education loan company with flexible underwriting criteria and customized non-collateral solutions.',
    minCibilScore: null,
    criteria: [
      {
        loanType: 'COLLATERAL',
        isOffered: true,
        baseInterestRate: 9.25,
        boysInterestRate: 9.25,
        girlsInterestRate: 9.25,
        maxRate: 9.75,
        requiresTop100: false,
        requiresCollateral: true,
        conditionNote: 'Spread range: 9.25% - 9.75% depending on profile risk',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs,
          ...collateralPropertyDocs
        ]
      },
      {
        loanType: 'NON_COLLATERAL',
        isOffered: true,
        baseInterestRate: 10.75,
        boysInterestRate: 10.75,
        girlsInterestRate: 10.75,
        maxRate: null,
        requiresTop100: false,
        requiresCollateral: false,
        conditionNote: 'Unsecured education loan with flexible co-applicant acceptance',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs
        ]
      }
    ]
  },
  {
    code: 'AUXILO',
    name: 'Auxilo Finserve',
    type: 'NBFC (Non-Banking Financial Company)',
    description: 'Pro-education lender offering 100% financing for tuition, living, and ancillary travel expenses.',
    minCibilScore: null,
    criteria: [
      {
        loanType: 'COLLATERAL',
        isOffered: true,
        baseInterestRate: 10.00,
        boysInterestRate: 10.00,
        girlsInterestRate: 10.00,
        maxRate: null,
        requiresTop100: false,
        requiresCollateral: true,
        conditionNote: 'Collateral rate at 10.00%',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs,
          ...collateralPropertyDocs
        ]
      },
      {
        loanType: 'NON_COLLATERAL',
        isOffered: true,
        baseInterestRate: 10.25,
        boysInterestRate: 10.25,
        girlsInterestRate: 10.25,
        maxRate: null,
        requiresTop100: false,
        requiresCollateral: false,
        conditionNote: 'Higher sanction caps for unsecured study abroad programs',
        requiredDocumentsList: [
          ...basicDocuments,
          ...academicDocuments,
          ...salariedCoApplicantDocs
        ]
      }
    ]
  }
];

export function getFormattedSeedLenders() {
  return LENDER_SEED_DATA.map((l) => ({
    id: `seed-${l.code.toLowerCase()}`,
    code: l.code,
    name: l.name,
    type: l.type,
    description: l.description,
    minCibilScore: l.minCibilScore,
    criteria: l.criteria.map((c, cIdx) => ({
      id: `seed-crit-${l.code.toLowerCase()}-${cIdx}`,
      lenderId: `seed-${l.code.toLowerCase()}`,
      loanType: c.loanType,
      isOffered: c.isOffered,
      baseInterestRate: c.baseInterestRate,
      boysInterestRate: c.boysInterestRate,
      girlsInterestRate: c.girlsInterestRate,
      maxRate: c.maxRate,
      requiresTop100: c.requiresTop100,
      requiresCollateral: c.requiresCollateral,
      conditionNote: c.conditionNote,
      requiredDocumentsList: c.requiredDocumentsList
    }))
  }));
}
