import express from 'express';
import { checkGrammar, checkGrammarDemo, getGrammarHistory } from '../controllers/grammarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Grammar check endpoint (requires authentication) - Using AI
router.post('/check', protect, checkGrammar); // Sử dụng AI thật

// Grammar check with AI (khi có API key)
router.post('/check-ai', protect, checkGrammar);

// Get user's grammar check history
router.get('/history', protect, getGrammarHistory);

export default router;
