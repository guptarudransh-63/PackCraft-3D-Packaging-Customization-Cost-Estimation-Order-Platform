import express from 'express';
import {
  createQuotationRequest,
  getUserQuotations,
  getQuotationById,
  acceptQuotation,
  requestQuotationRevision,
  declineQuotation,
} from '../controllers/quotationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createQuotationRequest);
router.get('/', getUserQuotations);
router.get('/:id', getQuotationById);
router.post('/:id/accept', acceptQuotation);
router.post('/:id/revision-request', requestQuotationRevision);
router.post('/:id/decline', declineQuotation);

export default router;
