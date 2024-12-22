import { Module } from '@nestjs/common';
import { TavilyService } from './tavily.service';

@Module({
  providers: [TavilyService],
})
export class TavilyModule {}
