import Joi from 'joi';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  PORT: Joi.number().default(3001),
  OPENAI_API_KEY: Joi.string().required(),
  RATE_LIMIT_WINDOW_MS: Joi.number().required(),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().required(),
  CORS_ORIGIN: Joi.string().uri().required(),
}).unknown();

export const validateEnv = () => {
  const { error } = envSchema.validate(process.env);
  if (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }
}; 