import express from 'express';
import {
  getPackagingList,
  getPackagingBySlug,
  getMaterials,
  getPackagingCategories,
} from '../controllers/packagingController.js';

const router = express.Router();

router.get('/', getPackagingList);
router.get('/categories', getPackagingCategories);
router.get('/materials', getMaterials);
router.get('/:slug', getPackagingBySlug);

export default router;
