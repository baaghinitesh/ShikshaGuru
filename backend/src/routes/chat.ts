import express from 'express';
import { protect } from '../middleware/auth';
import {
  getUserChats,
  getChatById,
  createChat,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
  searchMessages
} from '../controllers/chatController';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Chat routes
router.get('/', getUserChats);
router.post('/', createChat);
router.get('/:id', getChatById);

// Message routes
router.get('/:id/messages', getChatMessages);
router.post('/:id/messages', sendMessage);
router.patch('/:id/messages/read', markMessagesAsRead);
router.get('/:id/messages/search', searchMessages);

// Individual message routes
router.delete('/:id/messages/:messageId', deleteMessage);
router.patch('/:id/messages/:messageId', editMessage);

export default router;