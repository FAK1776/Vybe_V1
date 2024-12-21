import { body, validationResult } from 'express-validator';

export const validateAnalyzeRequest = [
  body('jobDescription').trim().notEmpty().withMessage('Job description is required'),
  body('resume').optional().trim(),
  checkValidationResult,
];

export const validateQuestionRequest = [
  body('jobDescription').trim().notEmpty().withMessage('Job description is required'),
  body('resume').optional().trim(),
  body('previousResponses').isArray(),
  checkValidationResult,
];

export const validateEvaluateRequest = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('response').trim().notEmpty().withMessage('Response is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('jobDescription').trim().notEmpty().withMessage('Job description is required'),
  checkValidationResult,
];

function checkValidationResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
} 