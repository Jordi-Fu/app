import { Pool, PoolConfig } from 'pg';
import { ENV } from './env.config';

/**
 * Configuración del pool de conexiones a PostgreSQL
 */
const poolConfig: PoolConfig = {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  database: ENV.DB_NAME,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 2000, // Timeout para obtener una conexión
};

/**
 * Pool de conexiones compartido
 */
export const pool = new Pool(poolConfig);

/**
 * Manejo de errores del pool
 */
pool.on('error', (err: Error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

/**
 * Verificar conexión a la base de datos
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    return false;
  }
};

/**
 * Cerrar todas las conexiones del pool
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
};
