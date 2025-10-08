import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { KanbanService } from './kanban.service';
  import { CreateCardDto, MoveCardDto, UpdateCardDto } from './dto/create-card.dto';
  import { InjectConnection } from '@nestjs/mongoose';
  import { Connection } from 'mongoose';
  
  @Controller('kanban')
  export class KanbanController {
    constructor(
      private readonly kanbanService: KanbanService,
      @InjectConnection() private connection: Connection,
    ) {}
  
    /**
     * GET /api/kanban/cards
     * Obtener todas las tarjetas del tablero
     */
    @Get('cards')
    async findAll() {
      return this.kanbanService.findAll();
    }
  
    /**
     * GET /api/kanban/cards/:id
     * Obtener una tarjeta específica por ID
     */
    @Get('cards/:id')
    async findOne(@Param('id') id: string) {
      return this.kanbanService.findOne(id);
    }
  
    /**
     * POST /api/kanban/cards
     * Crear una nueva tarjeta
     */
    @Post('cards')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createCardDto: CreateCardDto) {
      return this.kanbanService.create(createCardDto);
    }
  
    /**
     * PATCH /api/kanban/cards/:id/move
     * Mover una tarjeta a otra columna/posición
     */
    @Patch('cards/:id/move')
    async moveCard(@Param('id') id: string, @Body() moveCardDto: MoveCardDto) {
      return this.kanbanService.moveCard(id, moveCardDto);
    }
  
    /**
     * PATCH /api/kanban/cards/:id
     * Actualizar los datos de una tarjeta
     */
    @Patch('cards/:id')
    async update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
      return this.kanbanService.update(id, updateCardDto);
    }
  
    /**
     * DELETE /api/kanban/cards/:id
     * Eliminar una tarjeta
     */
    @Delete('cards/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
      await this.kanbanService.delete(id);
    }

    /**
     * GET /api/kanban/diagnostic
     * Endpoint de diagnóstico para verificar la conexión a MongoDB
     */
    @Get('diagnostic')
    async diagnostic() {
      const dbState = this.connection.readyState;
      const dbName = this.connection.db?.databaseName;
      
      // Obtener estadísticas de la colección
      const stats = await this.connection.db?.stats();
      const cardCount = await this.kanbanService.findAll().then(cards => cards.length);
      
      return {
        mongodb: {
          connected: dbState === 1,
          readyState: dbState,
          databaseName: dbName,
          stats: {
            collections: stats?.collections || 0,
            dataSize: stats?.dataSize || 0,
            indexSize: stats?.indexSize || 0,
          }
        },
        cards: {
          total: cardCount,
          message: cardCount > 0 ? 'Se encontraron tarjetas en la base de datos' : 'No hay tarjetas guardadas aún'
        },
        timestamp: new Date().toISOString()
      };
    }

    /**
     * GET /api/kanban/debug
     * Endpoint para mostrar todas las tarjetas con detalles completos
     */
    @Get('debug')
    async debug() {
      const cards = await this.kanbanService.findAll();
      
      return {
        message: 'Todas las tarjetas guardadas en MongoDB',
        total: cards.length,
        cards: cards.map(card => ({
          id: card._id,
          title: card.title,
          description: card.description,
          column: card.column,
          position: card.position,
          boardId: card.boardId,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
        })),
        timestamp: new Date().toISOString()
      };
    }
  }