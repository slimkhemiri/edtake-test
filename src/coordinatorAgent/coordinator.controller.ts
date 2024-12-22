import { Controller, Get, Query } from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';

@Controller('invoke')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {};
  @Get()
  async handleUserQuery(@Query('query') query: string): Promise<string> {
    try {
      if (!query) {
        throw new Error('La requête est requise.');
      };
      return await this.coordinatorService.handleUserQuery(query);
    } catch (error) {
      throw new Error('Erreur lors du traitement de la requête :' + error);
    };
  };
};
