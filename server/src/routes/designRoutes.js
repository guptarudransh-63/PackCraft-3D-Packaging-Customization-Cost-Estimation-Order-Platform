import express from 'express';
import {
  getUserDesigns,
  getDesignById,
  createDesign,
  updateDesign,
  duplicateDesign,
  deleteDesign,
} from '../controllers/designController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getUserDesigns);
router.post('/', createDesign);
router.get('/:id', getDesignById);
router.patch('/:id', updateDesign);
router.post('/:id/duplicate', duplicateDesign);
router.delete('/:id', deleteDesign);

export default router;
