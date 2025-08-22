type ENVIRONMENT = 'dev' | 'stg' | 'prd' | 'local' | 'test';
type LOG_LEVELS = 'info' | 'trace' | 'debug' | 'warn' | 'error' | 'fatal';

export const NAME = process.env.NAME ?? 'gsn_expenses_tracker';
export const ENVIRONMENT: ENVIRONMENT = (process.env.ENVIRONMENT ?? process.env.NODE_ENV ?? 'dev') as ENVIRONMENT;

// Adapters
export const LOG_LEVEL: LOG_LEVELS = (process.env.LOG_LEVEL as LOG_LEVELS) || ENVIRONMENT === 'test' ? 'fatal' : 'info';

// Entrypoints
export const PORT = +(process.env.PORT ?? 8080);
export const URL_PREFIX = ENVIRONMENT === 'local' || ENVIRONMENT === 'test' ? 'api' : 'gsn_push_service';
export const API_URL = process.env.API_URL ?? 'http://localhost:8080';
