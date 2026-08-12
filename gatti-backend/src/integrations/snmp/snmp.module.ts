import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { SnmpController } from './controllers/snmp.controller';
import { SnmpService } from './services/snmp.service';

@Module({
  imports: [PrismaModule],
  controllers: [SnmpController],
  providers: [SnmpService],
  exports: [SnmpService],
})
export class SnmpModule {}

// Estilo: módulo pequeno e orientado a caso de uso, isolando o transporte SNMP do domínio de impressoras.
