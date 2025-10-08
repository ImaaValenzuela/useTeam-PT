import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  
  /**
   * Gateway de WebSocket para sincronización en tiempo real
   * Maneja eventos de creación, movimiento, actualización y eliminación de tarjetas
   */
  @WebSocketGateway({
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:3006',
        'http://localhost:3007',
        'http://localhost:3008',
        'http://localhost:3009',
        'http://localhost:3010'
      ],
      credentials: true,
    },
  })
  export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private logger: Logger = new Logger('KanbanGateway');
    private connectedClients: Set<string> = new Set();
  
    /**
     * Evento disparado cuando un cliente se conecta
     */
    handleConnection(client: Socket) {
      this.connectedClients.add(client.id);
      this.logger.log(`Cliente conectado: ${client.id} (Total: ${this.connectedClients.size})`);
      
      // Notificar a todos los clientes sobre el número de usuarios conectados
      this.server.emit('users:count', this.connectedClients.size);
    }
  
    /**
     * Evento disparado cuando un cliente se desconecta
     */
    handleDisconnect(client: Socket) {
      this.connectedClients.delete(client.id);
      this.logger.log(`Cliente desconectado: ${client.id} (Total: ${this.connectedClients.size})`);
      
      // Notificar a todos los clientes sobre el número de usuarios conectados
      this.server.emit('users:count', this.connectedClients.size);
    }
  
    /**
     * Evento: Nueva tarjeta creada
     * Broadcast a todos los demás clientes
     */
    @SubscribeMessage('card:created')
    handleCardCreated(
      @MessageBody() data: any,
      @ConnectedSocket() client: Socket,
    ) {
      this.logger.debug(`Tarjeta creada: ${data.title} por ${client.id}`);
      
      // Emitir a todos EXCEPTO al emisor original
      client.broadcast.emit('card:created', data);
    }
  
    /**
     * Evento: Tarjeta movida a otra columna/posición
     * Broadcast a todos los demás clientes
     */
    @SubscribeMessage('card:moved')
    handleCardMoved(
      @MessageBody() data: any,
      @ConnectedSocket() client: Socket,
    ) {
      this.logger.debug(`Tarjeta movida: ${data._id} a ${data.column}:${data.position}`);
      
      // Emitir a todos EXCEPTO al emisor original
      client.broadcast.emit('card:moved', data);
    }
  
    /**
     * Evento: Tarjeta actualizada (título, descripción, etc.)
     * Broadcast a todos los demás clientes
     */
    @SubscribeMessage('card:updated')
    handleCardUpdated(
      @MessageBody() data: any,
      @ConnectedSocket() client: Socket,
    ) {
      this.logger.debug(`Tarjeta actualizada: ${data._id}`);
      
      // Emitir a todos EXCEPTO al emisor original
      client.broadcast.emit('card:updated', data);
    }
  
    /**
     * Evento: Tarjeta eliminada
     * Broadcast a todos los demás clientes
     */
    @SubscribeMessage('card:deleted')
    handleCardDeleted(
      @MessageBody() data: { id: string },
      @ConnectedSocket() client: Socket,
    ) {
      this.logger.debug(`Tarjeta eliminada: ${data.id}`);
      
      // Emitir a todos EXCEPTO al emisor original
      client.broadcast.emit('card:deleted', data);
    }
  
    /**
     * Evento: Usuario está escribiendo en una tarjeta
     * Para mostrar indicadores de "typing" en tiempo real
     */
    @SubscribeMessage('card:typing')
    handleCardTyping(
      @MessageBody() data: { cardId: string; username: string },
      @ConnectedSocket() client: Socket,
    ) {
      // Emitir a todos EXCEPTO al emisor
      client.broadcast.emit('card:typing', data);
    }
  
    /**
     * Método auxiliar para emitir notificaciones globales
     */
    emitNotification(message: string, type: 'info' | 'success' | 'error' = 'info') {
      this.server.emit('notification', { message, type, timestamp: new Date() });
    }
  
    /**
     * Método auxiliar para obtener el número de clientes conectados
     */
    getConnectedClientsCount(): number {
      return this.connectedClients.size;
    }
  }