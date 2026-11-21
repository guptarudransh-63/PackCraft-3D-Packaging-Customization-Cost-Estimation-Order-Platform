import express from 'express';
import { upload, handleArtworkUpload } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/artwork', upload.single('artwork'), handleArtworkUpload);

export default router;
