# GATTI Backend - Documentação de Arquitetura

## 📐 Visão Geral da Arquitetura

O GATTI Backend foi projetado seguindo princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **SOLID Principles** para garantir escalabilidade, manutenibilidade e testabilidade.

## 🏗️ Camadas Arquiteturais

### 1. **Presentation Layer (Controllers)**
Responsável por:
- Receber requisições HTTP
- Validar entrada (DTOs)
- Chamar services
- Retornar respostas formatadas

```typescript
@Controller('printers')
export class PrintersController {
  constructor(private printersService: PrintersService) {}
  
  @Get()
  async findAll(@Query() query: ListPrintersQueryDto) {
    return this.printersService.findAll(query);
  }
}
```

### 2. **Application Layer (Services)**
Responsável por:
- Lógica de negócio
- Orquestração de operações
- Chamadas a repositories
- Tratamento de erros

```typescript
@Injectable()
export class PrintersService {
  constructor(private prisma: PrismaService) {}
  
  async findAll(query: ListPrintersQueryDto) {
    // Lógica de negócio aqui
  }
}
```

### 3. **Domain Layer**
Responsável por:
- Entidades de domínio
- Regras de negócio críticas
- Value Objects
- Domain Events (futuro)

### 4. **Infrastructure Layer**
Responsável por:
- Acesso a banco de dados (Prisma)
- Integrações externas (Zabbix)
- Cache (Redis)
- Filas (BullMQ)

```typescript
@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }
}
```

## 📦 Estrutura de Módulos

### Módulo de Autenticação (`auth`)
```
auth/
├── controllers/
│   └── auth.controller.ts       # Endpoints de login/logout
├── services/
│   └── auth.service.ts          # Lógica de autenticação
├── strategies/
│   └── jwt.strategy.ts          # Estratégia JWT do Passport
├── guards/
│   ├── jwt-auth.guard.ts        # Guard de JWT
│   └── roles.guard.ts           # Guard de RBAC
├── decorators/
│   └── roles.decorator.ts       # Decorator para roles
├── dtos/
│   └── login.dto.ts             # DTOs de login
└── auth.module.ts               # Módulo
```

**Responsabilidades:**
- Autenticação de usuários
- Geração de JWT tokens
- Refresh tokens
- Controle de acesso baseado em papéis (RBAC)

### Módulo de Impressoras (`printers`)
```
printers/
├── controllers/
│   └── printers.controller.ts   # Endpoints CRUD
├── services/
│   └── printers.service.ts      # Lógica de negócio
├── dtos/
│   └── printer.dto.ts           # DTOs
└── printers.module.ts           # Módulo
```

**Responsabilidades:**
- Gestão de impressoras
- Consulta de métricas
- Histórico operacional

### Módulo de Suprimentos (`supplies`)
```
supplies/
├── controllers/
│   └── supplies.controller.ts   # Endpoints CRUD
├── services/
│   └── supplies.service.ts      # Lógica de negócio
├── dtos/
│   └── supply.dto.ts            # DTOs
└── supplies.module.ts           # Módulo
```

**Responsabilidades:**
- Cadastro de suprimentos
- Gestão de compatibilidade
- Custos unitários

### Módulo de Estoque (`stock`)
```
stock/
├── controllers/
│   └── stock.controller.ts      # Endpoints de movimentação
├── services/
│   └── stock.service.ts         # Lógica de estoque
├── dtos/
│   └── stock.dto.ts             # DTOs
└── stock.module.ts              # Módulo
```

**Responsabilidades:**
- Movimentações de estoque (entrada, saída, transferência)
- Controle de níveis críticos
- Histórico de movimentações

### Módulo de Alertas (`alerts`)
```
alerts/
├── controllers/
│   └── alerts.controller.ts     # Endpoints de alertas
├── services/
│   └── alerts.service.ts        # Lógica de alertas
├── dtos/
│   └── alert.dto.ts             # DTOs
└── alerts.module.ts             # Módulo
```

**Responsabilidades:**
- Criação e gerenciamento de alertas
- Severidade (INFO, WARNING, CRITICAL)
- Reconhecimento e resolução

### Módulo de Relatórios (`reports`)
```
reports/
├── controllers/
│   └── reports.controller.ts    # Endpoints de relatórios
├── services/
│   └── reports.service.ts       # Lógica de geração
├── dtos/
│   └── report.dto.ts            # DTOs
└── reports.module.ts            # Módulo
```

**Responsabilidades:**
- Geração de relatórios (PDF, Excel)
- Consumo, custos, trocas
- Inventário

### Integração Zabbix (`integrations/zabbix`)
```
zabbix/
├── controllers/
│   └── zabbix.controller.ts     # Endpoints de sincronização
├── services/
│   └── zabbix.service.ts        # Integração com API
└── zabbix.module.ts             # Módulo
```

**Responsabilidades:**
- Autenticação com Zabbix
- Sincronização de impressoras
- Sincronização de métricas
- Tratamento de erros

## 🔐 Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ POST /auth/login
       ▼
┌─────────────────────────────┐
│  AuthController             │
│  - Validar DTO              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  AuthService                │
│  - Buscar usuário           │
│  - Validar senha            │
│  - Gerar tokens             │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  JwtService                 │
│  - Sign access token        │
│  - Sign refresh token       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  PrismaService              │
│  - Salvar sessão            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────┐
│   Cliente   │ ◄── { accessToken, refreshToken, user }
└─────────────┘
```

## 🔄 Fluxo de Requisição Autenticada

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ GET /printers (com Bearer token)
       ▼
┌─────────────────────────────┐
│  JwtAuthGuard               │
│  - Extrair token            │
│  - Validar assinatura       │
│  - Validar expiração        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  RolesGuard                 │
│  - Verificar role           │
│  - Validar permissão        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  PrintersController         │
│  - Receber request          │
│  - Validar DTO              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  PrintersService            │
│  - Executar lógica          │
│  - Consultar dados          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  PrismaService              │
│  - Executar query           │
│  - Retornar dados           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────┐
│   Cliente   │ ◄── { data, pagination }
└─────────────┘
```

## 📊 Modelo de Dados (Entidades Principais)

### User
```prisma
model User {
  id        String
  email     String @unique
  password  String
  role      UserRole  // ADMIN, MANAGER, OPERATOR, VIEWER
  isActive  Boolean
  sessions  Session[]
  auditLogs AuditLog[]
}
```

### Printer
```prisma
model Printer {
  id              String
  zabbixHostId    String @unique
  name            String
  hostname        String @unique
  ipAddress       String
  model           String
  manufacturer    String
  status          PrinterStatus  // ONLINE, OFFLINE, MAINTENANCE, ERROR
  sector          Sector?
  metrics         PrinterMetric[]
  tonerLevels     TonerLevel[]
  consumptionHistory ConsumptionHistory[]
  tonerChanges    TonerChange[]
}
```

### Supply
```prisma
model Supply {
  id                  String
  name                String
  type                SupplyType  // TONER, CYLINDER, FUSER, etc
  manufacturer        String
  nominalCapacity     Int
  unitCost            Float
  compatibleModels    String[]
  stock               Stock?
  stockMovements      StockMovement[]
}
```

### Stock
```prisma
model Stock {
  id              String
  supplyId        String @unique
  quantity        Int
  minimumLevel    Int
  maximumLevel    Int
  lastCountedAt   DateTime?
}
```

### StockMovement
```prisma
model StockMovement {
  id              String
  supplyId        String
  type            MovementType  // ENTRY, EXIT, TRANSFER, ADJUSTMENT
  quantity        Int
  reason          String?
  fromLocation    String?
  toLocation      String?
  createdBy       String
  createdAt       DateTime
}
```

## 🔄 Padrões de Design Utilizados

### 1. **Repository Pattern**
Abstração de acesso a dados através do Prisma.

```typescript
// Implementado implicitamente através do PrismaService
this.prisma.printer.findMany()
this.prisma.printer.create()
this.prisma.printer.update()
```

### 2. **Service Layer**
Centraliza a lógica de negócio.

```typescript
@Injectable()
export class PrintersService {
  async findAll(query: ListPrintersQueryDto) {
    // Lógica de negócio
  }
}
```

### 3. **DTO (Data Transfer Object)**
Valida e transforma dados de entrada.

```typescript
export class CreatePrinterDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsIP()
  ipAddress: string;
}
```

### 4. **Guard Pattern**
Protege rotas com autenticação e autorização.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
async create(@Body() dto: CreatePrinterDto) {
  // Apenas ADMIN e MANAGER podem acessar
}
```

### 5. **Decorator Pattern**
Adiciona metadados para controle de acesso.

```typescript
@Roles('ADMIN')
async delete(@Param('id') id: string) {
  // Apenas ADMIN pode deletar
}
```

## 🚀 Fluxo de Sincronização Zabbix

```
┌──────────────────────────────────────────────────────────┐
│  Scheduler / Manual Trigger                              │
│  POST /zabbix/sync/printers                              │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  ZabbixService.syncPrinters()                            │
│  1. Autenticar com Zabbix                                │
│  2. Obter lista de hosts                                 │
│  3. Para cada host:                                      │
│     - Verificar se existe no BD                          │
│     - Criar ou atualizar                                 │
│  4. Registrar resultado                                  │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  Zabbix API                                              │
│  POST /api_jsonrpc.php                                   │
│  {                                                       │
│    "method": "host.get",                                 │
│    "params": { ... }                                     │
│  }                                                       │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  PrismaService                                           │
│  - Salvar/atualizar impressoras                          │
│  - Registrar timestamp de sincronização                  │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  Resposta                                                │
│  {                                                       │
│    "status": "SUCCESS",                                  │
│    "totalPrinters": 150,                                 │
│    "lastSync": "2024-06-03T15:30:00Z"                    │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
```

## 🔌 Integração com Sistemas Externos

### Zabbix API
- **Autenticação**: User/Password
- **Método**: JSON-RPC 2.0
- **Dados**: Hosts, Métricas, Status
- **Frequência**: Configurável (padrão: 5 min)

### Banco de Dados (PostgreSQL)
- **ORM**: Prisma
- **Conexão**: Connection Pool
- **Migrações**: Automáticas

### Cache (Redis)
- **Uso**: Sessões, Cache de dados
- **Configuração**: Configurável via .env

### Filas (BullMQ)
- **Uso**: Processamento assíncrono
- **Jobs**: Sincronização, Cálculos, Relatórios

## 📈 Escalabilidade

### Horizontal Scaling
- Stateless services
- Sessões em Redis
- Fila distribuída (BullMQ)

### Vertical Scaling
- Connection pooling
- Índices no banco
- Cache de dados

### Performance
- Paginação obrigatória
- Índices em campos frequentes
- Soft delete para auditoria

## 🧪 Testabilidade

### Injeção de Dependência
Todos os serviços usam injeção de dependência do NestJS.

```typescript
constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
) {}
```

### Mocks
Fácil de mockar para testes.

```typescript
const mockPrisma = {
  printer: {
    findMany: jest.fn(),
  },
};

const service = new PrintersService(mockPrisma);
```

## 🔒 Segurança

### Autenticação
- JWT com expiração
- Refresh tokens
- Sessões no banco

### Autorização
- RBAC com 4 níveis
- Guards por rota
- Decorators de role

### Validação
- Class-validator
- DTOs tipados
- Sanitização de entrada

### Headers de Segurança
- Helmet
- CORS
- Rate limiting

## 📝 Logging e Monitoramento

### Logs Estruturados
```typescript
this.logger.log('Mensagem');
this.logger.error('Erro', error);
this.logger.warn('Aviso');
```

### Auditoria
- Todas as operações registradas
- Quem fez o quê e quando
- Valores antigos e novos

## 🎯 Próximos Passos de Desenvolvimento

1. **Jobs com BullMQ**
   - Sincronização automática
   - Cálculos de consumo
   - Detecção de trocas
   - Geração de alertas

2. **Cálculos de Consumo**
   - Páginas por percentual
   - Média móvel
   - Previsões

3. **Geração de Relatórios**
   - PDF com ReportLab
   - Excel com OpenPyXL
   - Gráficos

4. **WebSocket**
   - Alertas em tempo real
   - Dashboard ao vivo

5. **Multi-Tenant**
   - Isolamento de dados
   - Billing por tenant

---

**Versão**: 1.0.0  
**Última atualização**: Junho 2024
