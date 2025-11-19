import express from 'express';
import {
  getAllVocabularies,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  toggleFavourite,
  deleteVocabulary,
  getFavouriteVocabularies
} from '../controllers/vocabularyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllVocabularies);
router.get('/favourites', getFavouriteVocabularies);
router.get('/:id', getVocabularyById);

// Protected routes (require authentication)
router.post('/', protect, createVocabulary);
router.put('/:id', protect, updateVocabulary);
router.patch('/:id/favourite', protect, toggleFavourite);
router.delete('/:id', protect, deleteVocabulary);

export default router;
