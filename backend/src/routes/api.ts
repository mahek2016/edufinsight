import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { getStudyPlan, saveStudyPlan } from '../controllers/studyController';
import { getFunding, saveFunding } from '../controllers/fundingController';
import {
  getFinancialProfile,
  saveIncomeDetails,
  addAsset,
  deleteAsset,
  addLiability,
  deleteLiability
} from '../controllers/financialController';
import { getCollateral, addCollateral, deleteCollateral } from '../controllers/collateralController';
import {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument
} from '../controllers/documentController';
import { getLenders, getLenderById } from '../controllers/lenderController';
import {
  generateAssessment,
  getLatestAssessment,
  getAssessmentById
} from '../controllers/assessmentController';
import { authenticateToken } from '../middleware/auth';
import { documentUpload } from '../middleware/upload';

const router = Router();

// Public Authentication
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getMe);

// Study Details
router.get('/study', authenticateToken, getStudyPlan);
router.post('/study', authenticateToken, saveStudyPlan);

// Funding Details
router.get('/funding', authenticateToken, getFunding);
router.post('/funding', authenticateToken, saveFunding);

// Financial Profile & Net Worth
router.get('/financial-profile', authenticateToken, getFinancialProfile);
router.post('/financial-profile', authenticateToken, saveIncomeDetails);
router.post('/assets', authenticateToken, addAsset);
router.delete('/assets/:id', authenticateToken, deleteAsset);
router.post('/liabilities', authenticateToken, addLiability);
router.delete('/liabilities/:id', authenticateToken, deleteLiability);

// Collateral
router.get('/collateral', authenticateToken, getCollateral);
router.post('/collateral', authenticateToken, addCollateral);
router.delete('/collateral/:id', authenticateToken, deleteCollateral);

// Document Management
router.get('/documents', authenticateToken, getDocuments);
router.post('/documents/upload', authenticateToken, documentUpload.single('file'), uploadDocument);
router.get('/documents/:id/download', authenticateToken, downloadDocument);
router.delete('/documents/:id', authenticateToken, deleteDocument);

// Lenders (Dynamic from PostgreSQL)
router.get('/lenders', getLenders);
router.get('/lenders/:id', getLenderById);

// Assessment Engine
router.post('/assessment', authenticateToken, generateAssessment);
router.get('/assessment/latest', authenticateToken, getLatestAssessment);
router.get('/assessment/:id', authenticateToken, getAssessmentById);

export default router;
