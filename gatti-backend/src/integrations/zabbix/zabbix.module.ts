import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { ZabbixService } from './services/zabbix.service';
import { ZabbixController } from './controllers/zabbix.controller';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [ZabbixController],
  providers: [ZabbixService],
  exports: [ZabbixService],
})
export class ZabbixModule {}
