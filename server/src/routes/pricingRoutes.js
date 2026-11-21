import express from 'express';
import { getEstimate } from '../controllers/pricingController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/estimate', optionalAuth, getEstimate);

export default router;
