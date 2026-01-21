import nodemailer from 'nodemailer';
import { ENV } from '../config/env.config';

/**
 * Servicio de envío de emails
 */
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar transporter
    this.transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465, // true para puerto 465, false para otros
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  }

  /**
   * Enviar código de recuperación de contraseña
   */
  async sendPasswordResetCode(email: string, code: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Kurro" <${ENV.SMTP_FROM || ENV.SMTP_USER}>`,
        to: email,
        subject: '🔐 Código de recuperación de contraseña - Kurro',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #00d4aa 0%, #00bfa5 100%);
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                color: #ffffff;
                font-size: 36px;
                font-weight: bold;
              }
              .content {
                padding: 40px 30px;
              }
              .content h2 {
                color: #000000;
                font-size: 24px;
                margin: 0 0 20px;
              }
              .content p {
                color: #666;
                font-size: 16px;
                margin: 0 0 20px;
              }
              .code-box {
                background: linear-gradient(135deg, #f5f5f5 0%, #e8f5f3 100%);
                border: 2px solid #00d4aa;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .code {
                font-size: 48px;
                font-weight: bold;
                color: #00d4aa;
                letter-spacing: 8px;
                margin: 0;
                font-family: 'Courier New', monospace;
              }
              .code-label {
                font-size: 14px;
                color: #999;
                margin-top: 10px;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .warning p {
                margin: 0;
                color: #856404;
                font-size: 14px;
              }
              .footer {
                background: #f5f5f5;
                padding: 30px;
                text-align: center;
                color: #999;
                font-size: 14px;
              }
              .footer a {
                color: #00d4aa;
                text-decoration: none;
              }
              @media only screen and (max-width: 600px) {
                .container {
                  margin: 20px 10px;
                }
                .header {
                  padding: 30px 20px;
                }
                .header h1 {
                  font-size: 28px;
                }
                .content {
                  padding: 30px 20px;
                }
                .code {
                  font-size: 36px;
                  letter-spacing: 4px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Kurro</h1>
              </div>
              <div class="content">
                <h2>🔐 Recuperación de contraseña</h2>
                <p>Hola,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Utiliza el siguiente código de verificación para continuar:</p>
                
                <div class="code-box">
                  <div class="code">${code}</div>
                  <div class="code-label">Código de verificación</div>
                </div>
                
                <div class="warning">
                  <p><strong>⏰ Este código expira en 15 minutos</strong></p>
                </div>
                
                <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura. Tu contraseña no será modificada.</p>
                
                <p style="margin-top: 30px; color: #999; font-size: 14px;">
                  <strong>Nota de seguridad:</strong> Nunca compartas este código con nadie. El equipo de Kurro nunca te pedirá este código.
                </p>
              </div>
              <div class="footer">
                <p>Este es un email automático de <strong>Kurro</strong></p>
                <p>Si tienes problemas, contacta con nuestro soporte</p>
                <p style="margin-top: 20px;">
                  © ${new Date().getFullYear()} Kurro. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Recuperación de contraseña - Kurro

Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Tu código de verificación es: ${code}

⏰ Este código expira en 15 minutos.

Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.

---
© ${new Date().getFullYear()} Kurro. Todos los derechos reservados.
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
    
      
      return true;
    } catch (error) {
      console.error('[EMAIL] Error al enviar código de recuperación:', error);
      return false;
    }
  }

  /**
   * Verificar conexión con el servidor SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const emailService = new EmailService();
