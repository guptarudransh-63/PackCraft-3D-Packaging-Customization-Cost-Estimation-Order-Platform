import express from 'express';
import {
  createOrderFromQuotation,
  getUserOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrderFromQuotation);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

export default router;
