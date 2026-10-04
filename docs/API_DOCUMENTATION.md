# EduFinSight API Documentation

RESTful API specification for the **GradGuide Education Loan Assessment Engine**.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Base URL (Production)**: Configured via `VITE_API_URL`
- **Authentication**: JWT Bearer token via `Authorization: Bearer <token>` header

---

## 1. Authentication Endpoints

### Register New User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "password": "password123",
    "role": "STUDENT",       // "STUDENT" | "COUNSELLOR"
    "gender": "FEMALE"       // "FEMALE" | "MALE" | "OTHER" (used for BOI & BOB interest rate concessions)
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Account registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "uuid-v4",
      "email": "priya@example.com",
      "fullName": "Priya Sharma",
      "role": "STUDENT",
      "studentProfileId": "uuid-v4"
    }
  }
  ```

### User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "student@gradguide.demo",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Logged in successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": { ... }
  }
  ```

### Get Authenticated Session Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Authenticated (`Bearer <token>`)

---

## 2. Study Details Endpoints

### Save Study Plan
- **Method**: `POST`
- **Path**: `/api/study`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "country": "United States",
    "university": "Columbia University",
    "courseName": "MSc Computer Science",
    "durationYears": 1.5,
    "currency": "USD",
    "exchangeRateToBase": 83.5,
    "tuitionFee": 35000,
    "livingCost": 15000,
    "otherExpenses": 4000,
    "isTop100University": true
  }
  ```
- **Response (200 OK)**: Returns the saved study plan and the real-time cost calculation breakdown.

---

## 3. Funding Details Endpoints

### Save Funding Sources
- **Method**: `POST`
- **Path**: `/api/funding`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "savings": 500000,
    "scholarship": 1000000,
    "feesAlreadyPaid": 200000,
    "familyContribution": 800000,
    "otherFunding": 0
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Funding details saved successfully.",
    "fundingSource": { ... },
    "calculation": {
      "totalAvailableFunding": 2500000,
      "fundingGap": 2000000,
      "estimatedLoanRequirement": 2000000,
      "selfFundedPercentage": 55.56
    }
  }
  ```

---

## 4. Financial Profile & Balance Sheet Endpoints

### Save Income & Co-Applicant Details
- **Method**: `POST`
- **Path**: `/api/financial-profile`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "monthlyIncome": 120000,
    "annualIncome": 1440000,
    "otherIncome": 0,
    "cibilScore": 760,
    "coApplicantType": "SALARIED",
    "coApplicantIncome": 120000
  }
  ```

### Add Asset
- **Method**: `POST`
- **Path**: `/api/assets`
- **Request Body**:
  ```json
  {
    "assetType": "PROPERTY",
    "description": "3BHK Apartment in Mumbai",
    "value": 6000000
  }
  ```

### Delete Asset
- **Method**: `DELETE`
- **Path**: `/api/assets/:id`

### Add Liability
- **Method**: `POST`
- **Path**: `/api/liabilities`
- **Request Body**:
  ```json
  {
    "liabilityType": "EXISTING_LOAN",
    "description": "Auto Loan",
    "outstandingAmount": 300000,
    "monthlyEmi": 12000
  }
  ```

### Delete Liability
- **Method**: `DELETE`
- **Path**: `/api/liabilities/:id`

---

## 5. Collateral Endpoints

### Add Collateral
- **Method**: `POST`
- **Path**: `/api/collateral`
- **Request Body**:
  ```json
  {
    "collateralType": "RESIDENTIAL_PROPERTY",
    "description": "Residential Flat in Pune",
    "propertyValue": 6000000,
    "eligibleAssetValue": 4800000,
    "ownershipInfo": "Parents Joint",
    "availableCollateralValue": 4500000,
    "hasEncumbranceCert": true,
    "hasApprovedLayout": true,
    "hasOccupancyCert": true,
    "state": "Maharashtra"
  }
  ```

---

## 6. Document Management Endpoints

### Upload Document
- **Method**: `POST`
- **Path**: `/api/documents/upload`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Binary file (PDF, JPG, PNG, Max 5MB)
  - `documentType`: `"ITR" | "BANK_STATEMENT" | "SALARY_SLIP" | "PROPERTY_DOCS" | ...`
  - `notes`: Optional memo

### Download Document
- **Method**: `GET`
- **Path**: `/api/documents/:id/download`
- **Access**: Authorized Owner or Counsellor

### Delete Document
- **Method**: `DELETE`
- **Path**: `/api/documents/:id`

---

## 7. Dynamic Lender & Assessment Endpoints

### Get All Seeded Lenders
- **Method**: `GET`
- **Path**: `/api/lenders`
- **Access**: Public
- **Description**: Retrieves all lenders (BOI, BOB, SBI, Credila, Auxilo) with collateral and non-collateral criteria dynamically from PostgreSQL.

### Generate Assessment
- **Method**: `POST`
- **Path**: `/api/assessment`
- **Access**: Authenticated
- **Description**: Runs pure calculation engine, matches candidate profile against database criteria, formats non-guaranteed explainable reasons, evaluates Financial Readiness Snapshot, and saves assessment record.

### Get Latest Assessment
- **Method**: `GET`
- **Path**: `/api/assessment/latest`
- **Access**: Authenticated
