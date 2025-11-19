import express from 'express';
import {
  createJobLead,
  getJobLeads,
  getJobLeadById,
  getMyJobs,
  purchaseJobLead,
  expressInterest,
  updateInterestStatus,
  updateJobLead,
  deleteJobLead
} from '../controllers/jobController';
import { authenticateToken, requireHomeowner, requireTradesperson } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getJobLeads);
router.get('/:id', getJobLeadById);

// Protected routes - Homeowner
router.post('/', authenticateToken, requireHomeowner, createJobLead);
router.get('/my/jobs', authenticateToken, requireHomeowner, getMyJobs);
router.put('/:id', authenticateToken, requireHomeowner, updateJobLead);
router.delete('/:id', authenticateToken, requireHomeowner, deleteJobLead);
router.put('/:jobId/interests/:interestId/status', authenticateToken, requireHomeowner, updateInterestStatus);

// Protected routes - Tradesperson
router.post('/:id/purchase', authenticateToken, requireTradesperson, purchaseJobLead);
router.post('/:id/interest', authenticateToken, requireTradesperson, expressInterest);

export default router;
