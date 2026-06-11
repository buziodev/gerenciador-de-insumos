import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PrintersModule } from '@modules/printers/printers.module';
import { SuppliesModule } from '@modules/supplies/supplies.module';
import { StockModule } from '@modules/stock/stock.module';
import { AlertsModule } from '@modules/alerts/alerts.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { ZabbixModule } from '@integrations/zabbix/zabbix.module';
import { HealthModule } from '@modules/health/health.module';
import { UsersModule } from '@modules/users/users.module';
import { SectorsModule } from '@modules/sectors/sectors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SectorsModule,
    PrintersModule,
    SuppliesModule,
    StockModule,
    AlertsModule,
    ReportsModule,
    ZabbixModule,
    HealthModule,
  ],
})
export class AppModule {}
