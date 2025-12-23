import createApp from './app';
import { ENV, validateEnv } from './config/env.config';

/**
 * Iniciar servidor
 */
const startServer = async (): Promise<void> => {
  try {
    // Validar variables de entorno
    validateEnv();
    
    const app = createApp();
    
    // Escuchar en 0.0.0.0 para aceptar conexiones desde cualquier interfaz de red
    app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log('=========================================');
      console.log(`🚀 Servidor iniciado en puerto ${ENV.PORT}`);
      console.log(`📍 Entorno: ${ENV.NODE_ENV}`);
      console.log(`🔗 Local: http://localhost:${ENV.PORT}`);
      console.log(`📱 Red: http://192.168.26.207:${ENV.PORT}`);
      console.log(`🔒 CORS habilitado para: ${ENV.CORS_ORIGINS.join(', ')}`);
      console.log('=========================================');
      
      if (ENV.isDevelopment) {
        console.log('');
        console.log('📝 Credenciales de prueba:');
        console.log('   Usuario: admin');
        console.log('   Email: admin@ejemplo.com');
        console.log('   Teléfono: 1234567890');
        console.log('   Contraseña: Admin123');
        console.log('');
      }
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

// Iniciar
startServer();
