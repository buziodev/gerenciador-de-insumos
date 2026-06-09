# GATTI Backend - Checklist de Implementação MVP

## 📋 Resumo Executivo

Este documento detalha **exatamente o que falta** para ter um MVP funcional, com código pronto para copiar e colar.

**Tempo Total Estimado:** 6-7 horas  
**Complexidade:** Média  
**Dependências:** Nenhuma bloqueante

---

## 1️⃣ Instalar Dependências Faltantes (15 min)

### Status: ⏳ PENDENTE

### Dependências Necessárias

```bash
npm install bcrypt @nestjs/axios @nestjs/terminus @nestjs/schedule
npm install -D @types/bcrypt
```

### Por que cada uma?

| Pacote | Versão | Motivo |
|--------|--------|--------|
| **bcrypt** | ^5.1.0 | Criptografia de senhas |
| **@nestjs/axios** | ^3.0.0 | Requisições HTTP para Zabbix |
| **@nestjs/terminus** | ^10.0.0 | Health checks |
| **@nestjs/schedule** | ^4.0.0 | Jobs agendados |
| **@types/bcrypt** | ^5.0.0 | Tipos TypeScript |

### Verificação

```bash
npm list bcrypt @nestjs/axios @nestjs/terminus @nestjs/schedule
```

---

## 2️⃣ Implementar Seed de Dados Iniciais (30 min)

### Status: ⏳ PENDENTE

### Arquivo: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de dados...');

  // 1. Criar usuários
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gatti.com' },
    update: {},
    create: {
      email: 'admin@gatti.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'GATTI',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin criado:', admin.email);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@gatti.com' },
    update: {},
    create: {
      email: 'manager@gatti.com',
      password: await bcrypt.hash('manager123', 10),
      firstName: 'Manager',
      lastName: 'GATTI',
      role: 'MANAGER',
      isActive: true,
    },
  });
  console.log('✅ Manager criado:', manager.email);

  // 2. Criar setor
  const sector = await prisma.sector.upsert({
    where: { name: 'Administrativo' },
    update: {},
    create: {
      name: 'Administrativo',
      description: 'Setor administrativo',
      manager: 'Admin GATTI',
    },
  });
  console.log('✅ Setor criado:', sector.name);

  // 3. Criar suprimentos
  const supplies = [
    {
      name: 'Toner Preto HP 85A',
      type: 'TONER',
      manufacturer: 'HP',
      model: 'CE285A',
      nominalCapacity: 1600,
      unitCost: 85.50,
    },
    {
      name: 'Toner Ciano HP 305A',
      type: 'TONER',
      manufacturer: 'HP',
      model: 'CE411A',
      nominalCapacity: 2600,
      unitCost: 95.00,
    },
    {
      name: 'Cilindro HP 126A',
      type: 'CYLINDER',
      manufacturer: 'HP',
      model: 'CE314A',
      nominalCapacity: 14000,
      unitCost: 150.00,
    },
  ];

  for (const supply of supplies) {
    const created = await prisma.supply.upsert({
      where: { model: supply.model },
      update: {},
      create: supply,
    });
    console.log('✅ Suprimento criado:', created.name);
  }

  // 4. Criar impressoras
  const printers = [
    {
      name: 'Impressora Sala 101',
      hostname: 'printer-101.empresa.com',
      ipAddress: '192.168.1.100',
      model: 'HP LaserJet Pro M404n',
      manufacturer: 'HP',
      serialNumber: 'SN123456789',
      group: 'Administrativo',
      status: 'ONLINE',
      sectorId: sector.id,
    },
    {
      name: 'Impressora Sala 102',
      hostname: 'printer-102.empresa.com',
      ipAddress: '192.168.1.101',
      model: 'HP LaserJet Pro M404n',
      manufacturer: 'HP',
      serialNumber: 'SN987654321',
      group: 'Administrativo',
      status: 'ONLINE',
      sectorId: sector.id,
    },
  ];

  for (const printer of printers) {
    const created = await prisma.printer.upsert({
      where: { hostname: printer.hostname },
      update: {},
      create: printer,
    });
    console.log('✅ Impressora criada:', created.name);
  }

  // 5. Criar estoque para suprimentos
  for (const supply of supplies) {
    const dbSupply = await prisma.supply.findUnique({
      where: { model: supply.model },
    });

    await prisma.stock.upsert({
      where: { supplyId: dbSupply.id },
      update: {},
      create: {
        supplyId: dbSupply.id,
        quantity: 50,
        minimumLevel: 10,
        maximumLevel: 100,
      },
    });
    console.log('✅ Estoque criado para:', supply.name);
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Atualizar `package.json`

Adicione na raiz do objeto JSON:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Executar

```bash
npm install -D ts-node
npx prisma db seed
```

---

## 3️⃣ Implementar Cálculos de Consumo (1h)

### Status: ⏳ PENDENTE

### Arquivo: `src/modules/analytics/services/consumption.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class ConsumptionService {
  private readonly logger = new Logger(ConsumptionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcular consumo de toner entre dois períodos
   */
  async calculateConsumption(printerId: string) {
    try {
      // Obter últimos 2 níveis de toner
      const tonerLevels = await this.prisma.tonerLevel.findMany({
        where: { printerId },
        orderBy: { recordedAt: 'desc' },
        take: 2,
      });

      if (tonerLevels.length < 2) {
        this.logger.warn(`Dados insuficientes para calcular consumo: ${printerId}`);
        return null;
      }

      const [current, previous] = tonerLevels;
      const consumedPercentage = previous.percentageLevel - current.percentageLevel;

      // Obter métricas de página nesse período
      const metrics = await this.prisma.printerMetric.findMany({
        where: {
          printerId,
          recordedAt: {
            gte: current.recordedAt,
            lte: previous.recordedAt,
          },
        },
        orderBy: { recordedAt: 'asc' },
      });

      const pagesProduced = metrics.length > 0
        ? metrics[metrics.length - 1].pageCount - metrics[0].pageCount
        : 0;

      const pagesPerPercent = consumedPercentage > 0
        ? pagesProduced / consumedPercentage
        : 0;

      const consumption = {
        printerId,
        pagesProduced,
        consumedPercentage,
        pagesPerPercent,
        recordedAt: new Date(),
      };

      // Salvar no banco
      await this.prisma.consumptionHistory.create({
        data: consumption,
      });

      this.logger.log(`Consumo calculado: ${pagesProduced} páginas`);
      return consumption;
    } catch (error) {
      this.logger.error('Erro ao calcular consumo:', error);
      throw error;
    }
  }

  /**
   * Detectar automaticamente troca de toner
   */
  async detectTonerChange(printerId: string) {
    try {
      const levels = await this.prisma.tonerLevel.findMany({
        where: { printerId },
        orderBy: { recordedAt: 'desc' },
        take: 2,
      });

      if (levels.length < 2) return null;

      const [current, previous] = levels;

      // Se houve aumento significativo (>50%), é troca
      if (current.percentageLevel > previous.percentageLevel + 50) {
        const tonerChange = {
          printerId,
          color: current.color,
          previousLevel: previous.percentageLevel,
          newLevel: current.percentageLevel,
          detectedAt: new Date(),
        };

        await this.prisma.tonerChange.create({
          data: tonerChange,
        });

        this.logger.log(`Troca de toner detectada: ${current.color}`);
        return tonerChange;
      }

      return null;
    } catch (error) {
      this.logger.error('Erro ao detectar troca de toner:', error);
      throw error;
    }
  }

  /**
   * Calcular consumo médio diário
   */
  async calculateDailyAverage(printerId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const consumptions = await this.prisma.consumptionHistory.findMany({
      where: {
        printerId,
        recordedAt: { gte: startDate },
      },
    });

    if (consumptions.length === 0) return null;

    const totalPages = consumptions.reduce((sum, c) => sum + c.pagesProduced, 0);
    const averageDaily = totalPages / days;

    return {
      printerId,
      period: days,
      totalPages,
      averageDaily,
      calculatedAt: new Date(),
    };
  }
}
```

### Arquivo: `src/modules/analytics/analytics.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { ConsumptionService } from './services/consumption.service';

@Module({
  imports: [PrismaModule],
  providers: [ConsumptionService],
  exports: [ConsumptionService],
})
export class AnalyticsModule {}
```

### Usar no Service de Impressoras

```typescript
// Em src/modules/printers/services/printers.service.ts

import { AnalyticsModule } from '@modules/analytics/analytics.module';

@Injectable()
export class PrintersService {
  constructor(
    private prisma: PrismaService,
    private consumptionService: ConsumptionService,
  ) {}

  async getMetrics(printerId: string) {
    const consumption = await this.consumptionService.calculateConsumption(printerId);
    const average = await this.consumptionService.calculateDailyAverage(printerId);
    
    return {
      consumption,
      average,
    };
  }
}
```

---

## 4️⃣ Implementar Jobs de Sincronização (1h)

### Status: ⏳ PENDENTE

### Arquivo: `src/jobs/sync-printers.job.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ZabbixService } from '@integrations/zabbix/services/zabbix.service';
import { ConsumptionService } from '@modules/analytics/services/consumption.service';
import { AlertsService } from '@modules/alerts/services/alerts.service';

@Injectable()
export class SyncPrintersJob {
  private readonly logger = new Logger(SyncPrintersJob.name);

  constructor(
    private zabbixService: ZabbixService,
    private consumptionService: ConsumptionService,
    private alertsService: AlertsService,
  ) {}

  /**
   * Sincronizar impressoras a cada 5 minutos
   */
  @Cron('0 */5 * * * *')
  async syncPrinters() {
    try {
      this.logger.log('🔄 Iniciando sincronização de impressoras...');
      await this.zabbixService.syncPrinters();
      this.logger.log('✅ Sincronização de impressoras concluída');
    } catch (error) {
      this.logger.error('❌ Erro ao sincronizar impressoras:', error);
    }
  }

  /**
   * Sincronizar métricas a cada 1 minuto
   */
  @Cron('0 * * * * *')
  async syncMetrics() {
    try {
      this.logger.log('📊 Sincronizando métricas...');
      await this.zabbixService.syncMetrics();
      this.logger.log('✅ Métricas sincronizadas');
    } catch (error) {
      this.logger.error('❌ Erro ao sincronizar métricas:', error);
    }
  }

  /**
   * Calcular consumo a cada 10 minutos
   */
  @Cron('0 */10 * * * *')
  async calculateConsumption() {
    try {
      this.logger.log('📈 Calculando consumo...');
      
      const printers = await this.prisma.printer.findMany({
        where: { isActive: true },
      });

      for (const printer of printers) {
        await this.consumptionService.calculateConsumption(printer.id);
        await this.consumptionService.detectTonerChange(printer.id);
      }

      this.logger.log('✅ Consumo calculado');
    } catch (error) {
      this.logger.error('❌ Erro ao calcular consumo:', error);
    }
  }

  /**
   * Detectar alertas a cada 5 minutos
   */
  @Cron('0 */5 * * * *')
  async detectAlerts() {
    try {
      this.logger.log('🚨 Detectando alertas...');
      await this.alertsService.detectCriticalLevels();
      await this.alertsService.detectOfflinePrinters();
      this.logger.log('✅ Alertas detectados');
    } catch (error) {
      this.logger.error('❌ Erro ao detectar alertas:', error);
    }
  }
}
```

### Arquivo: `src/jobs/jobs.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ZabbixModule } from '@integrations/zabbix/zabbix.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { AlertsModule } from '@modules/alerts/alerts.module';
import { SyncPrintersJob } from './sync-printers.job';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ZabbixModule,
    AnalyticsModule,
    AlertsModule,
  ],
  providers: [SyncPrintersJob],
})
export class JobsModule {}
```

### Adicionar ao `app.module.ts`

```typescript
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    // ... outros módulos
    JobsModule,
  ],
})
export class AppModule {}
```

---

## 5️⃣ Implementar Geração de Relatórios Básicos (1.5h)

### Status: ⏳ PENDENTE

### Arquivo: `src/modules/reports/services/report-generator.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import * as json2csv from 'json2csv';

@Injectable()
export class ReportGeneratorService {
  private readonly logger = new Logger(ReportGeneratorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Gerar relatório de consumo em CSV
   */
  async generateConsumptionReport(startDate: Date, endDate: Date) {
    try {
      const consumptions = await this.prisma.consumptionHistory.findMany({
        where: {
          recordedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          printer: {
            select: {
              name: true,
              model: true,
            },
          },
        },
      });

      const data = consumptions.map((c) => ({
        printer: c.printer.name,
        model: c.printer.model,
        pagesProduced: c.pagesProduced,
        consumedPercentage: c.consumedPercentage,
        pagesPerPercent: c.pagesPerPercent,
        date: c.recordedAt.toISOString().split('T')[0],
      }));

      const csv = json2csv.parse(data);
      return csv;
    } catch (error) {
      this.logger.error('Erro ao gerar relatório de consumo:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de custos
   */
  async generateCostsReport(startDate: Date, endDate: Date) {
    try {
      const movements = await this.prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          type: 'EXIT',
        },
        include: {
          supply: {
            select: {
              name: true,
              unitCost: true,
            },
          },
        },
      });

      const costs = movements.map((m) => ({
        supply: m.supply.name,
        quantity: m.quantity,
        unitCost: m.supply.unitCost,
        totalCost: m.quantity * m.supply.unitCost,
        date: m.createdAt.toISOString().split('T')[0],
      }));

      const totalCost = costs.reduce((sum, c) => sum + c.totalCost, 0);

      return {
        costs,
        totalCost,
        period: { startDate, endDate },
      };
    } catch (error) {
      this.logger.error('Erro ao gerar relatório de custos:', error);
      throw error;
    }
  }

  /**
   * Gerar inventário de estoque
   */
  async generateInventoryReport() {
    try {
      const stocks = await this.prisma.stock.findMany({
        include: {
          supply: {
            select: {
              name: true,
              type: true,
              manufacturer: true,
              unitCost: true,
            },
          },
        },
      });

      const inventory = stocks.map((s) => ({
        supply: s.supply.name,
        type: s.supply.type,
        manufacturer: s.supply.manufacturer,
        quantity: s.quantity,
        minimumLevel: s.minimumLevel,
        maximumLevel: s.maximumLevel,
        value: s.quantity * s.supply.unitCost,
        status: s.quantity < s.minimumLevel ? 'CRÍTICO' : 'OK',
      }));

      const totalValue = inventory.reduce((sum, i) => sum + i.value, 0);
      const criticalItems = inventory.filter((i) => i.status === 'CRÍTICO').length;

      return {
        inventory,
        totalValue,
        criticalItems,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Erro ao gerar inventário:', error);
      throw error;
    }
  }
}
```

### Atualizar `src/modules/reports/services/reports.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ReportGeneratorService } from './report-generator.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private reportGenerator: ReportGeneratorService,
  ) {}

  async generateReport(generateReportDto: GenerateReportDto) {
    const { type, startDate, endDate } = generateReportDto;

    let content: any;

    switch (type) {
      case 'CONSUMPTION':
        content = await this.reportGenerator.generateConsumptionReport(
          new Date(startDate),
          new Date(endDate),
        );
        break;
      case 'COSTS':
        content = await this.reportGenerator.generateCostsReport(
          new Date(startDate),
          new Date(endDate),
        );
        break;
      case 'INVENTORY':
        content = await this.reportGenerator.generateInventoryReport();
        break;
      default:
        throw new Error('Tipo de relatório inválido');
    }

    const report = await this.prisma.report.create({
      data: {
        type,
        title: generateReportDto.title,
        content: JSON.stringify(content),
        generatedBy: generateReportDto.generatedBy,
      },
    });

    return report;
  }
}
```

---

## 6️⃣ Implementar Alertas Automáticos (1h)

### Status: ⏳ PENDENTE

### Arquivo: `src/modules/alerts/services/alerts.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Detectar níveis críticos de estoque
   */
  async detectCriticalLevels() {
    try {
      const criticalStocks = await this.prisma.stock.findMany({
        where: {
          quantity: {
            lte: this.prisma.stock.fields.minimumLevel,
          },
        },
        include: {
          supply: {
            select: {
              name: true,
            },
          },
        },
      });

      for (const stock of criticalStocks) {
        const existingAlert = await this.prisma.alert.findFirst({
          where: {
            supplyId: stock.supplyId,
            type: 'LOW_STOCK',
            isActive: true,
          },
        });

        if (!existingAlert) {
          await this.prisma.alert.create({
            data: {
              type: 'LOW_STOCK',
              severity: 'CRITICAL',
              title: `Estoque crítico: ${stock.supply.name}`,
              description: `Quantidade: ${stock.quantity}/${stock.minimumLevel}`,
              supplyId: stock.supplyId,
              isActive: true,
            },
          });

          this.logger.warn(`Alerta crítico: ${stock.supply.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao detectar níveis críticos:', error);
    }
  }

  /**
   * Detectar impressoras offline
   */
  async detectOfflinePrinters() {
    try {
      const offlinePrinters = await this.prisma.printer.findMany({
        where: {
          status: 'OFFLINE',
        },
      });

      for (const printer of offlinePrinters) {
        const existingAlert = await this.prisma.alert.findFirst({
          where: {
            printerId: printer.id,
            type: 'OFFLINE',
            isActive: true,
          },
        });

        if (!existingAlert) {
          await this.prisma.alert.create({
            data: {
              type: 'OFFLINE',
              severity: 'WARNING',
              title: `Impressora offline: ${printer.name}`,
              description: `${printer.name} não está respondendo`,
              printerId: printer.id,
              isActive: true,
            },
          });

          this.logger.warn(`Alerta: ${printer.name} offline`);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao detectar impressoras offline:', error);
    }
  }

  /**
   * Detectar consumo anormal
   */
  async detectAbnormalConsumption() {
    try {
      const averages = await this.prisma.consumptionHistory.groupBy({
        by: ['printerId'],
        _avg: {
          pagesProduced: true,
        },
      });

      for (const avg of averages) {
        const recent = await this.prisma.consumptionHistory.findFirst({
          where: { printerId: avg.printerId },
          orderBy: { recordedAt: 'desc' },
        });

        if (
          recent &&
          avg._avg.pagesProduced &&
          recent.pagesProduced > avg._avg.pagesProduced * 2
        ) {
          await this.prisma.alert.create({
            data: {
              type: 'ABNORMAL_CONSUMPTION',
              severity: 'INFO',
              title: `Consumo anormal detectado`,
              description: `${recent.pagesProduced} páginas (média: ${Math.round(avg._avg.pagesProduced)})`,
              printerId: avg.printerId,
              isActive: true,
            },
          });

          this.logger.log(`Alerta: Consumo anormal na impressora ${avg.printerId}`);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao detectar consumo anormal:', error);
    }
  }

  /**
   * Reconhecer alerta
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        acknowledgedBy,
        acknowledgedAt: new Date(),
      },
    });
  }

  /**
   * Resolver alerta
   */
  async resolveAlert(alertId: string) {
    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        isActive: false,
        resolvedAt: new Date(),
      },
    });
  }
}
```

---

## 7️⃣ Testes Básicos (1h)

### Status: ⏳ PENDENTE

### Arquivo: `src/modules/printers/services/printers.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrintersService } from './printers.service';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

describe('PrintersService', () => {
  let service: PrintersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrintersService,
        {
          provide: PrismaService,
          useValue: {
            printer: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PrintersService>(PrintersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista de impressoras', async () => {
      const mockPrinters = [
        {
          id: '1',
          name: 'Printer 1',
          hostname: 'printer-1.com',
          ipAddress: '192.168.1.1',
          status: 'ONLINE',
        },
      ];

      jest.spyOn(prisma.printer, 'findMany').mockResolvedValue(mockPrinters);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result.data).toEqual(mockPrinters);
      expect(prisma.printer.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('deve criar uma nova impressora', async () => {
      const createDto = {
        name: 'New Printer',
        hostname: 'new-printer.com',
        ipAddress: '192.168.1.2',
        model: 'HP LaserJet',
        manufacturer: 'HP',
        group: 'Admin',
      };

      const mockCreated = { id: '2', ...createDto, status: 'ONLINE' };

      jest.spyOn(prisma.printer, 'create').mockResolvedValue(mockCreated);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreated);
      expect(prisma.printer.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createDto),
      });
    });
  });
});
```

### Arquivo: `src/modules/auth/services/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deve retornar tokens válidos', async () => {
      const mockUser = {
        id: '1',
        email: 'test@gatti.com',
        password: 'hashed_password',
        role: 'ADMIN',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.login('test@gatti.com', 'password');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
```

---

## 📊 Resumo de Implementação

| Item | Tempo | Complexidade | Prioridade |
|------|-------|--------------|-----------|
| Instalar dependências | 15 min | Baixa | 🔴 Crítica |
| Seed de dados | 30 min | Baixa | 🔴 Crítica |
| Cálculos de consumo | 1h | Média | 🟡 Alta |
| Jobs de sincronização | 1h | Média | 🟡 Alta |
| Geração de relatórios | 1.5h | Média | 🟡 Alta |
| Alertas automáticos | 1h | Média | 🟡 Alta |
| Testes básicos | 1h | Média | 🟢 Normal |
| **TOTAL** | **6-7h** | - | - |

---

## ✅ Checklist Final

- [ ] Dependências instaladas
- [ ] Seed de dados criado e executado
- [ ] Cálculos de consumo implementados
- [ ] Jobs de sincronização rodando
- [ ] Geração de relatórios funcionando
- [ ] Alertas automáticos detectando
- [ ] Testes passando
- [ ] Swagger UI atualizado
- [ ] Documentação atualizada
- [ ] MVP pronto para testes

---

**Versão:** 1.0.0  
**Última atualização:** Junho 2024  
**Status:** 📋 Pronto para Implementação
