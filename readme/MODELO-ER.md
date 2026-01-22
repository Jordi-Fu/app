# 🗺️ Modelo Entidad-Relación - Base de Datos de Servicios

## 📋 Información General

**Base de Datos:** aplicacion_servicios  
**Total de Tablas:** 24 tablas + 1 vista  
**PostgreSQL:** 12+  
**Versión del Schema:** 2.0.0  
**Última Actualización:** Enero 2026

---

## 🗺️ Diagrama ER Completo de la Base de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MÓDULO DE USUARIOS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────┐
    │        USUARIOS             │ (Tabla Central - Usuario de la plataforma)
    │─────────────────────────────│
    │ • id (PK)                   │
    │ • correo (UNIQUE)           │
    │ • hash_password             │──┐
    │ • usuario (UNIQUE)          │  │
    │ • nombre, apellido          │  │
    │ • telefono, codigo_pais     │  │
    │ • url_avatar, biografia     │  │
    │ • fecha_nacimiento          │  │
    │ • esta_verificado           │  │
    │ • esta_activo, esta_en_linea│  │
    │ • ultima_actividad          │  │
    │ • promedio_calificacion     │  │
    │ • total_resenas             │  │
    │ • total_servicios           │  │
    │ • tiempo_respuesta_minutos  │  │
    │ • porcentaje_respuesta      │  │
    │ • idioma, zona_horaria      │  │
    │ • moneda (€)              │  │
    │ • token_fcm (Push)          │  │
    │ • notificaciones_email      │  │
    │ • notificaciones_push       │  │
    │ • notificaciones_sms        │  │
    │ • intentos_fallidos_login   │  │
    │ • bloqueado_hasta           │  │
    │ • ultimo_login              │  │
    │ • creado_en, actualizado_en │  │
    │ • eliminado_en              │  │
    └─────────────────────────────┘  │
                │                     │
                │                     │
    ┌───────────┼─────────────────────┼────────────────────────────────┐
    │           │                     │                                │
    ▼           ▼                     ▼                                ▼
┌───────────────────────┐  ┌──────────────────────────┐  ┌─────────────────────────┐
│ DIRECCIONES_USUARIOS  │  │ VERIFICACIONES_USUARIOS  │  │ INSIGNIAS_OBTENIDAS_    │
│───────────────────────│  │──────────────────────────│  │      USUARIOS           │
│ • id (PK)             │  │ • id (PK)                │  │─────────────────────────│
│ • usuario_id (FK)     │  │ • usuario_id (FK)        │  │ • id (PK)               │
│ • etiqueta            │  │ • tipo_verificacion      │  │ • usuario_id (FK)       │
│ • direccion_linea1    │  │ • tipo_documento         │  │ • insignia_id (FK)      │
│ • direccion_linea2    │  │ • numero_documento       │  │ • obtenido_en           │
│ • ciudad, estado      │  │ • url_documento          │  └─────────────────────────┘
│ • codigo_postal, pais │  │ • url_documento_reverso  │             │
│ • latitud, longitud   │  │ • url_selfie             │             │
│ • predeterminada      │  │ • estado (ENUM)          │             ▼
│ • creado_en           │  │ • verificado_por (FK)    │  ┌─────────────────────────┐
│ • actualizado_en      │  │ • verificado_en          │  │   INSIGNIAS_USUARIOS    │
└───────────────────────┘  │ • expira_en              │  │─────────────────────────│
                           │ • razon_rechazo          │  │ • id (PK)               │
                           │ • notas                  │  │ • nombre                │
                           │ • creado_en              │  │ • slug (UNIQUE)         │
                           │ • actualizado_en         │  │ • descripcion           │
                           └──────────────────────────┘  │ • url_icono             │
                                                         │ • requisitos (JSONB)    │
                                                         │ • esta_activo           │
                                                         │ • creado_en             │
                                                         └─────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE SERVICIOS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────┐           ┌──────────────────────────────┐
    │     CATEGORIAS          │           │        SERVICIOS             │ (Publicados)
    │─────────────────────────│           │──────────────────────────────│
    │ • id (PK)               │◄──────────│ • id (PK)                    │
    │ • nombre                │ categoria_│ • proveedor_id (FK)          │◄──┐
    │ • slug (UNIQUE)         │    id     │ • categoria_id (FK)          │   │
    │ • descripcion           │           │ • titulo                     │   │ De
    │ • url_icono             │           │ • descripcion                │   │ USUARIOS
    │ • color                 │           │ • tipo_precio (ENUM)         │   │
    │ • padre_id (FK)         │           │ • precio, moneda             │   │
    │ • activo                │           │ • tipo_ubicacion             │   │
    │ • conteo_servicios      │           │ • direccion, ciudad          │   │
    │ • creado_en             │           │ • estado, pais               │   │
    │ • actualizado_en        │           │ • codigo_postal              │   │
    └─────────────────────────┘           │ • latitud, longitud          │   │
            │ (Subcategorías)             │ • esta_activo                │   │
            └─────┐                       │ • es_destacado               │   │
                  │                       │ • esta_verificado            │   │
                  └────────────┐          │ • vistas                     │   │
                               │          │ • conteo_favoritos           │   │
    ┌──────────────────────────┼──────────│ • promedio_calificacion      │   │
    │                          │          │ • total_resenas              │   │
    │                          │          │ • tiempo_respuesta_horas     │   │
    ▼                          ▼          │ • politica_cancelacion       │   │
┌──────────────────────┐  ┌────────────── ┤ • incluye, no_incluye        │   │
│ IMAGENES_SERVICIOS   │  │               │ • url_video                  │   │
│──────────────────────│  │               │ • creado_en                  │   │
│ • id (PK)            │  │               │ • actualizado_en             │   │
│ • servicio_id (FK)   │  │               │ • eliminado_en               │   │
│ • url_imagen         │  │               └──────────────────────────────┘   │
│ • url_miniatura      │  │                                                  │
│ • pie_de_foto        │  │  ┌──────────────────────────────────────────────┘
│ • es_principal       │  │  │
│ • indice_orden       │  │  │  ┌──────────────────────────────┐
│ • ancho, alto        │  │  │  │ DISPONIBILIDAD_SERVICIOS     │
│ • creado_en          │  │  │  │──────────────────────────────│
└──────────────────────┘  │  │  │ • id (PK)                    │
                          │  └──┤ • servicio_id (FK)           │
                          │     │ • dia_semana                 │
                          │     │ • hora_inicio                │
                          │     │ • hora_fin                   │
                          │     │ • esta_disponible            │
                          │     │ • creado_en                  │
                          │     │ • actualizado_en             │
                          │     └──────────────────────────────┘
                          │                 │
                          │                 ▼
                          │     ┌──────────────────────────────┐
                          │     │   EXCEPCIONES_SERVICIOS      │
                          │     │──────────────────────────────│
                          │     │ • id (PK)                    │
                          │     │ • servicio_id (FK)           │
                          │     │ • fecha_excepcion            │
                          │     │ • esta_disponible            │
                          │     │ • hora_inicio, hora_fin      │
                          │     │ • motivo                     │
                          │     │ • creado_en                  │
                          │     └──────────────────────────────┘
                          │
                          ▼
   ┌─────────────────────────────┐
   │ PREGUNTAS_FRECUENTES_       │
   │      SERVICIOS              │
   │─────────────────────────────│
   │ • id (PK)                   │
   │ • servicio_id (FK)          │
   │ • pregunta                  │
   │ • respuesta                 │
   │ • indice_orden              │
   │ • creado_en                 │
   │ • actualizado_en            │
   └─────────────────────────────┘
            │
            ▼ (Relación con ETIQUETAS en módulo de Búsqueda)


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE VALORACIONES                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │          RESENAS             │ (Reseñas y valoraciones de servicios)
    │──────────────────────────────│
    │ • id (PK)                    │
    │ • servicio_id (FK)           │───► SERVICIOS
    │ • revisor_id (FK)            │───► USUARIOS (quien valora)
    │ • usuario_valorado_id (FK)   │───► USUARIOS (quien es valorado)
    │ • calificacion (1-5)         │
    │ • titulo                     │
    │ • comentario                 │
    │ • ventajas                   │
    │ • desventajas                │
    │ • es_anonimo                 │
    │ • respuesta (del proveedor)  │
    │ • fecha_respuesta            │
    │ • es_destacada               │
    │ • votos_utiles               │
    │ • creado_en                  │
    │ • actualizado_en             │
    │ UNIQUE(servicio_id, revisor_id) │
    └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE CHAT/MENSAJERÍA                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐         ┌──────────────────────────────┐
    │      CONVERSACIONES          │         │         MENSAJES             │
    │──────────────────────────────│         │──────────────────────────────│
    │ • id (PK)                    │◄────────│ • id (PK)                    │
    │ • participante_1_id (FK)     │───┐     │ • conversacion_id (FK)       │
    │ • participante_2_id (FK)     │───┤     │ • remitente_id (FK)          │───► USUARIOS
    │ • servicio_id (FK)           │───┘     │ • tipo_mensaje (ENUM)        │
    │ • texto_ultimo_mensaje       │  └──────│ • contenido                  │
    │ • ultimo_mensaje_en          │ USUARIOS│ • url_media                  │
    │ • ultimo_mensaje_remitente_id│         │ • url_miniatura_media        │
    │ • no_leidos_p1               │         │ • nombre_archivo             │
    │ • no_leidos_p2               │         │ • latitud, longitud          │
    │ • esta_archivado_p1          │         │ • esta_leido, leido_en       │
    │ • esta_archivado_p2          │         │ • esta_editado, editado_en   │
    │ • creado_en                  │         │ • esta_eliminado, eliminado_en│
    │ • actualizado_en             │         │ • respuesta_a_mensaje_id (FK)│
    │ UNIQUE(p1, p2, servicio)     │         │ • creado_en                  │
    └──────────────────────────────┘         └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE FAVORITOS Y PORTAFOLIO                       │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐          ┌──────────────────────────────┐
    │      FAVORITOS           │          │       PORTAFOLIOS            │
    │──────────────────────────│          │──────────────────────────────│
    │ • id (PK)                │          │ • id (PK)                    │
    │ • usuario_id (FK)        │──► USUARIOS   • proveedor_id (FK)    │──► USUARIOS
    │ • servicio_id (FK)       │──► SERVICIOS  • titulo                │
    │ • creado_en              │          │ • descripcion                │
    │ UNIQUE(usuario, servicio)│          │ • url_imagen                 │
    └──────────────────────────┘          │ • url_miniatura              │
                                          │ • categoria_id (FK)          │──► CATEGORIAS
                                          │ • indice_orden               │
                                          │ • es_destacado               │
                                          │ • creado_en                  │
                                          └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE NOTIFICACIONES                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │      NOTIFICACIONES          │ (Sistema de alertas push e in-app)
    │──────────────────────────────│
    │ • id (PK)                    │
    │ • usuario_id (FK)            │───► USUARIOS
    │ • tipo (ENUM)                │ (mensaje, valoracion, sistema, promocion)
    │ • titulo                     │
    │ • contenido                  │
    │ • url_imagen                 │
    │ • id_relacionado             │ (UUID genérico)
    │ • tipo_relacionado           │ (Tipo de entidad relacionada)
    │ • esta_leido                 │
    │ • leido_en                   │
    │ • url_accion                 │
    │ • etiqueta_accion            │
    │ • push_enviado               │
    │ • push_enviado_en            │
    │ • creado_en                  │
    └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE REPORTES/MODERACIÓN                          │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐       ┌──────────────────────────────┐
    │         REPORTES             │       │    USUARIOS_BLOQUEADOS       │
    │──────────────────────────────│       │──────────────────────────────│
    │ • id (PK)                    │       │ • id (PK)                    │
    │ • reportador_id (FK)         │───►USU│ • bloqueador_id (FK)         │───► USUARIOS
    │ • usuario_reportado_id (FK)  │───►USU│ • bloqueado_id (FK)          │───► USUARIOS
    │ • servicio_reportado_id (FK) │───►SER│ • razon                      │
    │ • resena_reportada_id (FK)   │───►RES│ • creado_en                  │
    │ • mensaje_reportado_id (FK)  │───►MEN│ UNIQUE(bloqueador, bloqueado)│
    │ • tipo_reporte (ENUM)        │       │ CHECK(bloqueador ≠ bloqueado)│
    │ • descripcion                │       └──────────────────────────────┘
    │ • urls_evidencia (Array)     │
    │ • estado (ENUM)              │
    │ • notas_admin                │
    │ • resuelto_por (FK)          │───► USUARIOS (Admin)
    │ • resuelto_en                │
    │ • creado_en                  │
    │ • actualizado_en             │
    └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE BÚSQUEDA Y ETIQUETAS                         │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐       ┌──────────────────────────┐
    │   HISTORIAL_BUSQUEDAS        │       │      ETIQUETAS           │
    │──────────────────────────────│       │──────────────────────────│
    │ • id (PK)                    │       │ • id (PK)                │
    │ • usuario_id (FK)            │───►USU│ • nombre (UNIQUE)        │
    │ • termino_busqueda           │       │ • slug (UNIQUE)          │
    │ • categoria_id (FK)          │───►CAT│ • conteo_uso             │
    │ • filtros (JSONB)            │       │ • creado_en              │
    │ • ubicacion                  │       └──────────────────────────┘
    │ • latitud, longitud          │                    │
    │ • conteo_resultados          │                    │
    │ • servicio_clickeado_id (FK) │───► SERVICIOS      ▼
    │ • creado_en                  │       ┌────────────────────────────┐
    └──────────────────────────────┘       │   SERVICIOS_ETIQUETAS      │
                                           │────────────────────────────│
                                           │ • servicio_id (PK,FK)      │───► SERVICIOS
                                           │ • etiqueta_id (PK,FK)      │───► ETIQUETAS
                                           │ • creado_en                │
                                           └────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE PROMOCIONES                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────┐     ┌─────────────────────────────┐
    │    CODIGOS_PROMOCIONALES         │     │  USO_CODIGOS_PROMOCIONALES  │
    │──────────────────────────────────│     │─────────────────────────────│
    │ • id (PK)                        │◄────│ • id (PK)                   │
    │ • codigo (UNIQUE)                │     │ • codigo_promocional_id(FK) │
    │ • descripcion                    │     │ • usuario_id (FK)           │───► USUARIOS
    │ • tipo_descuento (ENUM)          │     │ • monto_descuento           │
    │ • valor_descuento                │     │ • usado_en                  │
    │ • monto_descuento_maximo         │     └─────────────────────────────┘
    │ • usos_maximos                   │
    │ • usos_maximos_por_usuario       │
    │ • conteo_usos                    │
    │ • monto_compra_minimo            │
    │ • categoria_id (FK)              │───► CATEGORIAS (opcional)
    │ • servicios_aplicables (Array)   │
    │ • valido_desde                   │
    │ • valido_hasta                   │
    │ • esta_activo                    │
    │ • creado_por (FK)                │───► USUARIOS
    │ • creado_en                      │
    │ • actualizado_en                 │
    └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO SOCIAL/SEGUIDORES                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │    SEGUIDORES_USUARIOS       │ (Red social - Sistema de follows)
    │──────────────────────────────│
    │ • id (PK)                    │
    │ • seguidor_id (FK)           │───► USUARIOS (quien sigue)
    │ • seguido_id (FK)            │───► USUARIOS (a quien siguen)
    │ • creado_en                  │
    │ UNIQUE(seguidor, seguido)    │
    │ CHECK(seguidor_id ≠ seguido_id)│
    └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      MÓDULO DE ADMINISTRACIÓN                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │    REGISTROS_AUDITORIA       │
    │──────────────────────────────│
    │ • id (PK)                    │
    │ • usuario_id (FK)            │───► USUARIOS
    │ • accion                     │
    │ • nombre_tabla               │
    │ • id_registro                │
    │ • valores_antiguos (JSONB)   │
    │ • valores_nuevos (JSONB)     │
    │ • direccion_ip               │
    │ • agente_usuario             │
    │ • creado_en                  │
    └──────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      VISTA MATERIALIZADA                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────┐
    │      SERVICIOS_CON_PROVEEDOR (Vista)     │
    │──────────────────────────────────────────│
    │ Combina: SERVICIOS + USUARIOS + CATEGORIAS│
    │ • Todos los campos de SERVICIOS          │
    │ • nombre_usuario_proveedor               │
    │ • nombre_proveedor                       │
    │ • apellido_proveedor                     │
    │ • avatar_proveedor                       │
    │ • calificacion_proveedor                 │
    │ • nombre_categoria                       │
    │ • slug_categoria                         │
    └──────────────────────────────────────────┘
```

---

## 📚 Funcionalidad Detallada de Cada Tabla

### 🔵 **MÓDULO DE USUARIOS**

#### **1. USUARIOS** (Tabla Central del Sistema)
**Funcionalidad:** Almacena toda la información de los usuarios de la plataforma.
- **Qué hace:** Gestiona el registro, autenticación y perfil completo de usuarios
- **Casos de uso:**
  - Registro de nuevos usuarios con email y contraseña
  - Login y autenticación
  - Perfil público con avatar, biografía, calificaciones
  - Estado online/offline en tiempo real
  - Configuración de notificaciones (email, push, SMS)
  - Sistema de bloqueo temporal por intentos fallidos
  - Tokens FCM para notificaciones push móviles

#### **2. DIRECCIONES_USUARIOS**
**Funcionalidad:** Múltiples direcciones por usuario (casa, trabajo, etc.)
- **Qué hace:** Almacena direcciones físicas con geolocalización
- **Casos de uso:**
  - Direcciones de envío/servicio
  - Búsqueda de servicios cercanos por ubicación
  - Una dirección marcada como predeterminada
  - Etiquetas personalizadas (home, work, other)

#### **3. VERIFICACIONES_USUARIOS**
**Funcionalidad:** Sistema de verificación de identidad KYC (Know Your Customer)
- **Qué hace:** Valida la identidad del usuario mediante documentos
- **Casos de uso:**
  - Upload de documentos (DNI, pasaporte, licencia)
  - Selfie de verificación
  - Estados: pendiente, aprobado, rechazado, expirado
  - Solo usuarios verificados pueden ofrecer ciertos servicios
  - Aumenta la confianza en la plataforma

#### **4. INSIGNIAS_USUARIOS**
**Funcionalidad:** Gamificación y reconocimiento de logros
- **Qué hace:** Define insignias/badges disponibles en la plataforma
- **Casos de uso:**
  - "Proveedor Verificado" - identidad confirmada
  - "Mejor Valorado" - calificación promedio 4.8+
  - "Respuesta Rápida" - responde en <1 hora
  - "Super Vendedor" - 100+ servicios completados
  - Requisitos definidos en JSONB

#### **5. INSIGNIAS_OBTENIDAS_USUARIOS**
**Funcionalidad:** Relación usuario-insignia (qué insignias ha ganado cada usuario)
- **Qué hace:** Registra cuándo un usuario obtuvo una insignia
- **Casos de uso:**
  - Mostrar insignias en perfil público
  - Timeline de logros del usuario
  - Sistema de recompensas y motivación

---

### 🟢 **MÓDULO DE SERVICIOS**

#### **6. CATEGORIAS**
**Funcionalidad:** Organización jerárquica de tipos de servicios
- **Qué hace:** Estructura de árbol para categorías y subcategorías
- **Casos de uso:**
  - Categorías principales: Limpieza, Reparaciones, Clases, etc.
  - Subcategorías: Limpieza → Limpieza profunda, Limpieza express
  - Navegación por categorías en la app
  - Filtrado y búsqueda
  - Íconos y colores personalizados por categoría
  - Campo `padre_id` para crear jerarquías

#### **7. SERVICIOS**
**Funcionalidad:** Servicios que los proveedores publican
- **Qué hace:** Contenido principal de la plataforma
- **Casos de uso:**
  - Publicación de servicios con descripción detallada
  - Precio fijo o por hora
  - Geolocalización del servicio
  - Estado: activo/inactivo, destacado, verificado
  - Contador de vistas y favoritos
  - Calificación promedio automática (trigger)
  - Política de cancelación personalizada
  - Campo "incluye" y "no incluye" para claridad

#### **8. IMAGENES_SERVICIOS**
**Funcionalidad:** Galería de imágenes para cada servicio
- **Qué hace:** Múltiples fotos por servicio, una marcada como principal
- **Casos de uso:**
  - Portfolio visual del servicio
  - Imagen principal para listados
  - Miniaturas optimizadas
  - Orden personalizado de las imágenes
  - Pie de foto descriptivo

#### **9. DISPONIBILIDAD_SERVICIOS**
**Funcionalidad:** Horario semanal recurrente del servicio
- **Qué hace:** Define días y horas en que el servicio está disponible
- **Casos de uso:**
  - Lunes a Viernes 9:00-18:00
  - Sábados 10:00-14:00
  - Domingos cerrado
  - 7 registros por servicio (uno por día de la semana)
  - día_semana: 0=Domingo, 6=Sábado

#### **10. EXCEPCIONES_SERVICIOS**
**Funcionalidad:** Días específicos con horario diferente o cerrado
- **Qué hace:** Sobrescribe la disponibilidad regular para fechas puntuales
- **Casos de uso:**
  - Vacaciones: 24-31 diciembre cerrado
  - Horario especial: 25 diciembre 10:00-15:00
  - Eventos: disponible un domingo específico
  - Ausencias del proveedor

#### **11. PREGUNTAS_FRECUENTES_SERVICIOS**
**Funcionalidad:** FAQ personalizado por servicio
- **Qué hace:** Preguntas frecuentes con respuestas del proveedor
- **Casos de uso:**
  - "¿Traes tus propios materiales?" → "Sí, incluidos"
  - "¿Haces servicios en fines de semana?" → "Sí, con recargo"
  - Reduce consultas repetitivas
  - Mejora conversión de ventas
  - Orden personalizado

---

### 🟡 **MÓDULO DE VALORACIONES**

#### **12. RESENAS**
**Funcionalidad:** Sistema completo de reviews y ratings
- **Qué hace:** Calificaciones y comentarios después de usar un servicio
- **Casos de uso:**
  - Calificación 1-5 estrellas obligatoria
  - Comentario opcional con pros y contras
  - Reseñas anónimas opcionales
  - Proveedor puede responder a la reseña
  - Otros usuarios votan si la reseña es útil
  - Admin puede marcar reseñas destacadas
  - Actualiza automáticamente promedio del servicio y usuario (triggers)
  - Constraint: un usuario solo puede valorar un servicio una vez

---

### 🔴 **MÓDULO DE CHAT/MENSAJERÍA**

#### **13. CONVERSACIONES**
**Funcionalidad:** Canal de comunicación entre dos usuarios
- **Qué hace:** Agrupa todos los mensajes entre dos personas
- **Casos de uso:**
  - Conversación privada 1:1
  - Vinculada opcionalmente a un servicio específico
  - Contadores de mensajes no leídos separados para cada participante
  - Último mensaje visible para preview
  - Archivar conversación sin eliminarla
  - Estado separado de archivo para cada usuario
  - Constraint: unique por (participante1, participante2, servicio)

#### **14. MENSAJES**
**Funcionalidad:** Mensajes individuales dentro de una conversación
- **Qué hace:** Chat multimedia en tiempo real
- **Casos de uso:**
  - Texto simple
  - Imágenes con thumbnail
  - Archivos adjuntos
  - Ubicación compartida (lat/lon)
  - Audio/video
  - Reply a mensajes anteriores (conversación anidada)
  - Estados: leído/no leído con timestamp
  - Edición de mensajes con marcador
  - Eliminación lógica (soft delete)

---

###  **MÓDULO DE FAVORITOS Y PORTAFOLIO**

#### **16. FAVORITOS**
**Funcionalidad:** Lista de deseos / Guardados del usuario
- **Qué hace:** Usuarios marcan servicios favoritos
- **Casos de uso:**
  - "Guardar para después"
  - Lista de servicios de interés
  - Acceso rápido a servicios preferidos
  - Actualiza contador en tabla SERVICIOS (trigger)
  - Constraint: un usuario no puede marcar el mismo servicio dos veces

#### **17. PORTAFOLIOS**
**Funcionalidad:** Portfolio personal del proveedor
- **Qué hace:** Galería de trabajos anteriores del proveedor
- **Casos de uso:**
  - Mostrar ejemplos de trabajos realizados
  - Independiente de servicios activos
  - Orden personalizado
  - Destacar mejores trabajos
  - Agrupar por categoría
  - Aumenta confianza de potenciales clientes

---

### 🔵 **MÓDULO DE NOTIFICACIONES**

#### **18. NOTIFICACIONES**
**Funcionalidad:** Sistema de alertas push e in-app
- **Qué hace:** Notifica eventos importantes al usuario
- **Casos de uso:**
  - Nuevo mensaje recibido
  - Nueva reseña en tu servicio
  - Promoción activa
  - Alertas del sistema
  - Imagen opcional
  - Link de acción (deep linking)
  - Estado leído/no leído
  - Tracking de envío push
  - Tipos configurables: mensaje, valoracion, sistema, promocion

---

### ⚫ **MÓDULO DE REPORTES/MODERACIÓN**

#### **19. REPORTES**
**Funcionalidad:** Sistema de denuncias y moderación de contenido
- **Qué hace:** Usuarios reportan contenido inapropiado
- **Casos de uso:**
  - Reportar usuario (comportamiento)
  - Reportar servicio (fraude, spam)
  - Reportar reseña (falsa, inapropiada)
  - Reportar mensaje (acoso, spam)
  - Tipos: spam, inapropiado, fraude, acoso, perfil_falso, otro
  - Evidencia con URLs (capturas, fotos)
  - Workflow: pendiente → en_revisión → resuelto/descartado
  - Admin puede agregar notas
  - Trazabilidad de quién resolvió

#### **20. USUARIOS_BLOQUEADOS**
**Funcionalidad:** Bloqueo entre usuarios
- **Qué hace:** Un usuario bloquea a otro
- **Casos de uso:**
  - Evitar contacto de usuarios problemáticos
  - No aparecen en búsquedas mutuas
  - No pueden enviarse mensajes
  - Razón del bloqueo (opcional)
  - Constraint: un usuario no puede bloquearse a sí mismo

---

### 🟢 **MÓDULO DE BÚSQUEDA Y ETIQUETAS**

#### **21. HISTORIAL_BUSQUEDAS**
**Funcionalidad:** Analytics de búsquedas del usuario
- **Qué hace:** Registra cada búsqueda realizada
- **Casos de uso:**
  - Sugerencias personalizadas
  - "Búsquedas recientes"
  - Análisis de tendencias
  - Mejora de algoritmo de búsqueda
  - Geo-búsqueda con ubicación
  - Filtros aplicados en JSONB
  - Tracking de click-through (qué servicio seleccionó)

#### **22. ETIQUETAS**
**Funcionalidad:** Tags globales para clasificación
- **Qué hace:** Palabras clave para etiquetar servicios
- **Casos de uso:**
  - #urgente #24horas #profesional #economico
  - Búsqueda por etiquetas
  - Contador de uso (popularidad)
  - SEO-friendly con slug

#### **23. SERVICIOS_ETIQUETAS**
**Funcionalidad:** Relación muchos-a-muchos entre servicios y etiquetas
- **Qué hace:** Un servicio puede tener múltiples tags
- **Casos de uso:**
  - Servicio de "Limpieza profunda" → #urgente #profesional #garantia
  - Búsqueda multi-tag
  - Filtrado avanzado

---

### 🟡 **MÓDULO DE PROMOCIONES**

#### **24. CODIGOS_PROMOCIONALES**
**Funcionalidad:** Cupones de descuento
- **Qué hace:** Códigos promocionales para aplicar descuentos
- **Casos de uso:**
  - "VERANO2026" → 20% descuento
  - Descuento fijo (10€) o porcentaje (20%)
  - Límite de usos totales y por usuario
  - Monto mínimo de compra
  - Vigencia con fechas inicio/fin
  - Aplicable a categorías específicas
  - Aplicable a servicios específicos (array de IDs)
  - Admin puede desactivar

#### **25. USO_CODIGOS_PROMOCIONALES**
**Funcionalidad:** Registro de uso de códigos
- **Qué hace:** Cada vez que un usuario usa un código
- **Casos de uso:**
  - Prevenir uso excesivo
  - Auditoría de promociones
  - Calcular ROI de campañas
  - Estadísticas de adopción

---

### 🔴 **MÓDULO SOCIAL/SEGUIDORES**

#### **26. SEGUIDORES_USUARIOS**
**Funcionalidad:** Red social - sistema de follows
- **Qué hace:** Usuario A sigue a Usuario B
- **Casos de uso:**
  - Seguir proveedores favoritos
  - Notificaciones de nuevos servicios de usuarios seguidos
  - Feed personalizado
  - Contador de seguidores/seguidos
  - Constraint: no puedes seguirte a ti mismo
  - Unique: no puedes seguir dos veces a la misma persona

---

### ⚪ **MÓDULO DE ADMINISTRACIÓN**

#### **27. REGISTROS_AUDITORIA**
**Funcionalidad:** Logs de auditoría y trazabilidad
- **Qué hace:** Registra todas las acciones importantes
- **Casos de uso:**
  - Quién modificó qué y cuándo
  - Valores antes/después del cambio (JSONB)
  - IP y User-Agent para seguridad
  - Debugging de issues
  - Cumplimiento legal (GDPR, etc.)
  - Seguimiento de cambios críticos
  - Usuarios eliminados mantienen referencia

---

### 🔵 **VISTA MATERIALIZADA**

#### **28. SERVICIOS_CON_PROVEEDOR**
**Funcionalidad:** Vista optimizada para consultas frecuentes
- **Qué hace:** JOIN pre-calculado de servicios con datos del proveedor
- **Casos de uso:**
  - Listados de servicios más rápidos
  - Evitar múltiples JOINs en cada consulta
  - Incluye avatar, nombre, calificación del proveedor
  - Incluye nombre y slug de categoría
  - Filtra servicios eliminados automáticamente
  - Read-only (es una vista, no tabla)

---

## 🔗 Relaciones Clave del Sistema

### **Relaciones 1:N (Uno a Muchos)**
- 👤 Un USUARIO tiene muchas DIRECCIONES
- 👤 Un USUARIO publica muchos SERVICIOS
- 📝 Un SERVICIO tiene muchas IMAGENES
- 📝 Un SERVICIO tiene muchas RESEÑAS
- 💬 Una CONVERSACION tiene muchos MENSAJES

### **Relaciones N:M (Muchos a Muchos)**
- 📝 SERVICIOS ↔ ETIQUETAS (a través de SERVICIOS_ETIQUETAS)
- 👤 USUARIOS ↔ USUARIOS (SEGUIDORES_USUARIOS)

### **Relaciones de Auto-Referencia**
- 📁 CATEGORIAS → padre_id → CATEGORIAS (subcategorías)
- 💬 MENSAJES → respuesta_a_mensaje_id → MENSAJES (replies)

### **Triggers Automáticos Activos**
1. **actualizado_en** → Se actualiza automáticamente en cada UPDATE
2. **promedio_calificacion** → Recalcula cuando hay nueva reseña
3. **conteo_favoritos** → Incrementa/decrementa al añadir/quitar favorito

---

## 🎯 Flujos de Negocio Principales

### **Flujo 1: Publicar un Servicio**
1. Usuario crea registro en **SERVICIOS**
2. Sube imágenes a **IMAGENES_SERVICIOS**
3. Define disponibilidad en **DISPONIBILIDAD_SERVICIOS** (7 días)
4. Agrega FAQs en **PREGUNTAS_FRECUENTES_SERVICIOS**
5. Asigna tags en **SERVICIOS_ETIQUETAS**
6. Servicio aparece en búsquedas y en **SERVICIOS_CON_PROVEEDOR** (vista)

### **Flujo 2: Contratar un Servicio (Chat)**
1. Cliente encuentra servicio en búsqueda → Guarda en **HISTORIAL_BUSQUEDAS**
2. Inicia chat → Crea **CONVERSACION**
3. Intercambian **MENSAJES**
4. Acuerdan términos
5. Servicio se completa
6. Cliente deja **RESENA**
7. Trigger actualiza calificación en **SERVICIOS** y **USUARIOS**

### **Flujo 3: Sistema de Notificaciones**
1. Evento ocurre (nuevo mensaje, reseña)
2. Se crea registro en **NOTIFICACIONES**
3. Si usuario tiene `notificaciones_push=true` y `token_fcm` → enviar push
4. Aparece en bandeja de notificaciones in-app
5. Usuario hace click → marca `esta_leido=true` con timestamp

---

## 📊 Métricas y KPIs Disponibles

Con esta estructura puedes calcular:
- ✅ **Engagement:** Mensajes por conversación, tiempo de respuesta
- ✅ **Calidad:** Promedio de reseñas, % de usuarios verificados
- ✅ **Retención:** Usuarios activos, servicios por proveedor
- ✅ **Tendencias:** Búsquedas populares, etiquetas más usadas
- ✅ **Social:** Seguidores por usuario, favoritos por servicio
- ✅ **Promociones:** Tasa de uso de códigos

---

## 📋 Resumen de Tablas por Módulo

| Módulo | Tablas | Descripción |
|--------|--------|-------------|
| 👥 **Usuarios** | 5 | Gestión de usuarios, direcciones, verificaciones, insignias |
| 🛠️ **Servicios** | 6 | Catálogo de servicios, imágenes, horarios, FAQs |
| ⭐ **Valoraciones** | 1 | Sistema de reseñas y calificaciones |
| 💬 **Chat** | 2 | Mensajería en tiempo real |

| ❤️ **Favoritos** | 2 | Guardados y portfolio |
| 🔔 **Notificaciones** | 1 | Alertas push e in-app |
| 🛡️ **Moderación** | 2 | Reportes y bloqueos |
| 🔍 **Búsqueda** | 3 | Historial, tags y filtros |
| 🎁 **Promociones** | 2 | Cupones de descuento |
| 👥 **Social** | 1 | Sistema de seguidores |
| ⚙️ **Admin** | 1 | Auditoría |
| 📊 **Vistas** | 1 | Vista optimizada |
| **TOTAL** | **24 + 1 vista** | **Sistema completo** |
