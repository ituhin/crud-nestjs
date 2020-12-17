import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
// import { ServicesEntity } from './services.entity';
import { ServicesRepository } from './services.repository';

@Module({
  providers: [ServicesService],
  controllers: [ServicesController],
  imports: [TypeOrmModule.forFeature([ServicesRepository])],
  // exports: [ServicesService],
})
export class ServicesModule {}
