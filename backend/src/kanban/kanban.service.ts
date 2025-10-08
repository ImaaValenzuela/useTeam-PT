import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from './schemas/card.schema';
import { CreateCardDto, MoveCardDto, UpdateCardDto } from './dto/create-card.dto';

@Injectable()
export class KanbanService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
  ) {}

  /**
   * Obtener todas las tarjetas ordenadas por posición
   */
  async findAll(): Promise<CardDocument[]> {
    return this.cardModel
      .find()
      .sort({ column: 1, position: 1 })
      .exec();
  }

  /**
   * Obtener una tarjeta por ID
   */
  async findOne(id: string): Promise<CardDocument> {
    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    return card;
  }

  /**
   * Crear una nueva tarjeta
   * Si no se especifica posición, se coloca al final de la columna
   */
  async create(createCardDto: CreateCardDto): Promise<CardDocument> {
    // Si no se especifica posición, obtener la última posición de la columna
    if (createCardDto.position === undefined) {
      const cardsInColumn = await this.cardModel
        .find({ column: createCardDto.column })
        .sort({ position: -1 })
        .limit(1)
        .exec();
      
      createCardDto.position = cardsInColumn.length > 0 
        ? cardsInColumn[0].position + 1 
        : 0;
    }

    const createdCard = new this.cardModel(createCardDto);
    return createdCard.save();
  }

  /**
   * Mover una tarjeta a otra columna/posición
   * Implementa lógica de reordenamiento para mantener consistencia
   */
  async moveCard(id: string, moveCardDto: MoveCardDto): Promise<CardDocument> {
    const card = await this.findOne(id);
    const oldColumn = card.column;
    const oldPosition = card.position;
    const { column: newColumn, position: newPosition } = moveCardDto;

    // Caso 1: Mover dentro de la misma columna
    if (oldColumn === newColumn) {
      if (oldPosition === newPosition) {
        return card; // No hay cambio
      }

      // Reordenar tarjetas en la misma columna
      if (oldPosition < newPosition) {
        // Mover hacia abajo: decrementar posiciones intermedias
        await this.cardModel.updateMany(
          {
            column: oldColumn,
            position: { $gt: oldPosition, $lte: newPosition },
          },
          { $inc: { position: -1 } },
        );
      } else {
        // Mover hacia arriba: incrementar posiciones intermedias
        await this.cardModel.updateMany(
          {
            column: oldColumn,
            position: { $gte: newPosition, $lt: oldPosition },
          },
          { $inc: { position: 1 } },
        );
      }
    } else {
      // Caso 2: Mover a otra columna
      
      // Decrementar posiciones en la columna origen
      await this.cardModel.updateMany(
        {
          column: oldColumn,
          position: { $gt: oldPosition },
        },
        { $inc: { position: -1 } },
      );

      // Incrementar posiciones en la columna destino
      await this.cardModel.updateMany(
        {
          column: newColumn,
          position: { $gte: newPosition },
        },
        { $inc: { position: 1 } },
      );
    }

    // Actualizar la tarjeta movida
    card.column = newColumn;
    card.position = newPosition;
    return card.save();
  }

  /**
   * Actualizar una tarjeta
   */
  async update(id: string, updateCardDto: UpdateCardDto): Promise<CardDocument> {
    const card = await this.cardModel
      .findByIdAndUpdate(id, updateCardDto, { new: true })
      .exec();
    
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    
    return card;
  }

  /**
   * Eliminar una tarjeta y reordenar la columna
   */
  async delete(id: string): Promise<CardDocument> {
    const card = await this.findOne(id);
    
    // Decrementar posiciones de tarjetas posteriores en la misma columna
    await this.cardModel.updateMany(
      {
        column: card.column,
        position: { $gt: card.position },
      },
      { $inc: { position: -1 } },
    );

    return this.cardModel.findByIdAndDelete(id).exec();
  }

  /**
   * Exportar todas las tarjetas en formato para CSV
   */
  async exportBacklog(): Promise<any[]> {
    const cards = await this.findAll();
    
    return cards.map((card) => ({
      id: card._id.toString(),
      title: card.title,
      description: card.description,
      column: card.column,
      createdAt: card.createdAt,
    }));
  }
}