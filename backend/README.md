# 🔐 Sistema de Autenticación - Backend

Este documento explica paso a paso cómo funciona el sistema de login, diseñado para que cualquier persona pueda entenderlo, incluso si es su primera vez trabajando con autenticación.

---

## 📚 Tabla de Contenidos

1. [¿Qué es la Autenticación?](#-qué-es-la-autenticación)
2. [Estructura de Carpetas](#-estructura-de-carpetas)
3. [Flujo Completo del Login](#-flujo-completo-del-login)
4. [Explicación de Cada Carpeta](#-explicación-de-cada-carpeta)
5. [Conceptos Importantes](#-conceptos-importantes)
6. [Endpoints de la API](#-endpoints-de-la-api)
7. [Seguridad Implementada](#-seguridad-implementada)
8. [Cómo Probar](#-cómo-probar)

---

## 🤔 ¿Qué es la Autenticación?

La **autenticación** es el proceso de verificar que un usuario es quien dice ser. Es como cuando muestras tu identificación para entrar a un edificio.

En nuestra aplicación:
1. El usuario envía su **usuario/email/teléfono** y **contraseña**
2. El servidor verifica si son correctos
3. Si son correctos, el servidor le da un "pase" (llamado **token**) al usuario
4. El usuario usa ese pase para acceder a partes protegidas de la aplicación

---

## 📁 Estructura de Carpetas

```
backend/src/
│
├── 📄 server.ts          # Punto de entrada - Inicia el servidor
├── 📄 app.ts             # Configura Express y middlewares
│
├── 📁 config/            # Configuraciones
│   └── env.config.ts     # Variables de entorno (secretos, puertos, etc.)
│
├── 📁 controllers/       # Controladores - Manejan las peticiones HTTP
│   └── auth.controller.ts
│
├── 📁 models/            # Modelos - Manejan los datos
│   ├── user.model.ts     # Datos de usuarios
│   └── token.model.ts    # Datos de tokens
│
├── 📁 routes/            # Rutas - Definen los endpoints de la API
│   └── auth.routes.ts
│
├── 📁 services/          # Servicios - Lógica de negocio
│   └── auth.service.ts
│
├── 📁 middlewares/       # Middlewares - Funciones intermedias
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
│
├── 📁 validators/        # Validadores - Verifican datos de entrada
│   └── auth.validator.ts
│
└── 📁 interfaces/        # Interfaces - Tipos de TypeScript
    └── auth.interface.ts
```

---

## 🔄 Flujo Completo del Login

### Paso 1: El Usuario Hace Click en "Iniciar Sesión"

El frontend envía una petición HTTP al backend:

```
POST http://localhost:3000/api/auth/login
{
  "credential": "admin",      // Puede ser usuario, email o teléfono
  "password": "Admin123"
}
```

### Paso 2: La Petición Llega a las Rutas

📄 **`routes/auth.routes.ts`**

```typescript
router.post(
  '/login',
  authValidators.login(),        // 1. Primero valida los datos
  handleValidationErrors,        // 2. Si hay errores, los maneja
  authController.login           // 3. Si todo está bien, ejecuta el login
);
```

**¿Qué pasa aquí?**
- La ruta `/login` recibe la petición
- Pasa por varios "filtros" (middlewares) antes de llegar al controlador
- Es como pasar por varios checkpoints de seguridad

### Paso 3: Validación de Datos

📄 **`validators/auth.validator.ts`**

```typescript
body('credential')
  .trim()                              // Quita espacios al inicio y final
  .notEmpty()                          // Verifica que no esté vacío
  .isLength({ min: 3, max: 100 })      // Verifica longitud
  .escape()                            // Limpia caracteres peligrosos (XSS)
```

**¿Qué pasa aquí?**
- Se verifica que los datos tengan el formato correcto
- Se "limpian" los datos para prevenir ataques
- Si algo está mal, se devuelve un error inmediatamente

### Paso 4: El Controlador Recibe la Petición

📄 **`controllers/auth.controller.ts`**

```typescript
async login(req: Request, res: Response): Promise<void> {
  const { credential, password } = req.body;  // Extrae los datos
  const result = await authService.login({ credential, password });  // Llama al servicio
  res.status(200).json(result);  // Devuelve la respuesta
}
```

**¿Qué pasa aquí?**
- El controlador es el "intermediario" entre la petición HTTP y la lógica
- Extrae los datos del body de la petición
- Llama al servicio para procesar el login
- Devuelve la respuesta al frontend

### Paso 5: El Servicio Procesa el Login

📄 **`services/auth.service.ts`**

```typescript
async login(loginData: LoginRequest): Promise<AuthResponse> {
  // 1. Buscar usuario
  const user = userModel.findByCredential(credential);
  
  // 2. Verificar si existe
  if (!user) {
    return { success: false, message: 'Credenciales inválidas' };
  }
  
  // 3. Verificar si está bloqueado
  if (userModel.isLocked(user)) {
    return { success: false, message: 'Cuenta bloqueada' };
  }
  
  // 4. Verificar contraseña
  const isValid = await userModel.verifyPassword(password, user.password);
  
  if (!isValid) {
    userModel.incrementFailedAttempts(user.id);  // Incrementa intentos fallidos
    return { success: false, message: 'Credenciales inválidas' };
  }
  
  // 5. Login exitoso - Generar tokens
  const tokens = this.generateTokens(user.id, user.username, user.email);
  
  return { success: true, user, tokens };
}
```

**¿Qué pasa aquí?**
- El servicio contiene toda la **lógica de negocio**
- Verifica paso a paso si el login es válido
- Si todo está bien, genera los tokens de acceso

### Paso 6: El Modelo Accede a los Datos

📄 **`models/user.model.ts`**

```typescript
findByCredential(credential: string): User | undefined {
  // Busca en la "base de datos" por username, email o teléfono
  for (const user of this.users.values()) {
    if (user.username === credential || 
        user.email === credential ||
        user.phone === credential) {
      return user;
    }
  }
  return undefined;
}
```

**¿Qué pasa aquí?**
- El modelo es responsable de acceder y manipular los datos
- En producción, esto se conectaría a una base de datos real
- Actualmente usa un Map en memoria para pruebas

### Paso 7: Se Generan los Tokens JWT

```typescript
private generateTokens(userId, username, email): AuthTokens {
  const payload = { userId, username, email };
  
  // Token de acceso - Dura 15 minutos
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  
  // Token de refresco - Dura 7 días
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
}
```

**¿Qué pasa aquí?**
- Se crean dos tokens firmados digitalmente
- El **accessToken** es para usar la API (corta duración)
- El **refreshToken** es para obtener nuevos accessTokens (larga duración)

### Paso 8: La Respuesta Vuelve al Frontend

```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": "abc123",
    "username": "admin",
    "email": "admin@ejemplo.com"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  }
}
```

---

## 📂 Explicación de Cada Carpeta

### 📁 `config/` - Configuración

**¿Qué es?** Contiene la configuración del servidor.

**¿Qué hay dentro?**
- `env.config.ts` - Lee las variables de entorno (`.env`)

**¿Para qué sirve?**
- Centralizar la configuración en un solo lugar
- No poner secretos directamente en el código
- Facilitar cambios entre desarrollo y producción

```typescript
export const ENV = {
  PORT: 3000,
  JWT_SECRET: 'mi_clave_secreta',  // ⚠️ En producción viene del .env
  JWT_EXPIRES_IN: '15m'
};
```

---

### 📁 `controllers/` - Controladores

**¿Qué es?** Manejan las peticiones HTTP que llegan del frontend.

**Analogía:** Son como los recepcionistas de un hotel - reciben tu petición, la procesan y te dan una respuesta.

**Responsabilidades:**
- ✅ Recibir la petición (req)
- ✅ Extraer los datos del body, params, query
- ✅ Llamar al servicio correspondiente
- ✅ Devolver la respuesta (res)
- ❌ NO contienen lógica de negocio
- ❌ NO acceden directamente a la base de datos

```typescript
// Ejemplo simplificado
async login(req, res) {
  const datos = req.body;              // Recibe
  const resultado = await service.login(datos);  // Delega
  res.json(resultado);                 // Responde
}
```

---

### 📁 `models/` - Modelos

**¿Qué es?** Representan y manejan los datos de la aplicación.

**Analogía:** Son como el archivero de una oficina - guardan, buscan y organizan la información.

**Responsabilidades:**
- ✅ Definir la estructura de los datos
- ✅ Crear, leer, actualizar y eliminar datos (CRUD)
- ✅ Validar datos a nivel de base de datos
- ❌ NO manejan peticiones HTTP
- ❌ NO contienen lógica de negocio compleja

```typescript
// user.model.ts
class UserModel {
  findById(id)           // Buscar por ID
  findByEmail(email)     // Buscar por email
  create(userData)       // Crear usuario
  update(id, data)       // Actualizar usuario
  delete(id)             // Eliminar usuario
}
```

---

### 📁 `routes/` - Rutas

**¿Qué es?** Definen los endpoints (URLs) de la API.

**Analogía:** Son como el mapa de un edificio - te dicen a dónde ir según lo que necesitas.

**Responsabilidades:**
- ✅ Definir los endpoints (GET, POST, PUT, DELETE)
- ✅ Asignar middlewares a cada ruta
- ✅ Conectar rutas con controladores
- ❌ NO contienen lógica
- ❌ NO manipulan datos

```typescript
// auth.routes.ts
router.post('/login', validar, controller.login);
router.post('/logout', autenticar, controller.logout);
router.get('/me', autenticar, controller.me);
```

---

### 📁 `services/` - Servicios

**¿Qué es?** Contienen la lógica de negocio de la aplicación.

**Analogía:** Son como el chef de un restaurante - conocen las "recetas" (reglas del negocio) y cómo preparar todo.

**Responsabilidades:**
- ✅ Implementar reglas de negocio
- ✅ Coordinar operaciones entre modelos
- ✅ Procesar datos
- ✅ Generar tokens, validar contraseñas, etc.
- ❌ NO manejan peticiones HTTP directamente

```typescript
// auth.service.ts
class AuthService {
  login()         // Verificar credenciales, generar tokens
  logout()        // Invalidar tokens
  refreshTokens() // Renovar tokens
}
```

---

### 📁 `middlewares/` - Middlewares

**¿Qué es?** Funciones que se ejecutan ANTES de que la petición llegue al controlador.

**Analogía:** Son como los guardias de seguridad - verifican todo antes de dejarte pasar.

**Tipos de middleware:**

1. **auth.middleware.ts** - Verifica que el usuario esté autenticado
```typescript
// Si no hay token válido, devuelve error 401
if (!token) {
  return res.status(401).json({ message: 'No autorizado' });
}
```

2. **validation.middleware.ts** - Verifica que los datos sean correctos
```typescript
// Si hay errores de validación, devuelve error 400
if (errors.length > 0) {
  return res.status(400).json({ errors });
}
```

3. **error.middleware.ts** - Captura y maneja errores
```typescript
// Si algo falla, devuelve un error amigable
if (error) {
  return res.status(500).json({ message: 'Error interno' });
}
```

---

### 📁 `validators/` - Validadores

**¿Qué es?** Definen reglas para validar los datos de entrada.

**Analogía:** Son como un formulario con campos obligatorios - te dicen qué datos necesitas y en qué formato.

```typescript
// auth.validator.ts
body('credential')
  .notEmpty()           // No puede estar vacío
  .isLength({ min: 3 }) // Mínimo 3 caracteres

body('password')
  .notEmpty()           // No puede estar vacío
  .isLength({ min: 6 }) // Mínimo 6 caracteres
```

---

### 📁 `interfaces/` - Interfaces (TypeScript)

**¿Qué es?** Definen la "forma" de los datos en TypeScript.

**Analogía:** Son como los planos de una casa - definen qué "habitaciones" (propiedades) debe tener cada estructura.

```typescript
// auth.interface.ts
interface User {
  id: string;
  username: string;
  email: string;
  password: string;  // Nunca enviamos esto al frontend
}

interface SafeUser {
  id: string;
  username: string;
  email: string;
  // Sin password - seguro para enviar
}
```

---

## 💡 Conceptos Importantes

### 🔑 JWT (JSON Web Token)

**¿Qué es?** Un "pase" digital que demuestra que el usuario está autenticado.

**Estructura:**
```
eyJhbGciOiJIUzI1NiIs.eyJ1c2VySWQiOiIxMjMiLCJ.SflKxwRJSMeKKF2QT4fwp
|_____HEADER_____|._____PAYLOAD_____|.____SIGNATURE____|
```

- **Header:** Tipo de token y algoritmo
- **Payload:** Datos del usuario (userId, email, etc.)
- **Signature:** Firma digital para verificar autenticidad

**¿Por qué dos tokens?**
- **Access Token (15 min):** Para hacer peticiones a la API
- **Refresh Token (7 días):** Para obtener nuevos access tokens sin re-loguearse

### 🔒 Bcrypt

**¿Qué es?** Algoritmo para hashear (encriptar) contraseñas.

**¿Por qué es importante?**
- Las contraseñas NUNCA se guardan en texto plano
- Si alguien roba la base de datos, no puede ver las contraseñas
- Es "one-way" - no se puede revertir el hash

```typescript
// Guardar contraseña
const hash = await bcrypt.hash('Admin123', 12);
// Resultado: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.AQPe7u...

// Verificar contraseña
const esValida = await bcrypt.compare('Admin123', hash);
// Resultado: true
```

### 🛡️ Rate Limiting

**¿Qué es?** Limita cuántas peticiones puede hacer un usuario en cierto tiempo.

**¿Por qué es importante?**
- Previene ataques de fuerza bruta
- Protege contra bots maliciosos
- Evita sobrecarga del servidor

```typescript
// Configuración
rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100                    // Máximo 100 peticiones
});
```

### 🎭 CORS (Cross-Origin Resource Sharing)

**¿Qué es?** Controla qué dominios pueden acceder a tu API.

**¿Por qué es importante?**
- Previene que sitios maliciosos accedan a tu API
- Solo permite peticiones de orígenes autorizados

```typescript
cors({
  origin: 'http://localhost:4200',  // Solo el frontend puede acceder
  credentials: true
});
```

### ⛑️ Helmet

**¿Qué es?** Middleware que añade headers de seguridad HTTP.

**¿Qué headers añade?**
- `X-Frame-Options` - Previene clickjacking
- `X-XSS-Protection` - Previene XSS
- `Content-Security-Policy` - Controla qué recursos se pueden cargar

---

## 🌐 Endpoints de la API

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Iniciar sesión | ❌ No |
| POST | `/api/auth/refresh` | Renovar tokens | ❌ No |
| POST | `/api/auth/logout` | Cerrar sesión | ✅ Sí |
| GET | `/api/auth/me` | Obtener usuario actual | ✅ Sí |
| GET | `/api/auth/verify` | Verificar token | ✅ Sí |
| GET | `/api/health` | Estado del servidor | ❌ No |

---

## 🔐 Seguridad Implementada

| Medida | Descripción | Archivo |
|--------|-------------|---------|
| Contraseñas hasheadas | bcrypt con 12 rounds | `user.model.ts` |
| JWT con refresh | Access 15min, Refresh 7d | `auth.service.ts` |
| Rate limiting | 100 req/15min, 10 login/15min | `app.ts` |
| Headers seguros | Helmet.js | `app.ts` |
| Validación de inputs | express-validator | `auth.validator.ts` |
| CORS configurado | Solo origen permitido | `app.ts` |
| Bloqueo por intentos | 5 intentos = 15min bloqueado | `user.model.ts` |

---

## 🧪 Cómo Probar

### 1. Iniciar el servidor

```bash
cd backend
npm install
npm run dev
```

### 2. Credenciales de prueba

```
Usuario: admin
Email: admin@ejemplo.com
Teléfono: 1234567890
Contraseña: Admin123
```

### 3. Probar con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"credential": "admin", "password": "Admin123"}'

# Obtener usuario (reemplaza TOKEN con el accessToken recibido)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### 4. Probar con el frontend

El frontend en `http://localhost:4200` está configurado para conectarse automáticamente.

---

## 📝 Resumen del Flujo

```
┌─────────────┐     ┌──────────┐     ┌────────────┐     ┌─────────┐     ┌───────┐
│  Frontend   │────▶│  Routes  │────▶│ Validators │────▶│ Control │────▶│Service│
│             │     │          │     │            │     │         │     │       │
│ POST /login │     │ /login   │     │ Validar    │     │ login() │     │login()│
└─────────────┘     └──────────┘     └────────────┘     └─────────┘     └───┬───┘
                                                                            │
                          ┌─────────────────────────────────────────────────┘
                          ▼
                    ┌───────────┐     ┌──────────────┐
                    │   Model   │────▶│   Response   │
                    │           │     │              │
                    │findUser() │     │ { tokens }   │
                    └───────────┘     └──────────────┘
```

---

## 🤝 Contribuir

Si encuentras algún error o tienes sugerencias, ¡crea un issue o pull request!

---

**Hecho con ❤️ para aprender**
