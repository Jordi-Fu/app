# 📧 Configuración de Email para Recuperación de Contraseña

Para que el sistema envíe emails de recuperación de contraseña, configura las siguientes variables en tu archivo `.env`:

## Opción 1: Gmail (Recomendado para desarrollo)

1. **Habilitar "Contraseña de aplicación" en Gmail**:
   - Ve a https://myaccount.google.com/security
   - Activa "Verificación en 2 pasos"
   - Luego ve a https://myaccount.google.com/apppasswords
   - Genera una "Contraseña de aplicación" para "Correo"
   - Copia la contraseña generada (son 16 caracteres)

2. **Agregar al archivo `.env`**:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=Kurro <tu-email@gmail.com>
```

## Opción 2: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña
SMTP_FROM=Kurro <tu-email@outlook.com>
```

## Opción 3: Servicios Profesionales

### SendGrid (Recomendado para producción)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu-api-key-de-sendgrid
SMTP_FROM=noreply@tudominio.com
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tudominio.mailgun.org
SMTP_PASS=tu-contraseña-mailgun
SMTP_FROM=noreply@tudominio.com
```

### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=tu-access-key
SMTP_PASS=tu-secret-key
SMTP_FROM=noreply@tudominio.com
```

## 🧪 Probar Configuración

Después de configurar el `.env`, reinicia el servidor y solicita un código de recuperación:

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ejemplo.com"}'
```

Deberías ver en la consola:
```
[EMAIL] Código de recuperación enviado a: admin@ejemplo.com
[EMAIL] Message ID: <...>
```

Y recibir el email con el código.

## 🔧 Solución de Problemas

### Error: "Invalid login"
- Verifica que el email y contraseña sean correctos
- Si usas Gmail, asegúrate de usar una "Contraseña de aplicación", no tu contraseña normal

### Error: "Connection timeout"
- Verifica que el puerto sea el correcto (587 para TLS, 465 para SSL)
- Revisa el firewall y que permita conexiones SMTP salientes

### Error: "Self signed certificate"
- Agrega `SMTP_SECURE=false` al .env si usas puerto 587
- O configura `rejectUnauthorized: false` en el transporter (solo para desarrollo)

### Los emails van a SPAM
- Configura SPF, DKIM y DMARC en tu dominio
- Usa un servicio profesional como SendGrid en producción
- Añade un dominio verificado

## 📝 Notas

- En **desarrollo**: Si no se configura SMTP, el código se muestra en la consola
- En **producción**: SMTP es obligatorio para seguridad
- Los emails incluyen un diseño HTML responsive y profesional
- El código expira en 15 minutos

---

**Ejemplo completo de archivo `.env`**:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kurro
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=tu-clave-secreta-muy-larga-y-segura-de-al-menos-32-caracteres
JWT_REFRESH_SECRET=otra-clave-secreta-diferente-para-refresh-tokens
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=90d

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=Kurro <tu-email@gmail.com>
```
