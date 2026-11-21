import express from 'express';
import {
  getDashboardOverview,
  createProduct,
  updateProduct,
  deleteProduct,
  getPricingRules,
  createPricingRule,
  updatePricingRule,
} from '../controllers/adminController.js';
import { adminGetQuotations, adminUpdateQuotation } from '../controllers/quotationController.js';
import { adminGetOrders, adminUpdateOrderStatus } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardOverview);

// Product Management
router.post('/packaging', createProduct);
router.patch('/packaging/:id', updateProduct);
router.delete('/packaging/:id', deleteProduct);

// Quotation Management
router.get('/quotations', adminGetQuotations);
router.patch('/quotations/:id', adminUpdateQuotation);

// Order Management
router.get('/orders', adminGetOrders);
router.patch('/orders/:id', adminUpdateOrderStatus);

// Pricing Rules
router.get('/pricing', getPricingRules);
router.post('/pricing', createPricingRule);
router.patch('/pricing/:id', updatePricingRule);

export default router;
