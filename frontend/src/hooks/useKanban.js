import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para manejar el estado y la lógica del tablero Kanban
 * Incluye sincronización en tiempo real mediante WebSockets
 */
export const useKanban = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState(1);

  /**
   * Cargar tarjetas desde el servidor
   */
  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/kanban/cards');
      setCards(response.data);
    } catch (error) {
      console.error('Error al cargar tarjetas:', error);
      toast.error('Error al cargar el tablero');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handlers para eventos de WebSocket (tiempo real)
   */
  
  // Cuando otro usuario crea una tarjeta
  const handleCardCreated = useCallback((newCard) => {
    console.log('Tarjeta creada por otro usuario:', newCard);
    setCards((prevCards) => [...prevCards, newCard]);
    toast.info(`Nueva tarjeta: ${newCard.title}`, { autoClose: 2000 });
  }, []);

  // Cuando otro usuario mueve una tarjeta
  const handleCardMoved = useCallback((movedCard) => {
    console.log('Tarjeta movida por otro usuario:', movedCard);
    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === movedCard._id ? movedCard : card
      )
    );
  }, []);

  // Cuando otro usuario actualiza una tarjeta
  const handleCardUpdated = useCallback((updatedCard) => {
    console.log('Tarjeta actualizada por otro usuario:', updatedCard);
    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === updatedCard._id ? updatedCard : card
      )
    );
    toast.info(`Tarjeta actualizada: ${updatedCard.title}`, { autoClose: 2000 });
  }, []);

  // Cuando otro usuario elimina una tarjeta
  const handleCardDeleted = useCallback((data) => {
    console.log('Tarjeta eliminada por otro usuario:', data.id);
    setCards((prevCards) => prevCards.filter((card) => card._id !== data.id));
    toast.info('Una tarjeta fue eliminada', { autoClose: 2000 });
  }, []);

  // Actualizar contador de usuarios conectados
  const handleUsersCount = useCallback((count) => {
    setConnectedUsers(count);
  }, []);

  /**
   * Efecto principal: Conectar WebSocket y cargar datos iniciales
   */
  useEffect(() => {
    // Conectar WebSocket
    socketService.connect();

    // Cargar tarjetas iniciales
    loadCards();

    // Registrar listeners de eventos
    socketService.on('card:created', handleCardCreated);
    socketService.on('card:moved', handleCardMoved);
    socketService.on('card:updated', handleCardUpdated);
    socketService.on('card:deleted', handleCardDeleted);
    socketService.on('users:count', handleUsersCount);

    // Cleanup: Remover listeners y desconectar
    return () => {
      socketService.off('card:created', handleCardCreated);
      socketService.off('card:moved', handleCardMoved);
      socketService.off('card:updated', handleCardUpdated);
      socketService.off('card:deleted', handleCardDeleted);
      socketService.off('users:count', handleUsersCount);
      socketService.disconnect();
    };
  }, [loadCards, handleCardCreated, handleCardMoved, handleCardUpdated, handleCardDeleted, handleUsersCount]);

  /**
   * API Methods: Acciones del usuario local
   */

  // Crear una nueva tarjeta
  const createCard = async (cardData) => {
    try {
      const response = await api.post('/kanban/cards', cardData);
      const newCard = response.data;
      
      // Actualizar estado local inmediatamente
      setCards((prevCards) => [...prevCards, newCard]);
      
      // Notificar a otros usuarios vía WebSocket
      socketService.emit('card:created', newCard);
      
      toast.success('Tarjeta creada');
      return newCard;
    } catch (error) {
      console.error('Error al crear tarjeta:', error);
      toast.error('Error al crear la tarjeta');
      throw error;
    }
  };

  // Mover una tarjeta (drag & drop)
  const moveCard = async (cardId, column, position) => {
    try {
      const response = await api.patch(`/kanban/cards/${cardId}/move`, {
        column,
        position,
      });
      const movedCard = response.data;
      
      // Actualizar estado local inmediatamente (optimistic update)
      setCards((prevCards) =>
        prevCards.map((card) =>
          card._id === cardId ? movedCard : card
        )
      );
      
      // Notificar a otros usuarios vía WebSocket
      socketService.emit('card:moved', movedCard);
      
      return movedCard;
    } catch (error) {
      console.error('Error al mover tarjeta:', error);
      toast.error('Error al mover la tarjeta');
      // Recargar tarjetas en caso de error
      loadCards();
      throw error;
    }
  };

  // Actualizar una tarjeta
  const updateCard = async (cardId, updateData) => {
    try {
      const response = await api.patch(`/kanban/cards/${cardId}`, updateData);
      const updatedCard = response.data;
      
      // Actualizar estado local
      setCards((prevCards) =>
        prevCards.map((card) =>
          card._id === cardId ? updatedCard : card
        )
      );
      
      // Notificar a otros usuarios
      socketService.emit('card:updated', updatedCard);
      
      toast.success('Tarjeta actualizada');
      return updatedCard;
    } catch (error) {
      console.error('Error al actualizar tarjeta:', error);
      toast.error('Error al actualizar la tarjeta');
      throw error;
    }
  };

  // Eliminar una tarjeta
  const deleteCard = async (cardId) => {
    try {
      await api.delete(`/kanban/cards/${cardId}`);
      
      // Actualizar estado local
      setCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
      
      // Notificar a otros usuarios
      socketService.emit('card:deleted', { id: cardId });
      
      toast.success('Tarjeta eliminada');
    } catch (error) {
      console.error('Error al eliminar tarjeta:', error);
      toast.error('Error al eliminar la tarjeta');
      throw error;
    }
  };

  return {
    cards,
    loading,
    connectedUsers,
    createCard,
    moveCard,
    updateCard,
    deleteCard,
    reloadCards: loadCards,
  };
};