import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kurro.kurro.app',
  appName: 'Kurro',
  webDir: 'www',
  server: {
    // Permitir HTTP en desarrollo (cambiar a HTTPS en producción)
    cleartext: true,
    androidScheme: 'http', // Forzar HTTP en lugar de HTTPS
    // Descomentar para live reload durante desarrollo:
    // url: 'http://192.168.26.207:8100',
    // cleartext: true
  },
  android: {
    // Permitir tráfico HTTP no seguro (solo desarrollo)
    allowMixedContent: true
  }
};

export default config;
