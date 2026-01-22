import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConversacionUsuario, MensajeConRemitente, EnviarMensajeRequest } from '../interfaces';
import { StorageService } from './storage.service';

// Claves de caché
const CACHE_CONVERSACIONES = 'cache_conversaciones';
const CACHE_MENSAJES_PREFIX = 'cache_mensajes_';
const CACHE_CONVERSACION_PREFIX = 'cache_conv_';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  
  // BehaviorSubjects para notificar cambios en tiempo real
  private conversacionesSubject = new BehaviorSubject<ConversacionUsuario[]>([]);
  public conversaciones$ = this.conversacionesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    // Cargar conversaciones del caché al iniciar
    this.cargarConversacionesDelCache();
  }

  /**
   * Cargar conversaciones desde el caché local
   */
  private async cargarConversacionesDelCache(): Promise<void> {
    try {
      const cached = await this.storage.get(CACHE_CONVERSACIONES);
      if (cached) {
        const conversaciones = JSON.parse(cached);
        this.conversacionesSubject.next(conversaciones);
      }
    } catch (error) {
      console.warn('Error al cargar caché de conversaciones:', error);
    }
  }

  /**
   * Guardar conversaciones en caché local
   */
  private async guardarConversacionesEnCache(conversaciones: ConversacionUsuario[]): Promise<void> {
    try {
      await this.storage.set(CACHE_CONVERSACIONES, JSON.stringify(conversaciones));
    } catch (error) {
      console.warn('Error al guardar caché de conversaciones:', error);
    }
  }

  /**
   * Obtener mensajes desde el caché local
   */
  async obtenerMensajesDelCache(conversacionId: string): Promise<MensajeConRemitente[]> {
    try {
      const cached = await this.storage.get(CACHE_MENSAJES_PREFIX + conversacionId);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Error al cargar caché de mensajes:', error);
    }
    return [];
  }

  /**
   * Guardar mensajes en caché local
   */
  async guardarMensajesEnCache(conversacionId: string, mensajes: MensajeConRemitente[]): Promise<void> {
    try {
      // Solo guardar los últimos 100 mensajes para no ocupar mucho espacio
      const mensajesAGuardar = mensajes.slice(-100);
      await this.storage.set(CACHE_MENSAJES_PREFIX + conversacionId, JSON.stringify(mensajesAGuardar));
    } catch (error) {
      console.warn('Error al guardar caché de mensajes:', error);
    }
  }

  /**
   * Obtener conversación desde el caché local
   */
  async obtenerConversacionDelCache(id: string): Promise<ConversacionUsuario | null> {
    try {
      const cached = await this.storage.get(CACHE_CONVERSACION_PREFIX + id);
      if (cached) {
        return JSON.parse(cached);
      }
      // Buscar también en la lista de conversaciones cacheada
      const conversaciones = this.conversacionesSubject.getValue();
      return conversaciones.find(c => c.id === id) || null;
    } catch (error) {
      console.warn('Error al cargar caché de conversación:', error);
    }
    return null;
  }

  /**
   * Guardar conversación en caché local
   */
  private async guardarConversacionEnCache(conversacion: ConversacionUsuario): Promise<void> {
    try {
      await this.storage.set(CACHE_CONVERSACION_PREFIX + conversacion.id, JSON.stringify(conversacion));
    } catch (error) {
      console.warn('Error al guardar caché de conversación:', error);
    }
  }

  /**
   * Obtener conversaciones del caché (para uso inmediato)
   */
  getConversacionesCache(): ConversacionUsuario[] {
    return this.conversacionesSubject.getValue();
  }

  /**
   * Actualizar una conversación en el caché (para actualizaciones en tiempo real)
   */
  actualizarConversacionEnCache(conversacionActualizada: Partial<ConversacionUsuario> & { id: string }): void {
    const conversaciones = this.conversacionesSubject.getValue();
    const index = conversaciones.findIndex(c => c.id === conversacionActualizada.id);
    
    if (index !== -1) {
      conversaciones[index] = { ...conversaciones[index], ...conversacionActualizada };
      // Mover al inicio si tiene mensaje nuevo
      if (conversacionActualizada.ultimo_mensaje_en) {
        const [conv] = conversaciones.splice(index, 1);
        conversaciones.unshift(conv);
      }
      this.conversacionesSubject.next([...conversaciones]);
      this.guardarConversacionesEnCache(conversaciones);
    }
  }

  /**
   * Agregar mensaje al caché de una conversación
   */
  async agregarMensajeAlCache(conversacionId: string, mensaje: MensajeConRemitente): Promise<void> {
    const mensajes = await this.obtenerMensajesDelCache(conversacionId);
    // Verificar que no exista ya
    if (!mensajes.some(m => m.id === mensaje.id)) {
      mensajes.push(mensaje);
      await this.guardarMensajesEnCache(conversacionId, mensajes);
    }
  }

  /**
   * Obtener todas las conversaciones del usuario autenticado
   * El interceptor se encarga de agregar el token automáticamente
   */
  async obtenerConversaciones(): Promise<ConversacionUsuario[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/conversaciones`)
      );
      const conversaciones = response.data || [];
      
      // Actualizar caché y notificar
      this.conversacionesSubject.next(conversaciones);
      this.guardarConversacionesEnCache(conversaciones);
      
      return conversaciones;
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener una conversación específica
   */
  async obtenerConversacion(id: string): Promise<ConversacionUsuario> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/conversaciones/${id}`)
      );
      const conversacion = response.data;
      
      // Guardar en caché
      this.guardarConversacionEnCache(conversacion);
      
      return conversacion;
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      throw error;
    }
  }

  /**
   * Obtener o crear conversación con otro usuario
   */
  async obtenerOCrearConversacion(usuarioId: string, servicioId?: string): Promise<any> {
    try {
      const body: any = { usuario_id: usuarioId };
      if (servicioId) body.servicio_id = servicioId;

      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/conversaciones`, body)
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener/crear conversación:', error);
      throw error;
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async obtenerMensajes(conversacionId: string, limit: number = 50, offset: number = 0): Promise<MensajeConRemitente[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/conversaciones/${conversacionId}/mensajes?limit=${limit}&offset=${offset}`)
      );
      const mensajes = response.data || [];
      
      // Guardar en caché
      this.guardarMensajesEnCache(conversacionId, mensajes);
      
      return mensajes;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      throw error;
    }
  }

  /**
   * Enviar un mensaje
   */
  async enviarMensaje(datos: EnviarMensajeRequest): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/mensajes`, datos)
      );
      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarComoLeido(conversacionId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put<any>(`${this.apiUrl}/conversaciones/${conversacionId}/leer`, {})
      );
    } catch (error) {
      console.error('Error al marcar como leído:', error);
      throw error;
    }
  }

  /**
   * Eliminar un mensaje
   */
  async eliminarMensaje(mensajeId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<any>(`${this.apiUrl}/mensajes/${mensajeId}`)
      );
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      throw error;
    }
  }

  /**
   * Archivar una conversación
   */
  async archivarConversacion(conversacionId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put<any>(`${this.apiUrl}/conversaciones/${conversacionId}/archivar`, {})
      );
    } catch (error) {
      console.error('Error al archivar conversación:', error);
      throw error;
    }
  }

  /**
   * Limpiar todo el caché de chat (llamar al cerrar sesión)
   */
  async limpiarCache(): Promise<void> {
    try {
      // Limpiar conversaciones
      await this.storage.remove(CACHE_CONVERSACIONES);
      this.conversacionesSubject.next([]);
      
      // Nota: Los mensajes de conversaciones individuales se limpiarán
      // automáticamente cuando expiren o cuando el usuario vuelva a entrar
      console.log('Caché de chat limpiado');
    } catch (error) {
      console.warn('Error al limpiar caché de chat:', error);
    }
  }
}
