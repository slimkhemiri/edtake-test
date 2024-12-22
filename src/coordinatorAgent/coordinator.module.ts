import { Module } from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';
import { CoordinatorController } from './coordinator.controller';
import { CartService } from '../cartAgent/cart.service';
import { TavilyService } from '../tavilyAgent/tavily.service';

@Module({
  controllers: [CoordinatorController],
  providers: [CoordinatorService, CartService, TavilyService],
})
export class CoordinatorModule {}
