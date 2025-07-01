import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'CODE';

const prisma = new PrismaClient();

interface ExtractedQuestion {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  marks?: number;
}

export class QuestionExtractor {
  static async extractFromPDF(buffer: Buffer): Promise<ExtractedQuestion[]> {
    try {
      const data = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      const questions: ExtractedQuestion[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(' ');
        
        // Extract questions using regex patterns
        const questionPatterns = [
          // Multiple Choice Questions
          /(?:Q|Question)\s*\d+\s*[:.]?\s*([^\n?]+\?)\s*(?:\((\d+)\s*marks?\))?\s*(?:\n\s*[A-D][).]\s*([^\n]+))+/gi,
          // True/False Questions
          /(?:Q|Question)\s*\d+\s*[:.]?\s*([^\n?]+\?)\s*(?:\((\d+)\s*marks?\))?\s*(?:True|False)/gi,
          // Short Answer Questions
          /(?:Q|Question)\s*\d+\s*[:.]?\s*([^\n?]+\?)\s*(?:\((\d+)\s*marks?\))?(?:\s*Answer:\s*([^\n]+))?/gi
        ];

        for (const pattern of questionPatterns) {
          let match;
          while ((match = pattern.exec(text)) !== null) {
            const [_, questionText, marks, ...rest] = match;
            const type = this.determineQuestionType(match[0]);
            const options = type === 'MULTIPLE_CHOICE' ? this.extractOptions(match[0]) : undefined;
            const correctAnswer = this.extractAnswer(match[0], type);

            questions.push({
              question: questionText.trim(),
              type,
              options,
              correctAnswer,
              marks: marks ? parseInt(marks) : undefined
            });
          }
        }
      }

      return questions;
    } catch (error) {
      logger.error('Error extracting questions from PDF:', error);
      throw new Error('Failed to extract questions from PDF');
    }
  }

  static async extractFromPPT(buffer: Buffer): Promise<ExtractedQuestion[]> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      const questions: ExtractedQuestion[] = [];

      // Similar patterns as PDF extraction
      const questionPatterns = [
        // Multiple Choice Questions
        /(?:Q|Question)\s*\d+\s*[:.]?\s*([^\n?]+\?)\s*(?:\((\d+)\s*marks?\))?\s*(?:\n\s*[A-D][).]\s*([^\n]+))+/gi,
        // True/False Questions
        /(?:Q|Question)\s*\d+\s*[:.]?\s*([^\n?]+\?)\s*(?:\((\d+)\s*marks?\))?\s*(?:True|False)/gi,
        // Short Answer Questions
        /(?:Q|Question)\s*\d+\s*[:.]?\s*([^\n?]+\?)\s*(?:\((\d+)\s*marks?\))?(?:\s*Answer:\s*([^\n]+))?/gi
      ];

      for (const pattern of questionPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const [_, questionText, marks, ...rest] = match;
          const type = this.determineQuestionType(match[0]);
          const options = type === 'MULTIPLE_CHOICE' ? this.extractOptions(match[0]) : undefined;
          const correctAnswer = this.extractAnswer(match[0], type);

          questions.push({
            question: questionText.trim(),
            type,
            options,
            correctAnswer,
            marks: marks ? parseInt(marks) : undefined
          });
        }
      }

      return questions;
    } catch (error) {
      logger.error('Error extracting questions from PPT:', error);
      throw new Error('Failed to extract questions from PPT');
    }
  }

  private static determineQuestionType(text: string): QuestionType {
    if (text.match(/(?:\n\s*[A-D][).]\s*[^\n]+)+/)) {
      return 'MULTIPLE_CHOICE';
    }
    if (text.match(/(?:True|False)/i)) {
      return 'TRUE_FALSE';
    }
    return 'SHORT_ANSWER';
  }

  private static extractOptions(text: string): string[] {
    const options: string[] = [];
    const optionPattern = /[A-D][).]\s*([^\n]+)/g;
    let match;
    
    while ((match = optionPattern.exec(text)) !== null) {
      options.push(match[1].trim());
    }
    
    return options;
  }

  private static extractAnswer(text: string, type: QuestionType): string | undefined {
    if (type === 'MULTIPLE_CHOICE') {
      const match = text.match(/(?:Answer|Correct):\s*([A-D])/i);
      return match ? match[1] : undefined;
    }
    if (type === 'TRUE_FALSE') {
      const match = text.match(/(?:Answer|Correct):\s*(True|False)/i);
      return match ? match[1] : undefined;
    }
    const match = text.match(/(?:Answer|Correct):\s*([^\n]+)/i);
    return match ? match[1].trim() : undefined;
  }
} 