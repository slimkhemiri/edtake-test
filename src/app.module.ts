import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoordinatorModule } from './coordinatorAgent/coordinator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoordinatorModule,
  ]
})
export class AppModule {}
