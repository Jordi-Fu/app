import createApp from './app';
import { ENV, validateEnv } from './config/env.config';
import { testConnection, closePool } from './config/database.config';

/**
 * Iniciar servidor
 */
const startServer = async (): Promise<void> => {
  try {
    // Validar variables de entorno
    validateEnv();
    
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    
    const app = createApp();
    
    // Escuchar en 0.0.0.0 para aceptar conexiones desde cualquier interfaz de red
    app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log('=========================================');
      console.log(`🚀 Servidor iniciado en puerto ${ENV.PORT}`);
      console.log(`📍 Entorno: ${ENV.NODE_ENV}`);
      console.log(`🔗 Local: http://localhost:${ENV.PORT}`);
      console.log(`📱 Red: http://192.168.26.207:${ENV.PORT}`);
      console.log(`🔒 CORS habilitado para: ${ENV.CORS_ORIGINS.join(', ')}`);
      console.log(`💾 Base de datos: ${ENV.DB_NAME} en ${ENV.DB_HOST}:${ENV.DB_PORT}`);
      console.log('=========================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Cerrar conexiones al terminar
process.on('SIGINT', async () => {
  console.log('\n⚠️  Cerrando servidor...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Cerrando servidor...');
  await closePool();
  process.exit(0);
});

// Iniciar
startServer();
