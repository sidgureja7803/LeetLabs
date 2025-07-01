import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { chatbotController } from '../controllers/chatbot.controller';

const router = Router();

// Initialize chat session (public endpoint for landing page)
router.post('/init', chatbotController.initializeChat);

// Send message to chatbot (public endpoint for landing page)
router.post('/message', chatbotController.sendMessage);

// Get suggested prompts (public endpoint)
router.get('/prompts', chatbotController.getSuggestedPrompts);

// Protected routes (require authentication)
router.use(authenticate);

// Get chat history
router.get('/sessions/:sessionId', chatbotController.getChatHistory);

// Get user's chat sessions
router.get('/sessions', chatbotController.getUserChatSessions);

// Delete chat session
router.delete('/sessions/:sessionId', chatbotController.deleteChatSession);

// Rate chatbot response
router.post('/rate', chatbotController.rateResponse);

export default router; 