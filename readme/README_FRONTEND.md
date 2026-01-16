ng serve
cd "C:\Users\usr023\Desktop\Proyectos\E521-Nieves\Nueva carpeta\app\frontend";npm run build;npx cap sync android;npx cap open android



# Guía: Despliegue en Android con Capacitor

Este documento contiene los pasos exactos para desplegar tu aplicación Ionic/Angular en Android usando Capacitor y Android Studio.

## Tabla de Contenidos
- [Requisitos Previos](#requisitos-previos)
- [Configuración Inicial](#configuración-inicial)
- [Compilar y Abrir en Android Studio](#compilar-y-abrir-en-android-studio)
- [Flujo de Trabajo para Cambios](#flujo-de-trabajo-para-cambios)
- [Comandos Útiles](#comandos-útiles)
- [Generación de Release Firmado](#generación-de-release-firmado)
- [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **Android Studio** (última versión estable)
- **Android SDK** (API level 24 o superior)
- **JDK** (Java Development Kit 11 o superior)
- **Gradle** (se instala automáticamente con Android Studio)

### Verificar instalación (Windows PowerShell):
```powershell
node -v
npm -v
java -version
where adb
echo $Env:JAVA_HOME
echo $Env:ANDROID_SDK_ROOT
```

Si `JAVA_HOME` o `ANDROID_SDK_ROOT` no están configurados, agrégalos a las variables de entorno del sistema.

---

## Configuración Inicial

### 1. Navegar al directorio del frontend
```powershell
cd "c:\Users\usr023\Desktop\Proyectos\E521-Nieves\Nueva carpeta\app\frontend"
```

### 2. Instalar dependencias
```powershell
npm install
```

### 3. Verificar/configurar `capacitor.config.ts`
Abre el archivo `capacitor.config.ts` y verifica que el `appId` sea correcto:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuempresa.tuapp', // ← Cambia esto por tu identificador único
  appName: 'NombreDeTuApp',
  webDir: 'www',
  // ... otras configuraciones
};

export default config;
```

**Importante:** El `appId` debe tener formato de paquete Java (ej: `com.empresa.app`).

### 4. Compilar los assets web
```powershell
npm run build
```
O si usas Ionic CLI:
```powershell
ionic build
```

### 5. Añadir la plataforma Android (solo primera vez)
Si la carpeta `android/` no existe, ejecuta:
```powershell
npx cap add android
```

Si ya existe la carpeta, omite este paso.

### 6. Sincronizar el proyecto con Android
```powershell
npx cap sync android
```

Este comando:
- Copia los assets web compilados (`www/`) al proyecto Android
- Actualiza los plugins nativos de Capacitor
- Sincroniza la configuración

---

## Compilar y Abrir en Android Studio

### 7. Abrir el proyecto en Android Studio
```powershell
npx cap open android
```

**Alternativa manual:**
1. Abrir Android Studio
2. Seleccionar "Open"
3. Navegar a `frontend/android/` y abrir esa carpeta

### 8. Configurar Android Studio

Una vez abierto el proyecto:
1. Espera a que Gradle termine de sincronizar (verás la barra de progreso abajo)
2. Verifica que el SDK Android esté instalado: `Tools > SDK Manager`
3. Configura el JDK si es necesario: `File > Project Structure > SDK Location`

### 9. Ejecutar en emulador o dispositivo

#### Opción A: Desde Android Studio
1. Selecciona un dispositivo/emulador en la barra superior
2. Haz clic en el botón **Run** (▶) o presiona `Shift + F10`

#### Opción B: Desde la línea de comandos
```powershell
cd android
.\gradlew assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

---

## Flujo de Trabajo para Cambios

### Escenario 1: Cambios en el Frontend (HTML/CSS/TypeScript)

Cuando hagas cambios **solo en el código del frontend** (archivos en `src/`):

```powershell
# 1. Editar archivos en src/ (HTML, TS, SCSS, etc.)

# 2. Compilar el proyecto
npm run build

# 3. Copiar los assets al proyecto Android
npx cap copy android

# 4. Ejecutar en Android Studio (botón Run ▶)
```

### Escenario 2: Cambios en Plugins, Config Nativa o Dependencias

Cuando cambies:
- `capacitor.config.ts`
- Instalación/actualización de plugins de Capacitor
- Archivos nativos en `android/` (Java/Kotlin)
- `AndroidManifest.xml`

```powershell
# 1. Hacer los cambios necesarios

# 2. Compilar el proyecto
npm run build

# 3. Sincronizar (actualiza plugins y config nativa)
npx cap sync android

# 4. Abrir Android Studio
npx cap open android

# 5. Hacer Clean + Rebuild
# En Android Studio: Build > Clean Project
# Luego: Build > Rebuild Project

# 6. Ejecutar (botón Run ▶)
```

### Regla Práctica
- **`npx cap copy android`**: Solo copia assets web (más rápido)
- **`npx cap sync android`**: Actualiza todo (assets + plugins + configuración nativa)

### Desarrollo con Live Reload (Opcional)

Si usas Ionic CLI y quieres hot reload durante el desarrollo:

```powershell
ionic capacitor run android -l --external
```

Esto te permite ver cambios en tiempo real sin recompilar cada vez.

---

## Comandos Útiles

### Verificar estado de Capacitor
```powershell
npx cap doctor
```

### Actualizar plugins de Capacitor
```powershell
npm install @capacitor/core@latest @capacitor/cli@latest
npm install @capacitor/android@latest
npx cap sync android
```

### Ver dispositivos conectados
```powershell
adb devices
```

### Ver logs en tiempo real
```powershell
adb logcat
```

### Limpiar cache de Gradle (si hay problemas)
```powershell
cd android
.\gradlew clean
```

### Reinstalar completamente la plataforma Android
```powershell
# Eliminar carpeta android
Remove-Item -Recurse -Force android

# Volver a agregar
npx cap add android
npx cap sync android
```

---

## Generación de Release Firmado

### Opción A: Desde Android Studio (Recomendado)

1. En Android Studio: `Build > Generate Signed Bundle / APK`
2. Selecciona **Android App Bundle (AAB)** (requerido para Google Play)
3. Crea un nuevo keystore o usa uno existente
4. Completa los datos del keystore
5. Selecciona la variante de build: **release**
6. Finaliza el asistente

El archivo `.aab` se generará en `android/app/release/`.

### Opción B: Desde línea de comandos

#### Generar AAB (Android App Bundle)
```powershell
cd android
.\gradlew bundleRelease
```

#### Generar APK Release
```powershell
cd android
.\gradlew assembleRelease
```

**Nota:** Para firmar el release, necesitas configurar `signingConfigs` en `android/app/build.gradle` o usar el asistente de Android Studio.

### Configurar firma en `build.gradle` (Opcional)

Edita `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("ruta/a/tu/keystore.jks")
            storePassword "tu-password"
            keyAlias "tu-alias"
            keyPassword "tu-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## Solución de Problemas

### Error: "SDK location not found"
**Solución:**
1. En Android Studio: `File > Project Structure > SDK Location`
2. Configura la ruta del Android SDK
3. O crea el archivo `android/local.properties`:
```
sdk.dir=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk
```

### Error: "Could not find or load main class org.gradle.wrapper.GradleWrapperMain"
**Solución:**
```powershell
cd android
.\gradlew wrapper --gradle-version 8.0
```

### Error: "Manifest merger failed"
**Solución:**
- Revisa `android/app/src/main/AndroidManifest.xml`
- Verifica que no haya conflictos entre plugins
- Ejecuta `npx cap sync android` nuevamente

### Error: "JAVA_HOME is not set"
**Solución (Windows):**
1. Panel de Control > Sistema > Configuración avanzada del sistema
2. Variables de entorno > Nueva variable del sistema
3. Nombre: `JAVA_HOME`
4. Valor: `C:\Program Files\Java\jdk-17` (ajusta según tu versión)

### La app no se actualiza después de `npx cap copy`
**Solución:**
1. En Android Studio: `Build > Clean Project`
2. Luego: `Build > Rebuild Project`
3. Ejecutar nuevamente

### Cambios en `appId` no se reflejan
**Solución:**
```powershell
# 1. Actualizar capacitor.config.ts
# 2. Eliminar y recrear plataforma Android
Remove-Item -Recurse -Force android
npx cap add android
npx cap sync android
```

---

## Resumen del Flujo Completo

```
┌─────────────────────────────────────────────────┐
│ 1. Editar código en src/                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. npm run build                                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3a. npx cap copy android (cambios frontend)    │
│     O                                           │
│ 3b. npx cap sync android (cambios nativos)     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 4. npx cap open android (abrir Android Studio) │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 5. Run ▶ en Android Studio                     │
└─────────────────────────────────────────────────┘
```

---

## Recursos Adicionales

- [Documentación oficial de Capacitor](https://capacitorjs.com/docs)
- [Capacitor Android Configuration](https://capacitorjs.com/docs/android/configuration)
- [Ionic Framework Docs](https://ionicframework.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)

---

**Última actualización:** Diciembre 2025
