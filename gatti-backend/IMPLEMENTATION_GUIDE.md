# GATTI Backend - Guia de Implementação

## 📋 Resumo Executivo

Este documento fornece um guia passo a passo para completar a implementação do backend GATTI, incluindo a resolução de problemas, testes e deployment.

## ✅ Status Atual

### Implementado (37 arquivos TypeScript)
- ✅ Arquitetura completa (Clean Architecture + DDD)
- ✅ Autenticação JWT com RBAC
- ✅ 7 módulos principais
- ✅ Schema Prisma com 20+ modelos
- ✅ Integração Zabbix
- ✅ Documentação (README + ARCHITECTURE)
- ✅ Configuração Docker
- ✅ ESLint e Prettier

### Pendente
- ⏳ Instalar dependências faltantes (axios, terminus, bcrypt)
- ⏳ Executar migrações Prisma
- ⏳ Implementar jobs com BullMQ
- ⏳ Implementar cálculos de consumo
- ⏳ Implementar geração de relatórios (PDF/Excel)
- ⏳ Testes unitários e E2E
- ⏳ Seed de dados iniciais

## 🔧 Resolução de Problemas

### Problema: Erro de Conexão NPM

**Sintoma**: `EAI_AGAIN registry.npmjs.org`

**Solução**:
```bash
# Aguardar conexão de rede se em ambiente restrito
# Ou usar npm cache
npm install --prefer-offline --no-audit

# Ou instalar manualmente cada pacote
npm install bcrypt
npm install @nestjs/axios
npm install @nestjs/terminus
```

### Problema: Porta 3000 em Uso

**Sintoma**: `EADDRINUSE: address already in use :::3000`

**Solução**:
```bash
# Usar porta diferente
PORT=3001 npm run start:dev

# Ou matar processo existente
lsof -i :3000
kill -9 <PID>
```

### Problema: Erro de Conexão PostgreSQL

**Sintoma**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solução**:
```bash
# Iniciar Docker Compose
docker-compose up -d

# Verificar se está rodando
docker ps | grep postgres

# Ver logs
docker logs gatti-postgres
```

## 🚀 Guia de Setup Completo

### Passo 1: Instalar Dependências

```bash
cd /home/ubuntu/gatti-backend

# Instalar dependências principais
npm install

# Instalar dependências faltantes (quando rede permitir)
npm install bcrypt @nestjs/axios @nestjs/terminus --save
```

### Passo 2: Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar .env com suas configurações
# Principais variáveis:
# - DATABASE_URL
# - JWT_SECRET
# - ZABBIX_API_URL
# - ZABBIX_API_USER
# - ZABBIX_API_PASSWORD
```

### Passo 3: Iniciar Serviços

```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d

# Verificar se estão rodando
docker ps

# Aguardar que estejam prontos (health check)
docker-compose ps
```

### Passo 4: Executar Migrações

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# (Opcional) Visualizar banco
npm run prisma:studio
```

### Passo 5: Criar Usuário Admin

```bash
# Criar seed (dados iniciais)
# Editar prisma/seed.ts com dados de admin

npm run prisma:seed
```

### Passo 6: Iniciar Servidor

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### Passo 7: Testar API

```bash
# Health check
curl http://localhost:3000/health

# Swagger
open http://localhost:3000/api/v1/docs

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gatti.com","password":"password123"}'
```

## 📝 Próximas Implementações

### 1. Seed de Dados Iniciais

Criar arquivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@gatti.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'GATTI',
      role: 'ADMIN',
    },
  });

  console.log('Admin criado:', admin);

  // Criar setor
  const sector = await prisma.sector.create({
    data: {
      name: 'Administrativo',
      description: 'Setor administrativo',
      manager: 'Admin GATTI',
    },
  });

  console.log('Setor criado:', sector);

  // Criar suprimento
  const supply = await prisma.supply.create({
    data: {
      name: 'Toner Preto HP 85A',
      type: 'TONER',
      manufacturer: 'HP',
      model: 'CE285A',
      nominalCapacity: 1600,
      unitCost: 85.50,
    },
  });

  console.log('Suprimento criado:', supply);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Adicionar ao `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

### 2. Implementar Cálculos de Consumo

Criar arquivo `src/modules/analytics/services/consumption.service.ts`:

```typescript
@Injectable()
export class ConsumptionService {
  constructor(private prisma: PrismaService) {}

  async calculateConsumption(printerId: string) {
    const tonerLevels = await this.prisma.tonerLevel.findMany({
      where: { printerId },
      orderBy: { recordedAt: 'asc' },
      take: 2,
    });

    if (tonerLevels.length < 2) return null;

    const [previous, current] = tonerLevels;
    const consumedPercentage = previous.percentageLevel - current.percentageLevel;
    
    const metrics = await this.prisma.printerMetric.findMany({
      where: {
        printerId,
        recordedAt: {
          gte: previous.recordedAt,
          lte: current.recordedAt,
        },
      },
    });

    const pagesProduced = metrics.length > 0 
      ? metrics[metrics.length - 1].pageCount - metrics[0].pageCount
      : 0;

    const pagesPerPercent = consumedPercentage > 0 
      ? pagesProduced / consumedPercentage
      : 0;

    return {
      pagesProduced,
      consumedPercentage,
      pagesPerPercent,
      recordedAt: new Date(),
    };
  }

  async detectTonerChange(printerId: string) {
    const levels = await this.prisma.tonerLevel.findMany({
      where: { printerId },
      orderBy: { recordedAt: 'desc' },
      take: 2,
    });

    if (levels.length < 2) return null;

    const [current, previous] = levels;
    
    // Detectar se houve troca (aumento significativo)
    if (current.percentageLevel > previous.percentageLevel + 50) {
      return {
        printerId,
        color: current.color,
        previousLevel: previous.percentageLevel,
        newLevel: current.percentageLevel,
        detectedAt: new Date(),
      };
    }

    return null;
  }
}
```

### 3. Implementar Jobs com BullMQ

Criar arquivo `src/jobs/sync-printers.job.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ZabbixService } from '@integrations/zabbix/services/zabbix.service';

@Injectable()
export class SyncPrintersJob {
  constructor(private zabbixService: ZabbixService) {}

  @Cron('0 */5 * * * *') // A cada 5 minutos
  async syncPrinters() {
    try {
      await this.zabbixService.syncPrinters();
    } catch (error) {
      console.error('Erro ao sincronizar impressoras:', error);
    }
  }

  @Cron('0 * * * * *') // A cada minuto
  async syncMetrics() {
    try {
      await this.zabbixService.syncMetrics();
    } catch (error) {
      console.error('Erro ao sincronizar métricas:', error);
    }
  }
}
```

### 4. Implementar Geração de Relatórios

Criar arquivo `src/modules/reports/services/pdf-generator.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';

@Injectable()
export class PdfGeneratorService {
  async generateConsumptionReport(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Adicionar conteúdo
      doc.fontSize(20).text('Relatório de Consumo', 100, 100);
      doc.fontSize(12).text(`Período: ${data.startDate} a ${data.endDate}`, 100, 150);
      
      // Adicionar tabela, gráficos, etc.
      
      doc.end();
    });
  }
}
```

### 5. Implementar Testes

Criar arquivo `src/modules/printers/services/printers.service.spec.ts`:

```typescript
describe('PrintersService', () => {
  let service: PrintersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
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

    service = module.get(PrintersService);
    prisma = module.get(PrismaService);
  });

  it('deve listar impressoras', async () => {
    const mockPrinters = [
      { id: '1', name: 'Printer 1' },
    ];

    jest.spyOn(prisma.printer, 'findMany').mockResolvedValue(mockPrinters);

    const result = await service.findAll({ skip: 0, take: 10 });

    expect(result.data).toEqual(mockPrinters);
  });
});
```

## 📚 Recursos Adicionais

### Documentação NestJS
- https://docs.nestjs.com
- https://docs.nestjs.com/security/authentication
- https://docs.nestjs.com/techniques/database

### Documentação Prisma
- https://www.prisma.io/docs
- https://www.prisma.io/docs/reference/api-reference/prisma-client-reference

### Documentação Zabbix API
- https://www.zabbix.com/documentation/current/en/api

## 🎯 Checklist de Implementação

- [ ] Instalar dependências faltantes
- [ ] Executar migrações Prisma
- [ ] Criar seed de dados iniciais
- [ ] Testar autenticação
- [ ] Implementar cálculos de consumo
- [ ] Implementar detecção de troca de toner
- [ ] Implementar jobs de sincronização
- [ ] Implementar geração de relatórios
- [ ] Implementar alertas automáticos
- [ ] Escrever testes unitários
- [ ] Escrever testes E2E
- [ ] Configurar CI/CD
- [ ] Deploy em staging
- [ ] Deploy em produção

## 📞 Suporte

Para dúvidas ou problemas, consulte:
1. README.md - Documentação geral
2. ARCHITECTURE.md - Arquitetura detalhada
3. Swagger UI - Documentação da API
4. Logs da aplicação - Diagnóstico

---

**Versão**: 1.0.0  
**Última atualização**: Junho 2024
