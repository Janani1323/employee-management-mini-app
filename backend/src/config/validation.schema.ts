import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  BACKEND_PORT: Joi.number().default(3000),
  FRONTEND_ORIGIN: Joi.string().default('http://localhost:4200'),
  SIMULATE_CREATE_FAILURES: Joi.string().valid('true', 'false').default('false'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
});
