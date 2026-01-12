# 🔐 API de Recuperación de Contraseña

## Endpoints Implementados

### 1. Solicitar Recuperación de Contraseña
**POST** `/api/auth/forgot-password`

Envía un código de verificación de 6 dígitos al email del usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Código de verificación enviado a tu email",
  "debug": {
    "code": "123456"  // Solo en desarrollo
  }
}
```

**Notas:**
- El código expira en **15 minutos**
- En desarrollo, el código se imprime en la consola del servidor
- En producción, el código se enviará por email (requiere configurar servicio de email)

---

### 2. Verificar Código de Recuperación
**POST** `/api/auth/verify-reset-code`

Verifica el código de 6 dígitos y devuelve un token de reset.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Código verificado correctamente",
  "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Código inválido"
}
```

**Notas:**
- Máximo **5 intentos** para verificar el código
- El token de reset expira cuando expira el código (15 min desde la solicitud)

---

### 3. Restablecer Contraseña
**POST** `/api/auth/reset-password`

Actualiza la contraseña del usuario usando el token de reset.

**Request Body:**
```json
{
  "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "newPassword": "NuevaContraseña123"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Token inválido"
}
```

**Notas:**
- El token solo se puede usar **una vez**
- Todos los tokens de sesión actuales se invalidan (logout forzado)
- La nueva contraseña debe cumplir los requisitos:
  - Mínimo 6 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número

---

## Flujo Completo de Recuperación

```
┌─────────────┐
│   Usuario   │
│ olvidó pass │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ POST /forgot-password       │
│ { email: "user@email.com" } │
└──────┬──────────────────────┘
       │
       │ Genera código: 123456
       │ Expira en: 15 min
       ▼
┌─────────────────────────────┐
│  Usuario recibe código      │
│  (email o consola en dev)   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ POST /verify-reset-code     │
│ { email, code: "123456" }   │
└──────┬──────────────────────┘
       │
       │ Retorna resetToken
       ▼
┌─────────────────────────────┐
│ POST /reset-password        │
│ { resetToken, newPassword } │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Contraseña actualizada     │
│  Sesiones invalidadas       │
└─────────────────────────────┘
```

---

## Ejemplo de Prueba con cURL

### 1. Solicitar código
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ejemplo.com"}'
```

### 2. Verificar código (usar el código mostrado en la consola)
```bash
curl -X POST http://localhost:3000/api/auth/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ejemplo.com", "code": "123456"}'
```

### 3. Restablecer contraseña (usar el resetToken del paso anterior)
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken": "a1b2c3d4...", "newPassword": "NuevaPass123"}'
```

---

## Seguridad Implementada

### 🛡️ Protecciones

1. **Rate Limiting**: Limita intentos de fuerza bruta
2. **Códigos temporales**: Expiran en 15 minutos
3. **Máximo de intentos**: Solo 5 intentos para verificar código
4. **Tokens de un solo uso**: No se pueden reutilizar
5. **Invalidación de sesiones**: Al cambiar contraseña, se cierran todas las sesiones
6. **Respuestas genéricas**: No revela si un email existe o no
7. **Validación fuerte**: Contraseñas deben cumplir requisitos de seguridad

### 🔒 Limitaciones Actuales (En Memoria)

**IMPORTANTE**: La implementación actual almacena los códigos en memoria (RAM) del servidor:

- ✅ **Funciona perfectamente** para desarrollo y pruebas
- ✅ **Fácil de probar** sin configurar base de datos adicional
- ⚠️ **Los códigos se pierden** si el servidor se reinicia
- ⚠️ **No escalable** para múltiples instancias del servidor

### 🚀 Para Producción

Para producción, considera almacenar los códigos en:
- **Redis**: Cache en memoria distribuida (recomendado)
- **PostgreSQL**: Tabla temporal en la base de datos
- **MongoDB**: Colección con TTL (Time To Live)

---

## Integración con Servicio de Email

Para enviar emails reales en producción, necesitas:

1. **Elegir un servicio de email**:
   - SendGrid
   - AWS SES
   - Mailgun
   - Nodemailer con Gmail/SMTP

2. **Instalar dependencia**:
```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

3. **Crear servicio de email**:
```typescript
// src/services/email.service.ts
import nodemailer from 'nodemailer';
import { ENV } from '../config/env.config';

export async function sendPasswordResetEmail(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: 'Kurro <noreply@kurro.com>',
    to: email,
    subject: 'Código de recuperación de contraseña',
    html: `
      <h1>Recuperación de contraseña</h1>
      <p>Tu código de verificación es:</p>
      <h2>${code}</h2>
      <p>Este código expira en 15 minutos.</p>
    `,
  });
}
```

4. **Actualizar el servicio de autenticación**:
```typescript
// En auth.service.ts, reemplazar el console.log:
// console.log(`[PASSWORD RESET] Código para ${email}: ${code}`);

// Por:
await sendPasswordResetEmail(email, code);
```

---

## Variables de Entorno

Agregar al archivo `.env`:

```env
# Email (para producción)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@kurro.com

# O usar SendGrid
SENDGRID_API_KEY=tu-api-key
```

---

## Errores Comunes

### Error: "Código no encontrado o expirado"
- El código expiró (>15 min)
- El servidor se reinició (códigos en memoria)
- Email incorrecto

### Error: "Demasiados intentos"
- Se intentó verificar el código más de 5 veces
- Solución: Solicitar nuevo código

### Error: "Token inválido"
- El resetToken expiró
- Ya se usó el token
- Solución: Comenzar proceso de nuevo

---

## Testing

### Usuarios de Prueba

```json
{
  "email": "admin@ejemplo.com",
  "username": "admin",
  "password": "Admin123"
}
```

### Monitoreo de Códigos (Solo Desarrollo)

En la consola del servidor verás:
```
[PASSWORD RESET] Código para admin@ejemplo.com: 123456
[PASSWORD RESET] Expira: 2026-01-12T08:15:00.000Z
```

---

**Hecho con ❤️ para Kurro**
