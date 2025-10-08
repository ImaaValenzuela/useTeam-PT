import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { KanbanGateway } from './kanban.gateway';
import { Card, CardSchema } from './schemas/card.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
  ],
  controllers: [KanbanController],
  providers: [KanbanService, KanbanGateway],
  exports: [KanbanService], // Exportar para uso en otros módulos
})
export class KanbanModule {}