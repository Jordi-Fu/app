import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConversacionUsuario, MensajeConRemitente, EnviarMensajeRequest } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  
  // BehaviorSubject para notificar cambios en tiempo real (solo en memoria)
  private conversacionesSubject = new BehaviorSubject<ConversacionUsuario[]>([]);
  public conversaciones$ = this.conversacionesSubject.asObservable();
  
  // Observable para el total de mensajes no leídos
  public totalNoLeidos$ = this.conversaciones$.pipe(
    map(conversaciones => conversaciones.reduce((total, conv) => total + (conv.no_leidos || 0), 0))
  );

  constructor(private http: HttpClient) {}

  /**
   * Obtener conversaciones en memoria (para uso inmediato)
   */
  getConversacionesCache(): ConversacionUsuario[] {
    return this.conversacionesSubject.getValue();
  }

  /**
   * Actualizar una conversación en memoria (para actualizaciones en tiempo real)
   */
  actualizarConversacionEnMemoria(conversacionActualizada: Partial<ConversacionUsuario> & { id: string }): void {
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
    }
  }

  /**
   * Resetear contador de mensajes no leídos de una conversación
   */
  resetearContadorNoLeidos(conversacionId: string): void {
    const conversaciones = this.conversacionesSubject.getValue();
    const index = conversaciones.findIndex(c => c.id === conversacionId);
    
    if (index !== -1 && conversaciones[index].no_leidos > 0) {
      conversaciones[index] = { ...conversaciones[index], no_leidos: 0 };
      this.conversacionesSubject.next([...conversaciones]);
    }
  }

  /**
   * Incrementar contador de no leídos y actualizar conversación (para eventos de socket)
   */
  incrementarNoLeidos(conversacionId: string, ultimoMensaje: string, ultimoMensajeEn: string): void {
    const conversaciones = this.conversacionesSubject.getValue();
    const index = conversaciones.findIndex(c => c.id === conversacionId);
    
    if (index !== -1) {
      const conv = conversaciones[index];
      const conversacionActualizada = {
        ...conv,
        texto_ultimo_mensaje: ultimoMensaje,
        ultimo_mensaje_en: ultimoMensajeEn,
        no_leidos: (conv.no_leidos || 0) + 1
      };
      
      const nuevasConversaciones = [
        conversacionActualizada,
        ...conversaciones.filter((_, i) => i !== index)
      ];
      
      this.conversacionesSubject.next(nuevasConversaciones);
    }
  }

  /**
   * Obtener todas las conversaciones del usuario autenticado
   */
  async obtenerConversaciones(): Promise<ConversacionUsuario[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/conversaciones`)
      );
      const conversaciones = response.data || [];
      
      // Solo actualizar en memoria si hay conversaciones o si es la primera vez
      const currentConversaciones = this.conversacionesSubject.getValue();
      if (conversaciones.length > 0 || currentConversaciones.length === 0) {
        this.conversacionesSubject.next(conversaciones);
      }
      
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
      return response.data;
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
      return response.data || [];
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
      // Primero actualizar en memoria para respuesta inmediata en la UI
      this.resetearContadorNoLeidos(conversacionId);
      
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
   * Limpiar conversaciones en memoria (llamar al cerrar sesión)
   */
  limpiarMemoria(): void {
    this.conversacionesSubject.next([]);
  }
}

