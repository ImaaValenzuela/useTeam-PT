
import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { KanbanModule } from '../kanban/kanban.module';

@Module({
  imports: [KanbanModule], // Importar KanbanModule para acceder a KanbanService
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}