# EduFinSight Database Schema & Models

Relational PostgreSQL database schema configured via **Prisma ORM**.

---

## Entity Relationship Overview

```
User (1) ── (1) StudentProfile
                     ├── (1) StudyPlan
                     ├── (1) FundingSource
                     ├── (1) FinancialProfile ── (N) Asset
                     │                        └── (N) Liability
                     ├── (N) Collateral
                     ├── (N) Document
                     └── (N) Assessment ── (N) AssessmentLenderMatch ── (1) Lender
                                                                          └── (N) LenderCriteria
```

---

## Model Specifications

### 1. `User`
Primary credential and session entity.
- `id` (UUID, Primary Key)
- `email` (String, Unique, Indexed)
- `passwordHash` (String, Bcrypt hashed)
- `fullName` (String)
- `role` (Enum: `STUDENT`, `COUNSELLOR`)
- `createdAt`, `updatedAt` (DateTime)

### 2. `StudentProfile`
Core applicant profile linking academic, financial, and credit records.
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key -> `User.id`, Cascade Delete)
- `gender` (Enum: `MALE`, `FEMALE`, `OTHER`) - Drives lender concession rates (e.g. BOI 8.60% for girls, BOB 8.75% for girls)
- `cibilScore` (Int, Nullable) - Credit benchmark
- `coApplicantType` (Enum: `SALARIED`, `SELF_EMPLOYED`, `NONE`)
- `coApplicantIncome` (Float)

### 3. `StudyPlan`
Overseas education parameters and currency conversion.
- `id` (UUID, Primary Key)
- `studentProfileId` (UUID, Foreign Key -> `StudentProfile.id`, Unique)
- `country` (String)
- `university` (String)
- `courseName` (String)
- `durationYears` (Float)
- `currency` (String: `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `INR`)
- `exchangeRateToBase` (Float) - Live conversion multiplier to base currency (INR)
- `tuitionFee` (Float, original currency)
- `livingCost` (Float, original currency)
- `otherExpenses` (Float, original currency)
- `totalStudyCost` (Float, base INR) - Formula: `((Tuition + Living + Other) * Duration) * ExchangeRate`
- `isTop100University` (Boolean) - Prerequisite for SBI (9.40%) and BOB (8.45%) non-collateral products

### 4. `FundingSource`
Confirmed capital sources and dynamic loan requirement calculation.
- `id` (UUID, Primary Key)
- `studentProfileId` (UUID, Foreign Key -> `StudentProfile.id`, Unique)
- `savings` (Float)
- `scholarship` (Float)
- `feesAlreadyPaid` (Float)
- `familyContribution` (Float)
- `otherFunding` (Float)
- `totalAvailableFunding` (Float) - Sum of all declared capital sources
- `fundingGap` (Float) - `TotalStudyCost - TotalAvailableFunding`
- `estimatedLoanRequirement` (Float) - `Maximum(FundingGap, 0)`

### 5. `FinancialProfile`, `Asset`, `Liability`
Household cashflow and net worth balance sheet.
- `FinancialProfile`:
  - `monthlyIncome`, `annualIncome`, `otherIncome` (Float)
  - `totalAssets`, `totalLiabilities`, `netWorth` (Float) - `NetWorth = TotalAssets - TotalLiabilities`
- `Asset`:
  - `financialProfileId` (Foreign Key -> `FinancialProfile.id`)
  - `assetType` (Enum: `PROPERTY`, `BANK_SAVINGS`, `INVESTMENTS`, `GOLD`, `OTHER`)
  - `description` (String)
  - `value` (Float)
- `Liability`:
  - `financialProfileId` (Foreign Key -> `FinancialProfile.id`)
  - `liabilityType` (Enum: `EXISTING_LOAN`, `CREDIT_CARD_DEBT`, `OTHER`)
  - `outstandingAmount` (Float)
  - `monthlyEmi` (Float)

### 6. `Collateral`
Pledgeable immovable property and liquid security.
- `id` (UUID, Primary Key)
- `studentProfileId` (Foreign Key -> `StudentProfile.id`)
- `collateralType` (Enum: `RESIDENTIAL_PROPERTY`, `COMMERCIAL_PROPERTY`, `FIXED_DEPOSIT`, `LAND`, `OTHER`)
- `propertyValue` (Float) - Gross market appraisal
- `eligibleAssetValue` (Float) - Value after standard bank LTV haircut
- `ownershipInfo` (String)
- `availableCollateralValue` (Float) - Net unencumbered pledgeable security
- `hasEncumbranceCert` (Boolean) - 30-year EC status
- `hasApprovedLayout` (Boolean) - Municipal building plan approval
- `hasOccupancyCert` (Boolean) - OC status

### 7. `Document`
Supporting KYC, academic, and property evidence.
- `id` (UUID, Primary Key)
- `studentProfileId` (Foreign Key -> `StudentProfile.id`)
- `documentType` (Enum: `ITR`, `BANK_STATEMENT`, `SALARY_SLIP`, `CA_NET_WORTH_CERTIFICATE`, `PROPERTY_DOCS`, `PASSPORT_ID`, `ADMISSION_LETTER`, `ACADEMIC_MARKSHEET`, `OTHER`)
- `fileName`, `originalName`, `mimeType`, `fileSize`, `filePath`
- `status` (Enum: `NOT_UPLOADED`, `UPLOADED`, `UNDER_REVIEW`)

### 8. `Lender` & `LenderCriteria`
Source of truth for education loan products loaded dynamically from database.
- `Lender`:
  - `code` (`BOI`, `BOB`, `SBI`, `CREDILA`, `AUXILO`)
  - `name`, `type` (`Public Sector Bank`, `NBFC`), `description`
  - `minCibilScore` (Int, Nullable: 750 for SBI, 700 for BOB, 670 for BOI, null for NBFCs)
- `LenderCriteria`:
  - `lenderId` (Foreign Key -> `Lender.id`)
  - `loanType` (Enum: `COLLATERAL`, `NON_COLLATERAL`)
  - `isOffered` (Boolean: false for BOI Non-Collateral)
  - `baseInterestRate`, `boysInterestRate`, `girlsInterestRate`, `maxRate` (Float)
  - `requiresTop100` (Boolean: true for SBI & BOB Non-Collateral)
  - `requiresCollateral` (Boolean)
  - `conditionNote` (String)
  - `requiredDocumentsList` (JSON Array of strings)

### 9. `Assessment` & `AssessmentLenderMatch`
Persisted snapshot of generated assessment reports.
- `Assessment`:
  - `potentialRoute` (`COLLATERAL`, `NON_COLLATERAL`, `BOTH`, `NO_LOAN_REQUIRED`, `INSUFFICIENT_INFORMATION`)
  - `readinessCategory` (Enum: `STRONG`, `MODERATE`, `NEEDS_ATTENTION`)
  - `readinessScoreExplanation` (JSON)
  - `missingInformation` (JSON)
  - `documentChecklist` (JSON)
  - `disclaimer` (Mandatory non-guarantee regulatory statement)
- `AssessmentLenderMatch`:
  - `lenderName`, `loanType`, `effectiveRate`, `rateNote`
  - `isPotentialMatch` (Boolean)
  - `relevanceScore` (0 to 100)
  - `matchReasons` (JSON Array)
  - `unmetCriteria` (JSON Array)
  - `missingDocuments` (JSON Array)
