import express from 'express';
import { protect, optionalAuth } from '../middleware/auth';
import {
  startConversation,
  getConversation,
  executeAction
} from '../controllers/aiChatController';

const router = express.Router();

/**
 * AI Chat Routes
 * All routes are public but enhanced with user context when authenticated
 */

// Start or continue conversation (public with optional auth)
router.post('/conversation', optionalAuth, startConversation);

// Get conversation by ID (public with optional auth)
router.get('/conversation/:id', optionalAuth, getConversation);

// Execute AI action (public with optional auth)
router.post('/action', optionalAuth, executeAction);

export default router;