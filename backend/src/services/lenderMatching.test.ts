import { describe, it, expect } from 'vitest';
import { matchLenders, CandidateEvaluationProfile, LenderRecord } from './lenderMatching';
import { LENDER_SEED_DATA } from '../data/lenderData';

// Convert seed data format to LenderRecord for testing
const mockLenders: LenderRecord[] = LENDER_SEED_DATA.map((l, index) => ({
  id: `lender-${index + 1}`,
  code: l.code,
  name: l.name,
  type: l.type,
  description: l.description,
  minCibilScore: l.minCibilScore,
  criteria: l.criteria.map((c, cIdx) => ({
    id: `crit-${index + 1}-${cIdx + 1}`,
    lenderId: `lender-${index + 1}`,
    loanType: c.loanType as any,
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

describe('Lender Matching Engine', () => {
  it('correctly applies girl student concession rates for BOI and BOB', () => {
    const femaleProfile: CandidateEvaluationProfile = {
      estimatedLoanRequirement: 3000000,
      gender: 'FEMALE',
      cibilScore: 780,
      isTop100University: true,
      university: 'Oxford University',
      courseName: 'MSc Computer Science',
      totalAvailableCollateral: 4000000,
      coApplicantType: 'SALARIED',
      coApplicantIncome: 120000,
      uploadedDocumentTypes: ['ITR', 'BANK_STATEMENT', 'PROPERTY_DOCS', 'SALARY_SLIP', 'ADMISSION_LETTER']
    };

    const result = matchLenders(femaleProfile, mockLenders);

    const boiCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'BOI' && m.loanType === 'COLLATERAL'
    );
    const bobCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'BOB' && m.loanType === 'COLLATERAL'
    );

    expect(boiCollateral).toBeDefined();
    expect(boiCollateral?.effectiveRate).toBe(8.60); // 8.60% concession
    expect(boiCollateral?.rateNote).toContain('Girl student concessional rate');

    expect(bobCollateral).toBeDefined();
    expect(bobCollateral?.effectiveRate).toBe(8.75); // 8.75% for girls
  });

  it('applies general / boys rates for male students', () => {
    const maleProfile: CandidateEvaluationProfile = {
      estimatedLoanRequirement: 3000000,
      gender: 'MALE',
      cibilScore: 780,
      isTop100University: true,
      university: 'Oxford University',
      courseName: 'MSc Computer Science',
      totalAvailableCollateral: 4000000,
      coApplicantType: 'SALARIED',
      coApplicantIncome: 120000,
      uploadedDocumentTypes: ['ITR', 'BANK_STATEMENT', 'PROPERTY_DOCS']
    };

    const result = matchLenders(maleProfile, mockLenders);

    const boiCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'BOI' && m.loanType === 'COLLATERAL'
    );
    const bobCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'BOB' && m.loanType === 'COLLATERAL'
    );

    expect(boiCollateral?.effectiveRate).toBe(9.00);
    expect(bobCollateral?.effectiveRate).toBe(8.95);
  });

  it('marks BOI non-collateral as Not Offered', () => {
    const profile: CandidateEvaluationProfile = {
      estimatedLoanRequirement: 2000000,
      gender: 'MALE',
      cibilScore: 750,
      isTop100University: true,
      university: 'Imperial College',
      courseName: 'Engineering',
      totalAvailableCollateral: 0,
      coApplicantType: 'SALARIED',
      coApplicantIncome: 100000,
      uploadedDocumentTypes: []
    };

    const result = matchLenders(profile, mockLenders);
    const boiNonCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'BOI' && m.loanType === 'NON_COLLATERAL'
    );

    expect(boiNonCollateral).toBeDefined();
    expect(boiNonCollateral?.isPotentialMatch).toBe(false);
    expect(boiNonCollateral?.rateDisplay).toBe('Not Offered');
    expect(boiNonCollateral?.unmetCriteria[0]).toContain('does not offer non-collateral education loans');
  });

  it('enforces Top 100 university requirement for BOB and SBI non-collateral', () => {
    const nonTop100Profile: CandidateEvaluationProfile = {
      estimatedLoanRequirement: 2500000,
      gender: 'MALE',
      cibilScore: 780,
      isTop100University: false,
      university: 'Tier 3 Regional College',
      courseName: 'Business',
      totalAvailableCollateral: 0,
      coApplicantType: 'SALARIED',
      coApplicantIncome: 80000,
      uploadedDocumentTypes: []
    };

    const result = matchLenders(nonTop100Profile, mockLenders);

    const bobNonCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'BOB' && m.loanType === 'NON_COLLATERAL'
    );
    const sbiNonCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'SBI' && m.loanType === 'NON_COLLATERAL'
    );

    expect(bobNonCollateral?.isPotentialMatch).toBe(false);
    expect(bobNonCollateral?.unmetCriteria.some((u) => u.includes('Top 100'))).toBe(true);

    expect(sbiNonCollateral?.isPotentialMatch).toBe(false);
    expect(sbiNonCollateral?.unmetCriteria.some((u) => u.includes('Top 100'))).toBe(true);
  });

  it('validates CIBIL score against strict lender cutoffs (SBI 750, BOB 700)', () => {
    const lowCibilProfile: CandidateEvaluationProfile = {
      estimatedLoanRequirement: 3000000,
      gender: 'MALE',
      cibilScore: 710, // Passes BOB (700) and BOI (670), fails SBI (750)
      isTop100University: true,
      university: 'Harvard University',
      courseName: 'MBA',
      totalAvailableCollateral: 5000000,
      coApplicantType: 'SALARIED',
      coApplicantIncome: 200000,
      uploadedDocumentTypes: ['ITR', 'BANK_STATEMENT', 'PROPERTY_DOCS']
    };

    const result = matchLenders(lowCibilProfile, mockLenders);

    const sbiCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'SBI' && m.loanType === 'COLLATERAL'
    );
    const bobCollateral = result.lenderMatches.find(
      (m) => m.lenderCode === 'BOB' && m.loanType === 'COLLATERAL'
    );

    expect(sbiCollateral?.isPotentialMatch).toBe(false);
    expect(sbiCollateral?.unmetCriteria.some((u) => u.includes('below lender\'s stated minimum cutoff of 750'))).toBe(true);

    expect(bobCollateral?.isPotentialMatch).toBe(true);
    expect(bobCollateral?.matchReasons.some((r) => r.includes('meets the lender\'s benchmark threshold of 700+'))).toBe(true);
  });

  it('never outputs guarantee phrasing and includes legal disclaimers', () => {
    const topProfile: CandidateEvaluationProfile = {
      estimatedLoanRequirement: 2000000,
      gender: 'FEMALE',
      cibilScore: 850,
      isTop100University: true,
      university: 'MIT',
      courseName: 'MSc Data Science',
      totalAvailableCollateral: 10000000,
      coApplicantType: 'SALARIED',
      coApplicantIncome: 300000,
      uploadedDocumentTypes: ['ITR', 'BANK_STATEMENT', 'PROPERTY_DOCS', 'SALARY_SLIP', 'ADMISSION_LETTER', 'PASSPORT_ID']
    };

    const result = matchLenders(topProfile, mockLenders);

    for (const match of result.lenderMatches) {
      expect(match.relevanceScore).toBeLessThan(100); // Never 100%
      for (const reason of match.matchReasons) {
        expect(reason.toLowerCase()).not.toContain('guaranteed');
        expect(reason.toLowerCase()).not.toContain('definite approval');
      }
      expect(match.caveats.some((c) => c.includes('formal credit appraisal'))).toBe(true);
    }
  });
});
