import express from 'express';
import { analyzeResume, generateQuestion, evaluateResponse } from '../controllers/interview.js';
import { 
  validateAnalyzeRequest, 
  validateQuestionRequest, 
  validateEvaluateRequest 
} from '../middleware/validateRequest.js';

export const router = express.Router();

router.post('/analyze', validateAnalyzeRequest, analyzeResume);
router.post('/question', validateQuestionRequest, generateQuestion);
router.post('/evaluate', validateEvaluateRequest, evaluateResponse); 