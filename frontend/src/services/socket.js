import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

class SocketService {
  socket = null;
  isConnected = false;
  isConnecting = false;

  /**
   * Conectar al servidor WebSocket
   */
  connect() {
    // Evitar conexiones múltiples (incluye estado "conectando")
    if (this.socket || this.isConnected || this.isConnecting) {
      if (this.socket && this.socket.connected && !this.isConnected) {
        this.isConnected = true;
      }
      console.log('Conexión WebSocket ya inicializada');
      return;
    }

    this.isConnecting = true;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: false,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
      this.isConnected = true;
      this.isConnecting = false;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
      this.isConnected = false;
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
      this.isConnecting = false;
    });
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect() {
    if (this.socket) {
      try {
        // Remover todos los listeners para evitar duplicados en futuros mounts
        this.socket.removeAllListeners && this.socket.removeAllListeners();
      } catch (e) {
        // noop
      }
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

  /**
   * Emitir un evento al servidor
   */
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`No se puede emitir ${event}: Socket no conectado`);
    }
  }

  /**
   * Escuchar un evento del servidor
   */
  on(event, callback) {
    if (this.socket) {
      // Evitar listeners duplicados para el mismo callback
      this.socket.off(event, callback);
      this.socket.on(event, callback);
    }
  }

  /**
   * Remover un listener de evento
   */
  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  /**
   * Verificar si está conectado
   */
  isSocketConnected() {
    return this.isConnected;
  }
}

// Exportar una instancia singleton
export default new SocketService();