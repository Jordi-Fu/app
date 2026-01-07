import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'kurro',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret_change_in_production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Security - CORS orígenes permitidos
  // Incluye: desarrollo web, Ionic serve, y apps móviles (Capacitor)
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:4200',      // Angular dev server
    'http://localhost:8100',      // Ionic dev server
    'http://192.168.26.207:4200', // Angular desde red local
    'http://192.168.26.207:8100', // Ionic desde red local
    'http://10.0.2.2:4200',       // Emulador Android - Angular
    'http://10.0.2.2:8100',       // Emulador Android - Ionic
    'capacitor://localhost',      // iOS Capacitor
    'http://localhost',           // Android Capacitor
  ],
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validar variables críticas en producción
export const validateEnv = (): void => {
  if (ENV.isProduction) {
    const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
    }
    
    if (ENV.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
    }
  }
};
