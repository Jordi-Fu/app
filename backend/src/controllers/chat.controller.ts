import { Request, Response } from 'express';
import { chatService } from '../services';

/**
 * Controlador de Chat
 * Maneja las peticiones HTTP relacionadas con conversaciones y mensajes
 */
class ChatController {
  
  /**
   * Obtener todas las conversaciones del usuario autenticado
   */
  async obtenerConversaciones(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      

      
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const conversaciones = await chatService.obtenerConversaciones(userId);
      
      
      res.status(200).json({
        success: true,
        data: conversaciones
      });
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener conversaciones' 
      });
    }
  }

  /**
   * Obtener una conversación específica
   */
  async obtenerConversacion(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const conversacion = await chatService.obtenerConversacion(id, userId);
      
      if (!conversacion) {
        res.status(404).json({ 
          success: false,
          error: 'Conversación no encontrada' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: conversacion
      });
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener conversación' 
      });
    }
  }

  /**
   * Obtener o crear conversación con otro usuario
   */
  async obtenerOCrearConversacion(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { usuario_id, servicio_id } = req.body;
      
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      if (!usuario_id) {
        res.status(400).json({ 
          success: false,
          error: 'Se requiere usuario_id' 
        });
        return;
      }

      const conversacion = await chatService.obtenerOCrearConversacion(userId, usuario_id, servicio_id);
      
      res.status(200).json({
        success: true,
        data: conversacion
      });
    } catch (error) {
      console.error('Error al obtener/crear conversación:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener/crear conversación' 
      });
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async obtenerMensajes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const mensajes = await chatService.obtenerMensajes(id, userId, limit, offset);
      
      res.status(200).json({
        success: true,
        data: mensajes
      });
    } catch (error: any) {
      console.error('Error al obtener mensajes:', error);
      res.status(error.message.includes('no encontrada') ? 404 : 500).json({ 
        success: false,
        error: error.message || 'Error al obtener mensajes' 
      });
    }
  }

  /**
   * Enviar un mensaje
   */
  async enviarMensaje(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const datos = req.body;
      
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      if (!datos.contenido && !datos.url_media) {
        res.status(400).json({ 
          success: false,
          error: 'Se requiere contenido o url_media' 
        });
        return;
      }

      // Obtener información del remitente del token JWT
      const remitenteInfo = {
        nombre: (req.user as any)?.firstName || 'Usuario',
        apellido: (req.user as any)?.lastName || '',
        usuario: (req.user as any)?.username || '',
        url_avatar: (req.user as any)?.avatarUrl
      };

      const mensaje = await chatService.enviarMensaje(userId, datos, remitenteInfo);
      
      res.status(201).json({
        success: true,
        data: mensaje
      });
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      res.status(error.message.includes('no encontrada') ? 404 : 500).json({ 
        success: false,
        error: error.message || 'Error al enviar mensaje' 
      });
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarComoLeido(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      await chatService.marcarComoLeido(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Mensajes marcados como leídos'
      });
    } catch (error: any) {
      console.error('Error al marcar como leído:', error);
      res.status(error.message.includes('no encontrada') ? 404 : 500).json({ 
        success: false,
        error: error.message || 'Error al marcar como leído' 
      });
    }
  }

  /**
   * Eliminar un mensaje
   */
  async eliminarMensaje(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const eliminado = await chatService.eliminarMensaje(id, userId);
      
      if (!eliminado) {
        res.status(404).json({ 
          success: false,
          error: 'Mensaje no encontrado o no tienes permiso' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Mensaje eliminado'
      });
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al eliminar mensaje' 
      });
    }
  }

  /**
   * Archivar una conversación
   */
  async archivarConversacion(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const archivado = await chatService.archivarConversacion(id, userId);
      
      if (!archivado) {
        res.status(404).json({ 
          success: false,
          error: 'Conversación no encontrada' 
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Conversación archivada'
      });
    } catch (error) {
      console.error('Error al archivar conversación:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al archivar conversación' 
      });
    }
  }
}

export const chatController = new ChatController();
