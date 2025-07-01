import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import axios from 'axios';

const prisma = new PrismaClient();

// Llama API configuration
const LLAMA_API_URL = process.env.LLAMA_API_URL || 'https://api.llama-api.com/chat/completions';
const LLAMA_API_KEY = process.env.LLAMA_API_KEY;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export const chatbotController = {
  // Initialize chat session
  initializeChat: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || null;
      const { sessionId } = req.body;

      // System prompt for Thapar Virtual Labs
      const systemPrompt = `You are a helpful AI assistant for Thapar Virtual Labs at Thapar Institute of Engineering and Technology. You help students and teachers with:

1. Assignment and quiz questions
2. Programming concepts and coding help
3. Course information and deadlines
4. Platform navigation and features
5. Technical support for lab exercises
6. Academic guidance and study tips

Please provide helpful, accurate, and educational responses. For coding questions, provide clear explanations with examples. Always maintain a professional and encouraging tone.

Important guidelines:
- Be concise but comprehensive
- Provide code examples when relevant
- Suggest best practices
- Help with debugging and problem-solving
- Direct users to appropriate resources when needed
- For sensitive academic issues, recommend contacting instructors or administration`;

      const initialMessages: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'assistant',
          content: 'Hello! Welcome to Thapar Virtual Labs. I\'m here to help you with assignments, coding questions, course information, and any other academic queries. How can I assist you today?',
          timestamp: new Date()
        }
      ];

      // Create or update chat session
      const chatSession = await prisma.chatBot.upsert({
        where: { sessionId: sessionId || 'default' },
        create: {
          sessionId: sessionId || `session_${Date.now()}`,
          messages: initialMessages,
          userId
        },
        update: {
          messages: initialMessages,
          userId,
          isActive: true
        }
      });

      res.json({
        success: true,
        data: {
          sessionId: chatSession.sessionId,
          messages: initialMessages.filter(m => m.role !== 'system')
        }
      });
    } catch (error) {
      logger.error('Initialize chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize chat session'
      });
    }
  },

  // Send message to chatbot
  sendMessage: async (req: Request, res: Response) => {
    try {
      const { sessionId, message } = req.body;
      const userId = (req as any).user?.id || null;

      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          message: 'Session ID and message are required'
        });
      }

      // Get existing chat session
      let chatSession = await prisma.chatBot.findUnique({
        where: { sessionId }
      });

      if (!chatSession) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }

      const existingMessages = chatSession.messages as ChatMessage[];
      
      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      const updatedMessages = [...existingMessages, userMessage];

      // Prepare messages for Llama API
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call Llama API
      const llamaResponse = await axios.post(
        LLAMA_API_URL,
        {
          model: 'llama-2-7b-chat',
          messages: apiMessages,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          presence_penalty: 0.6,
          frequency_penalty: 0.5
        },
        {
          headers: {
            'Authorization': `Bearer ${LLAMA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: llamaResponse.data.choices[0].message.content,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];

      // Update chat session
      await prisma.chatBot.update({
        where: { sessionId },
        data: {
          messages: finalMessages,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: {
          message: assistantMessage,
          sessionId
        }
      });

      logger.info(`Chat message processed for session: ${sessionId}`);
    } catch (error) {
      logger.error('Send message error:', error);
      
      // Fallback response if API fails
      const fallbackMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment, or contact support if the issue persists.',
        timestamp: new Date()
      };

      res.json({
        success: true,
        data: {
          message: fallbackMessage,
          sessionId: req.body.sessionId
        }
      });
    }
  },

  // Get chat history
  getChatHistory: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user?.id || null;

      const chatSession = await prisma.chatBot.findUnique({
        where: { sessionId }
      });

      if (!chatSession) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }

      // Check if user has access to this session
      if (chatSession.userId && chatSession.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const messages = (chatSession.messages as ChatMessage[])
        .filter(m => m.role !== 'system');

      res.json({
        success: true,
        data: {
          sessionId,
          messages,
          createdAt: chatSession.createdAt,
          updatedAt: chatSession.updatedAt
        }
      });
    } catch (error) {
      logger.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chat history'
      });
    }
  },

  // Get user's chat sessions
  getUserChatSessions: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const sessions = await prisma.chatBot.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 20
      });

      const sessionSummaries = sessions.map(session => {
        const messages = session.messages as ChatMessage[];
        const lastMessage = messages[messages.length - 1];
        
        return {
          sessionId: session.sessionId,
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.timestamp || session.updatedAt,
          messageCount: messages.filter(m => m.role !== 'system').length,
          createdAt: session.createdAt
        };
      });

      res.json({
        success: true,
        data: { sessions: sessionSummaries }
      });
    } catch (error) {
      logger.error('Get user chat sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chat sessions'
      });
    }
  },

  // Delete chat session
  deleteChatSession: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user?.id;

      const chatSession = await prisma.chatBot.findUnique({
        where: { sessionId }
      });

      if (!chatSession) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }

      // Check if user has permission to delete
      if (chatSession.userId && chatSession.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await prisma.chatBot.update({
        where: { sessionId },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Chat session deleted successfully'
      });
    } catch (error) {
      logger.error('Delete chat session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete chat session'
      });
    }
  },

  // Get suggested prompts
  getSuggestedPrompts: async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user?.role || 'STUDENT';

      const prompts = {
        STUDENT: [
          "How do I submit my assignment?",
          "Can you help me debug this code?",
          "What's the difference between variables and constants?",
          "How do I prepare for the upcoming quiz?",
          "Explain object-oriented programming concepts",
          "Help me understand data structures",
          "What are the lab requirements for this semester?",
          "How can I improve my coding skills?"
        ],
        TEACHER: [
          "How do I create a new quiz?",
          "Help me design assignment rubrics",
          "What are best practices for online assessments?",
          "How can I track student progress?",
          "Explain different grading strategies",
          "Help with creating coding exercises",
          "What features are available for teachers?",
          "How do I schedule assignments?"
        ],
        ADMIN: [
          "How do I manage user accounts?",
          "What are the system analytics?",
          "Help with semester configuration",
          "How do I backup data?",
          "Explain system monitoring features",
          "What are the platform usage statistics?",
          "How do I configure system settings?",
          "Help with user role management"
        ]
      };

      res.json({
        success: true,
        data: {
          prompts: prompts[userRole as keyof typeof prompts] || prompts.STUDENT
        }
      });
    } catch (error) {
      logger.error('Get suggested prompts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get suggested prompts'
      });
    }
  },

  // Rate chatbot response
  rateResponse: async (req: Request, res: Response) => {
    try {
      const { sessionId, messageIndex, rating, feedback } = req.body;

      if (!sessionId || messageIndex === undefined || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Session ID, message index, and rating are required'
        });
      }

      // Log the rating for analytics
      logger.info(`Chatbot response rated: ${sessionId}, message: ${messageIndex}, rating: ${rating}, feedback: ${feedback}`);

      res.json({
        success: true,
        message: 'Thank you for your feedback!'
      });
    } catch (error) {
      logger.error('Rate response error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit rating'
      });
    }
  }
}; 