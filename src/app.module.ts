import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './modules/services/services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { getDbConfig } from './config/db'

@Module({
  imports: [TypeOrmModule.forRoot({
    "type": "mysql",
    "host": getDbConfig().host,
    "port": getDbConfig().port,
    "username": getDbConfig().username,
    "password": getDbConfig().password,
    "database": getDbConfig().database,
    "synchronize": getDbConfig().synchronize,
    "logging": getDbConfig().logging,
    "entities": getDbConfig().entities,
    "migrations": getDbConfig().migrations,
    "keepConnectionAlive": true
  }), ServicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // constructor(private connection: Connection) {}
}
