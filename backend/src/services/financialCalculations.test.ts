import { describe, it, expect } from 'vitest';
import {
  calculateStudyCost,
  calculateFunding,
  calculateNetWorth,
  calculateCollateralSummary,
  evaluateFinancialReadiness
} from './financialCalculations';

describe('Financial Calculations Engine', () => {
  describe('calculateStudyCost', () => {
    it('calculates total cost accurately in same currency', () => {
      const result = calculateStudyCost({
        tuitionFee: 30000,
        livingCost: 15000,
        otherExpenses: 5000,
        durationYears: 2,
        exchangeRateToBase: 1
      });

      expect(result.annualCostInCurrency).toBe(50000);
      expect(result.totalCostInCurrency).toBe(100000);
      expect(result.totalStudyCost).toBe(100000);
    });

    it('converts foreign currency to base currency (e.g. USD to INR)', () => {
      const result = calculateStudyCost({
        tuitionFee: 25000,
        livingCost: 12000,
        otherExpenses: 3000,
        durationYears: 1,
        exchangeRateToBase: 83.5
      });

      // 40,000 USD * 83.5 = 3,340,000 INR
      expect(result.annualCostInCurrency).toBe(40000);
      expect(result.totalStudyCost).toBe(3340000);
    });

    it('handles zero or negative values safely', () => {
      const result = calculateStudyCost({
        tuitionFee: -100,
        livingCost: 0,
        otherExpenses: 500,
        durationYears: -1,
        exchangeRateToBase: 0
      });

      // Duration clamps to min 0.5, exchange rate clamps to min 0.0001
      expect(result.totalStudyCost).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateFunding', () => {
    it('calculates available funding, funding gap, and loan requirement', () => {
      const result = calculateFunding({
        totalStudyCost: 4000000,
        savings: 500000,
        scholarship: 1000000,
        feesAlreadyPaid: 200000,
        familyContribution: 300000,
        otherFunding: 0
      });

      expect(result.totalAvailableFunding).toBe(2000000);
      expect(result.fundingGap).toBe(2000000);
      expect(result.estimatedLoanRequirement).toBe(2000000);
      expect(result.selfFundedPercentage).toBe(50);
    });

    it('sets loan requirement to 0 when available funding exceeds study cost', () => {
      const result = calculateFunding({
        totalStudyCost: 2000000,
        savings: 1500000,
        scholarship: 1000000,
        feesAlreadyPaid: 0,
        familyContribution: 500000,
        otherFunding: 0
      });

      expect(result.totalAvailableFunding).toBe(3000000);
      expect(result.fundingGap).toBe(-1000000);
      expect(result.estimatedLoanRequirement).toBe(0);
      expect(result.selfFundedPercentage).toBe(100);
    });
  });

  describe('calculateNetWorth', () => {
    it('calculates total assets, liabilities, and net worth correctly', () => {
      const assets = [
        { assetType: 'PROPERTY', value: 8000000 },
        { assetType: 'BANK_SAVINGS', value: 500000 },
        { assetType: 'INVESTMENTS', value: 1500000 }
      ];

      const liabilities = [
        { liabilityType: 'EXISTING_LOAN', outstandingAmount: 2000000, monthlyEmi: 25000 },
        { liabilityType: 'CREDIT_CARD_DEBT', outstandingAmount: 50000, monthlyEmi: 5000 }
      ];

      const result = calculateNetWorth(assets, liabilities);

      expect(result.totalAssets).toBe(10000000);
      expect(result.totalLiabilities).toBe(2050000);
      expect(result.netWorth).toBe(7950000);
      expect(result.totalMonthlyEmi).toBe(30000);
      expect(result.debtToAssetRatio).toBe(20.5);
    });

    it('handles empty assets and liabilities gracefully', () => {
      const result = calculateNetWorth([], []);
      expect(result.totalAssets).toBe(0);
      expect(result.totalLiabilities).toBe(0);
      expect(result.netWorth).toBe(0);
    });
  });

  describe('calculateCollateralSummary', () => {
    it('distinguishes total asset value from available collateral value', () => {
      const collaterals = [
        {
          collateralType: 'RESIDENTIAL_PROPERTY',
          propertyValue: 6000000,
          eligibleAssetValue: 4800000, // 80% bank margin
          availableCollateralValue: 4500000
        },
        {
          collateralType: 'FIXED_DEPOSIT',
          propertyValue: 1000000,
          eligibleAssetValue: 900000,
          availableCollateralValue: 900000
        }
      ];

      const result = calculateCollateralSummary(collaterals, 5000000);

      expect(result.totalAssetValue).toBe(7000000);
      expect(result.totalEligibleValue).toBe(5700000);
      expect(result.totalAvailableCollateral).toBe(5400000);
      expect(result.collateralToLoanRatio).toBe(108);
    });
  });

  describe('evaluateFinancialReadiness', () => {
    it('returns STRONG when funding coverage, net worth, and collateral are high', () => {
      const result = evaluateFinancialReadiness({
        monthlyIncome: 150000,
        totalMonthlyEmi: 20000,
        netWorth: 10000000,
        loanRequirement: 3000000,
        totalAvailableFunding: 2000000,
        totalStudyCost: 5000000,
        availableCollateral: 4000000,
        uploadedDocumentCount: 6
      });

      expect(result.category).toBe('STRONG');
      expect(result.dimensions.length).toBe(5);
      expect(result.summary).toContain('solid backing');
    });

    it('returns NEEDS_ATTENTION when low funding coverage and high debt burden', () => {
      const result = evaluateFinancialReadiness({
        monthlyIncome: 50000,
        totalMonthlyEmi: 35000,
        netWorth: 500000,
        loanRequirement: 4000000,
        totalAvailableFunding: 100000,
        totalStudyCost: 4100000,
        availableCollateral: 0,
        uploadedDocumentCount: 0
      });

      expect(result.category).toBe('NEEDS_ATTENTION');
      expect(result.actionableRecommendations.length).toBeGreaterThan(0);
    });
  });
});
