-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'COUNSELLOR');

-- CreateEnum
CREATE TYPE "CoApplicantType" AS ENUM ('SALARIED', 'SELF_EMPLOYED', 'NONE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('PROPERTY', 'BANK_SAVINGS', 'INVESTMENTS', 'GOLD', 'OTHER');

-- CreateEnum
CREATE TYPE "LiabilityType" AS ENUM ('EXISTING_LOAN', 'CREDIT_CARD_DEBT', 'OTHER');

-- CreateEnum
CREATE TYPE "CollateralType" AS ENUM ('RESIDENTIAL_PROPERTY', 'COMMERCIAL_PROPERTY', 'FIXED_DEPOSIT', 'LAND', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ITR', 'BANK_STATEMENT', 'SALARY_SLIP', 'CA_NET_WORTH_CERTIFICATE', 'PROPERTY_DOCS', 'PASSPORT_ID', 'ADMISSION_LETTER', 'ACADEMIC_MARKSHEET', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('NOT_UPLOADED', 'UPLOADED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('COLLATERAL', 'NON_COLLATERAL', 'BOTH');

-- CreateEnum
CREATE TYPE "ReadinessCategory" AS ENUM ('STRONG', 'MODERATE', 'NEEDS_ATTENTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "cibilScore" INTEGER,
    "coApplicantType" "CoApplicantType" NOT NULL DEFAULT 'SALARIED',
    "coApplicantIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "durationYears" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRateToBase" DOUBLE PRECISION NOT NULL DEFAULT 83.5,
    "tuitionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "livingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalStudyCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isTop100University" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingSource" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "savings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scholarship" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feesAlreadyPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "familyContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherFunding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAvailableFunding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fundingGap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedLoanRequirement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialProfile" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "annualIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAssets" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLiabilities" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netWorth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "financialProfileId" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "description" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liability" (
    "id" TEXT NOT NULL,
    "financialProfileId" TEXT NOT NULL,
    "liabilityType" "LiabilityType" NOT NULL,
    "description" TEXT NOT NULL,
    "outstandingAmount" DOUBLE PRECISION NOT NULL,
    "monthlyEmi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Liability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collateral" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "collateralType" "CollateralType" NOT NULL,
    "description" TEXT NOT NULL,
    "propertyValue" DOUBLE PRECISION NOT NULL,
    "eligibleAssetValue" DOUBLE PRECISION NOT NULL,
    "ownershipInfo" TEXT NOT NULL,
    "availableCollateralValue" DOUBLE PRECISION NOT NULL,
    "hasEncumbranceCert" BOOLEAN NOT NULL DEFAULT false,
    "hasApprovedLayout" BOOLEAN NOT NULL DEFAULT false,
    "hasOccupancyCert" BOOLEAN NOT NULL DEFAULT false,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collateral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lender" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minCibilScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LenderCriteria" (
    "id" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "isOffered" BOOLEAN NOT NULL DEFAULT true,
    "baseInterestRate" DOUBLE PRECISION NOT NULL,
    "boysInterestRate" DOUBLE PRECISION,
    "girlsInterestRate" DOUBLE PRECISION,
    "maxRate" DOUBLE PRECISION,
    "requiresTop100" BOOLEAN NOT NULL DEFAULT false,
    "requiresCollateral" BOOLEAN NOT NULL DEFAULT false,
    "conditionNote" TEXT,
    "requiredDocumentsList" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LenderCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "totalStudyCost" DOUBLE PRECISION NOT NULL,
    "availableFunding" DOUBLE PRECISION NOT NULL,
    "fundingGap" DOUBLE PRECISION NOT NULL,
    "estimatedLoanRequirement" DOUBLE PRECISION NOT NULL,
    "netWorth" DOUBLE PRECISION NOT NULL,
    "totalCollateral" DOUBLE PRECISION NOT NULL,
    "cibilScore" INTEGER,
    "potentialRoute" TEXT NOT NULL,
    "readinessCategory" "ReadinessCategory" NOT NULL,
    "readinessScoreExplanation" JSONB NOT NULL,
    "missingInformation" JSONB NOT NULL,
    "documentChecklist" JSONB NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentLenderMatch" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "lenderName" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "effectiveRate" DOUBLE PRECISION NOT NULL,
    "rateNote" TEXT,
    "isPotentialMatch" BOOLEAN NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "matchReasons" JSONB NOT NULL,
    "unmetCriteria" JSONB NOT NULL,
    "missingDocuments" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentLenderMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlan_studentProfileId_key" ON "StudyPlan"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "FundingSource_studentProfileId_key" ON "FundingSource"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialProfile_studentProfileId_key" ON "FinancialProfile"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Lender_code_key" ON "Lender"("code");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingSource" ADD CONSTRAINT "FundingSource_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialProfile" ADD CONSTRAINT "FinancialProfile_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_financialProfileId_fkey" FOREIGN KEY ("financialProfileId") REFERENCES "FinancialProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_financialProfileId_fkey" FOREIGN KEY ("financialProfileId") REFERENCES "FinancialProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collateral" ADD CONSTRAINT "Collateral_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderCriteria" ADD CONSTRAINT "LenderCriteria_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentLenderMatch" ADD CONSTRAINT "AssessmentLenderMatch_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
