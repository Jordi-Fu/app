import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConversacionUsuario, MensajeConRemitente, EnviarMensajeRequest } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las conversaciones del usuario autenticado
   * El interceptor se encarga de agregar el token automáticamente
   */
  async obtenerConversaciones(): Promise<ConversacionUsuario[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/conversaciones`)
      );
      return response.data || [];
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
}
