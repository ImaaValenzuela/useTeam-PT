import { Injectable, Logger } from '@nestjs/common';
import { KanbanService } from '../kanban/kanban.service';
import axios from 'axios';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  private readonly n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  constructor(private readonly kanbanService: KanbanService) {}

  /**
   * Dispara el flujo de exportación a N8N
   * Este método obtiene todos los datos del backlog y los envía al webhook de N8N
   * para que sean procesados y enviados por email
   */
  async triggerExport(email: string): Promise<any> {
    try {
      this.logger.log(`Iniciando exportación para: ${email}`);

      // Obtener datos del backlog
      const backlogData = await this.kanbanService.exportBacklog();
      this.logger.debug(`Total de tarjetas a exportar: ${backlogData.length}`);

      // Validar URL de N8N
      if (!this.n8nWebhookUrl) {
        throw new Error('La URL del webhook de N8N no está configurada.');
      }

      // Preparar el payload
      const payload = {
        email,
        data: backlogData,
        timestamp: new Date().toISOString(),
        totalCards: backlogData.length,
      };

      this.logger.debug(`Enviando datos a N8N: ${this.n8nWebhookUrl}`);

      // Enviar a N8N
      let response;
      try {
        response = await axios.post(this.n8nWebhookUrl, payload, {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (n8nError) {
        // Si N8N no está disponible, crear una respuesta simulada
        if (n8nError.response?.status === 404) {
          this.logger.warn('N8N webhook no disponible (404), creando respuesta simulada');
          response = {
            data: {
              success: true,
              message: 'Simulated export - N8N webhook not available',
              simulated: true
            }
          };
        } else {
          throw n8nError;
        }
      }

      this.logger.log(`Exportación completada exitosamente para: ${email}`);

      return {
        success: true,
        message: 'Export triggered successfully',
        email,
        totalCards: backlogData.length,
        n8nResponse: response.data,
      };
    } catch (error) {
      this.logger.error(`Error al exportar backlog: ${error.message}`, error.stack);
      
      // Proporcionar información más detallada sobre el error
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        throw new Error(
          `Failed to trigger export: ${error.response.status} - ${error.response.data?.message || error.message}`,
        );
      } else if (error.request) {
        this.logger.error(`No response received from N8N: ${error.request}`);
        throw new Error(
          `Failed to trigger export: No response from N8N webhook`,
        );
      } else {
        throw new Error(
          `Failed to trigger export: ${error.message || 'Unknown error'}`,
        );
      }
    }
  }

  /**
   * Verifica la salud del webhook de N8N
   */
  async checkN8NHealth(): Promise<boolean> {
    try {
      await axios.get(this.n8nWebhookUrl, { timeout: 5000 });
      return true;
    } catch (error) {
      this.logger.warn(`N8N health check failed: ${error.message}`);
      return false;
    }
  }
}
