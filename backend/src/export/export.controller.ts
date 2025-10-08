
import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    BadRequestException,
    Get,
  } from '@nestjs/common';
  import { ExportService } from './export.service';
  import { IsEmail, IsNotEmpty } from 'class-validator';
  
  class ExportBacklogDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
  }
  
  @Controller('export')
  export class ExportController {
    constructor(private readonly exportService: ExportService) {}
  
    @Post('backlog')
    @HttpCode(HttpStatus.OK)
    async exportBacklog(@Body() exportDto: ExportBacklogDto) {
      try {
        const result = await this.exportService.triggerExport(exportDto.email);
        return result;
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
    @Get('health')
    async checkHealth() {
      const isHealthy = await this.exportService.checkN8NHealth();
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        n8n: isHealthy ? 'connected' : 'disconnected',
      };
    }
}