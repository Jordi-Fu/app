import { Router } from 'express';
import { chatController } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/chat/conversaciones
 * @desc Obtener todas las conversaciones del usuario
 * @access Privado
 */
router.get('/conversaciones', authMiddleware, chatController.obtenerConversaciones.bind(chatController));

/**
 * @route GET /api/chat/conversaciones/:id
 * @desc Obtener una conversación específica
 * @access Privado
 */
router.get('/conversaciones/:id', authMiddleware, chatController.obtenerConversacion.bind(chatController));

/**
 * @route POST /api/chat/conversaciones
 * @desc Obtener o crear conversación con otro usuario
 * @access Privado
 */
router.post('/conversaciones', authMiddleware, chatController.obtenerOCrearConversacion.bind(chatController));

/**
 * @route GET /api/chat/conversaciones/:id/mensajes
 * @desc Obtener mensajes de una conversación
 * @access Privado
 */
router.get('/conversaciones/:id/mensajes', authMiddleware, chatController.obtenerMensajes.bind(chatController));

/**
 * @route POST /api/chat/mensajes
 * @desc Enviar un mensaje
 * @access Privado
 */
router.post('/mensajes', authMiddleware, chatController.enviarMensaje.bind(chatController));

/**
 * @route PUT /api/chat/conversaciones/:id/leer
 * @desc Marcar mensajes como leídos
 * @access Privado
 */
router.put('/conversaciones/:id/leer', authMiddleware, chatController.marcarComoLeido.bind(chatController));

/**
 * @route DELETE /api/chat/mensajes/:id
 * @desc Eliminar un mensaje
 * @access Privado
 */
router.delete('/mensajes/:id', authMiddleware, chatController.eliminarMensaje.bind(chatController));

/**
 * @route PUT /api/chat/conversaciones/:id/archivar
 * @desc Archivar una conversación
 * @access Privado
 */
router.put('/conversaciones/:id/archivar', authMiddleware, chatController.archivarConversacion.bind(chatController));

export default router;
