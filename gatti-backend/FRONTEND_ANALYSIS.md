# GATTI Frontend - Análise Completa do Backend

## 📋 Índice
1. [Resumo Executivo](#resumo-executivo)
2. [Entidades do Sistema](#entidades-do-sistema)
3. [Módulos Implementados](#módulos-implementados)
4. [Endpoints Disponíveis](#endpoints-disponíveis)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Relacionamentos Entre Entidades](#relacionamentos-entre-entidades)
7. [Fluxos Operacionais](#fluxos-operacionais)
8. [Dependências Pendentes](#dependências-pendentes)
9. [Contratos de API (DTOs)](#contratos-de-api-dtos)
10. [Regras de Negócio](#regras-de-negócio)

---

## 📊 Resumo Executivo

### Status do Backend
- ✅ **Implementado**: 8 módulos principais
- ⏳ **Parcialmente Implementado**: 1 módulo (Reports)
- ❌ **Não Implementado**: Alguns endpoints de relatórios

### Módulos Implementados
1. **Auth** - Autenticação JWT, RBAC, Refresh Tokens
2. **Printers** - CRUD de impressoras, métricas, histórico
3. **Supplies** - CRUD de suprimentos
4. **Stock** - Movimentações de estoque, níveis críticos
5. **Alerts** - CRUD de alertas, reconhecimento, resolução
6. **Reports** - Estrutura de relatórios (parcialmente implementado)
7. **Zabbix** - Integração com API Zabbix
8. **Health** - Health checks e readiness

### Configuração da API
- **Base URL**: `http://localhost:3000`
- **API Prefix**: `api/v1`
- **Swagger**: `http://localhost:3000/api/v1/docs`
- **Autenticação**: JWT Bearer Token
- **CORS**: Habilitado
- **Validação**: Whitelist + Transform

---

## 🗂️ Entidades do Sistema

### 1. User (Autenticação)
```typescript
{
  id: string (cuid)
  email: string @unique
  password: string (hashed)
  firstName: string
  lastName: string
  role: UserRole (ADMIN | MANAGER | OPERATOR | VIEWER)
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime? (soft delete)
}
```

**Índices**: email, role

### 2. Session (Autenticação)
```typescript
{
  id: string (cuid)
  userId: string @fk User
  refreshToken: string @unique
  expiresAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Índices**: userId, refreshToken

### 3. Printer (Impressoras)
```typescript
{
  id: string (cuid)
  zabbixHostId: string @unique
  name: string
  hostname: string @unique
  ipAddress: string
  model: string
  manufacturer: string
  serialNumber: string?
  group: string
  status: PrinterStatus (ONLINE | OFFLINE | MAINTENANCE | ERROR)
  sectorId: string? @fk Sector
  isActive: boolean
  lastSync: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime? (soft delete)
}
```

**Índices**: zabbixHostId, name, hostname, status, sectorId

### 4. Sector (Setores)
```typescript
{
  id: string (cuid)
  name: string @unique
  description: string?
  costCenter: string?
  manager: string?
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime? (soft delete)
}
```

**Índices**: name

### 5. PrinterMetric (Métricas)
```typescript
{
  id: string (cuid)
  printerId: string @fk Printer
  pageCount: int
  pageCountPerMinute: float?
  tonerLevel: float? (0-100%)
  printerStatus: string?
  uptime: int? (segundos)
  recordedAt: DateTime
  createdAt: DateTime
}
```

**Índices**: printerId, recordedAt, (printerId, recordedAt)

### 6. TonerLevel (Níveis de Toner)
```typescript
{
  id: string (cuid)
  printerId: string @fk Printer
  color: TonerColor (BLACK | CYAN | MAGENTA | YELLOW | WASTE)
  percentageLevel: float (0-100)
  pageCount: int
  recordedAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Índices**: printerId, color, recordedAt  
**Unique**: (printerId, color, recordedAt)

### 7. ConsumptionHistory (Histórico de Consumo)
```typescript
{
  id: string (cuid)
  printerId: string @fk Printer
  color: TonerColor
  pagesProduced: int
  consumedPercentage: float
  pagesPerPercent: float
  dailyAverage: float?
  monthlyAverage: float?
  recordedAt: DateTime
  createdAt: DateTime
}
```

**Índices**: printerId, color, recordedAt

### 8. TonerChange (Detecção de Troca de Toner)
```typescript
{
  id: string (cuid)
  printerId: string @fk Printer
  color: TonerColor
  pagesProducedInCycle: int
  cycleDurationDays: int
  previousLevel: float
  newLevel: float
  detectedAt: DateTime
  createdAt: DateTime
}
```

**Índices**: printerId, color, detectedAt

### 9. TonerForecast (Previsão de Toner)
```typescript
{
  id: string (cuid)
  printerId: string
  color: TonerColor
  currentLevel: float
  daysRemaining: int
  pagesRemaining: int
  estimatedReplaceDate: DateTime
  confidence: float (0-100)
  basedOnDays: int
  calculatedAt: DateTime
  updatedAt: DateTime
}
```

**Índices**: printerId, estimatedReplaceDate  
**Unique**: (printerId, color)

### 10. Supply (Suprimentos)
```typescript
{
  id: string (cuid)
  name: string
  type: SupplyType (TONER | CYLINDER | FUSER | MAINTENANCE_KIT | SPARE_PART)
  manufacturer: string
  model: string?
  compatibleModels: string[] (array)
  nominalCapacity: int (páginas)
  unitCost: float
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime? (soft delete)
}
```

**Índices**: type, manufacturer

### 11. Stock (Controle de Estoque)
```typescript
{
  id: string (cuid)
  supplyId: string @unique @fk Supply
  quantity: int
  minimumLevel: int (padrão: 5)
  maximumLevel: int (padrão: 100)
  lastCountedAt: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Índices**: supplyId

### 12. StockMovement (Movimentações de Estoque)
```typescript
{
  id: string (cuid)
  supplyId: string @fk Supply
  type: MovementType (ENTRY | EXIT | TRANSFER | ADJUSTMENT | LOSS)
  quantity: int
  reason: string?
  fromLocation: string?
  toLocation: string?
  createdBy: string
  createdAt: DateTime
}
```

**Índices**: supplyId, type, createdAt

### 13. Alert (Alertas)
```typescript
{
  id: string (cuid)
  printerId: string?
  type: AlertType (LOW_TONER | CRITICAL_STOCK | PRINTER_OFFLINE | ABNORMAL_CONSUMPTION | OPERATIONAL_FAILURE | MAINTENANCE_DUE)
  severity: AlertSeverity (INFO | WARNING | CRITICAL)
  message: string
  isActive: boolean
  acknowledgedAt: DateTime?
  acknowledgedBy: string?
  createdAt: DateTime
  updatedAt: DateTime
  resolvedAt: DateTime?
}
```

**Índices**: type, severity, isActive, createdAt

### 14. MaintenanceHistory (Histórico de Manutenção)
```typescript
{
  id: string (cuid)
  printerId: string @fk Printer
  type: MaintenanceType (PREVENTIVE | CORRECTIVE | CLEANING | PARTS_REPLACEMENT)
  description: string?
  performedBy: string
  startDate: DateTime
  endDate: DateTime?
  status: MaintenanceStatus (PENDING | IN_PROGRESS | COMPLETED | CANCELLED)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Índices**: printerId, status, startDate

### 15. Report (Relatórios)
```typescript
{
  id: string (cuid)
  type: ReportType (MONTHLY_CONSUMPTION | ANNUAL_CONSUMPTION | COSTS | TONER_CHANGES | STOCK_INVENTORY | PRINTER_PERFORMANCE)
  title: string
  description: string?
  generatedBy: string
  generatedAt: DateTime
  fileUrl: string?
  fileSize: int?
  filters: Json? (objeto com filtros aplicados)
  createdAt: DateTime
}
```

**Índices**: type, generatedAt

### 16. AuditLog (Auditoria)
```typescript
{
  id: string (cuid)
  userId: string @fk User
  action: string
  entityType: string
  entityId: string?
  oldValues: Json?
  newValues: Json?
  ipAddress: string?
  userAgent: string?
  createdAt: DateTime
}
```

**Índices**: userId, action, entityType, createdAt

### 17. ZabbixSync (Status de Sincronização)
```typescript
{
  id: string (cuid)
  lastSyncPrinters: DateTime?
  lastSyncMetrics: DateTime?
  totalPrinters: int
  totalMetrics: int
  status: SyncStatus (IDLE | RUNNING | SUCCESS | FAILED)
  errorMessage: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 18. JobExecution (Execução de Jobs)
```typescript
{
  id: string (cuid)
  jobName: string
  status: JobStatus (PENDING | RUNNING | SUCCESS | FAILED | CANCELLED)
  startedAt: DateTime?
  completedAt: DateTime?
  result: Json?
  errorMessage: string?
  createdAt: DateTime
}
```

**Índices**: jobName, status, createdAt

---

## 🏗️ Módulos Implementados

### 1. Auth Module
**Status**: ✅ Completo

**Endpoints**:
- `POST /api/v1/auth/login` - Login com email/senha
- `POST /api/v1/auth/refresh` - Renovar access token
- `POST /api/v1/auth/logout` - Logout (requer JWT)

**Funcionalidades**:
- Autenticação JWT com access + refresh tokens
- Validação de senha com bcrypt
- Verificação de usuário ativo
- Gerenciamento de sessões
- RBAC com 4 níveis (ADMIN, MANAGER, OPERATOR, VIEWER)

**DTOs**:
```typescript
// Login Request
{
  email: string @IsEmail
  password: string @MinLength(6)
}

// Login Response
{
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
  }
}

// Refresh Token Request
{
  refreshToken: string
}
```

---

### 2. Printers Module
**Status**: ✅ Completo

**Endpoints**:
- `POST /api/v1/printers` - Criar impressora (ADMIN, MANAGER)
- `GET /api/v1/printers` - Listar impressoras (todos)
- `GET /api/v1/printers/:id` - Obter detalhes (todos)
- `PATCH /api/v1/printers/:id` - Atualizar (ADMIN, MANAGER)
- `DELETE /api/v1/printers/:id` - Deletar (ADMIN)
- `GET /api/v1/printers/:id/metrics` - Obter métricas (todos)

**Query Parameters**:
```typescript
// List Printers Query
{
  skip?: number (padrão: 0)
  take?: number (padrão: 10)
  status?: PrinterStatus
  sectorId?: string
  search?: string (busca em name, hostname, ipAddress)
}

// Get Metrics Query
{
  days?: number (padrão: 30)
}
```

**DTOs**:
```typescript
// Create Printer
{
  zabbixHostId: string
  name: string
  hostname: string
  ipAddress: string
  model: string
  manufacturer: string
  group: string
  serialNumber?: string
  status?: PrinterStatus
  sectorId?: string
}

// Update Printer (todos campos opcionais)
{
  name?: string
  hostname?: string
  ipAddress?: string
  model?: string
  manufacturer?: string
  group?: string
  serialNumber?: string
  status?: PrinterStatus
  sectorId?: string
}
```

**Response**:
```typescript
{
  id: string
  zabbixHostId: string
  name: string
  hostname: string
  ipAddress: string
  model: string
  manufacturer: string
  serialNumber?: string
  group: string
  status: PrinterStatus
  sector?: { id, name, description, manager }
  isActive: boolean
  lastSync?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime
}
```

---

### 3. Supplies Module
**Status**: ✅ Completo

**Endpoints**:
- `POST /api/v1/supplies` - Criar suprimento (ADMIN, MANAGER)
- `GET /api/v1/supplies` - Listar suprimentos (todos)
- `GET /api/v1/supplies/:id` - Obter detalhes (todos)
- `PATCH /api/v1/supplies/:id` - Atualizar (ADMIN, MANAGER)
- `DELETE /api/v1/supplies/:id` - Deletar (ADMIN)
- `GET /api/v1/supplies/:id/stock` - Obter estoque (todos)

**Query Parameters**:
```typescript
// List Supplies Query
{
  skip?: number (padrão: 0)
  take?: number (padrão: 10)
  type?: SupplyType
  search?: string (busca em name, manufacturer, model)
}
```

**DTOs**:
```typescript
// Create Supply
{
  name: string
  type: SupplyType
  manufacturer: string
  model?: string
  compatibleModels?: string[]
  nominalCapacity: int
  unitCost: float
}

// Update Supply (todos campos opcionais)
{
  name?: string
  type?: SupplyType
  manufacturer?: string
  model?: string
  compatibleModels?: string[]
  nominalCapacity?: int
  unitCost?: float
}
```

**Response**:
```typescript
{
  id: string
  name: string
  type: SupplyType
  manufacturer: string
  model?: string
  compatibleModels: string[]
  nominalCapacity: int
  unitCost: float
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime
}
```

---

### 4. Stock Module
**Status**: ✅ Completo

**Endpoints**:
- `POST /api/v1/stock/movements` - Criar movimentação (ADMIN, MANAGER, OPERATOR)
- `GET /api/v1/stock/movements` - Listar movimentações (todos)
- `GET /api/v1/stock/levels` - Obter níveis de estoque (todos)
- `GET /api/v1/stock/critical` - Obter estoque crítico (todos)
- `PATCH /api/v1/stock/:supplyId/levels` - Atualizar níveis (ADMIN, MANAGER)

**Query Parameters**:
```typescript
// List Movements Query
{
  skip?: number (padrão: 0)
  take?: number (padrão: 10)
  supplyId?: string
  type?: MovementType
}
```

**DTOs**:
```typescript
// Create Stock Movement
{
  supplyId: string
  type: MovementType
  quantity: int
  reason?: string
  fromLocation?: string
  toLocation?: string
  createdBy: string
}

// Update Stock Levels
{
  minimumLevel: int
  maximumLevel: int
}
```

**Response**:
```typescript
// Stock Movement
{
  id: string
  supplyId: string
  type: MovementType
  quantity: int
  reason?: string
  fromLocation?: string
  toLocation?: string
  createdBy: string
  createdAt: DateTime
}

// Stock Level
{
  id: string
  supplyId: string
  supply: Supply
  quantity: int
  minimumLevel: int
  maximumLevel: int
  lastCountedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

### 5. Alerts Module
**Status**: ✅ Completo

**Endpoints**:
- `POST /api/v1/alerts` - Criar alerta (ADMIN, MANAGER, OPERATOR)
- `GET /api/v1/alerts` - Listar alertas (todos)
- `GET /api/v1/alerts/active` - Listar alertas ativos (todos)
- `GET /api/v1/alerts/critical` - Listar alertas críticos (todos)
- `GET /api/v1/alerts/:id` - Obter alerta (todos)
- `GET /api/v1/alerts/printer/:printerId` - Alertas por impressora (todos)
- `PATCH /api/v1/alerts/:id/acknowledge` - Reconhecer alerta (ADMIN, MANAGER, OPERATOR)
- `PATCH /api/v1/alerts/:id/resolve` - Resolver alerta (ADMIN, MANAGER, OPERATOR)

**Query Parameters**:
```typescript
// List Alerts Query
{
  skip?: number (padrão: 0)
  take?: number (padrão: 10)
  type?: AlertType
  severity?: AlertSeverity
  isActive?: boolean
}
```

**DTOs**:
```typescript
// Create Alert
{
  printerId?: string
  type: AlertType
  severity: AlertSeverity
  message: string
}

// Acknowledge Alert
{
  acknowledgedBy: string
}
```

**Response**:
```typescript
{
  id: string
  printerId?: string
  type: AlertType
  severity: AlertSeverity
  message: string
  isActive: boolean
  acknowledgedAt?: DateTime
  acknowledgedBy?: string
  createdAt: DateTime
  updatedAt: DateTime
  resolvedAt?: DateTime
}
```

---

### 6. Reports Module
**Status**: ⏳ Parcialmente Implementado

**Endpoints**:
- `POST /api/v1/reports` - Criar relatório (ADMIN, MANAGER)
- `GET /api/v1/reports` - Listar relatórios (todos)
- `GET /api/v1/reports/:id` - Obter relatório (todos)
- `GET /api/v1/reports/consumption/monthly` - Relatório de consumo (todos) ⏳ Placeholder
- `GET /api/v1/reports/costs/summary` - Relatório de custos (todos) ⏳ Placeholder
- `GET /api/v1/reports/toner-changes/summary` - Relatório de trocas (todos) ✅ Implementado
- `GET /api/v1/reports/stock/inventory` - Inventário de estoque (todos) ✅ Implementado

**Query Parameters**:
```typescript
// List Reports Query
{
  skip?: number (padrão: 0)
  take?: number (padrão: 10)
  type?: ReportType
}

// Date-based Reports Query
{
  startDate: string (ISO 8601)
  endDate: string (ISO 8601)
}
```

**DTOs**:
```typescript
// Create Report
{
  type: ReportType
  title: string
  description?: string
  generatedBy: string
  filters?: Json
}
```

**Response**:
```typescript
// Report
{
  id: string
  type: ReportType
  title: string
  description?: string
  generatedBy: string
  generatedAt: DateTime
  fileUrl?: string
  fileSize?: int
  filters?: Json
  createdAt: DateTime
}

// Toner Changes Report (Implementado)
{
  type: 'TONER_CHANGES'
  period: { startDate, endDate }
  total: int
  data: TonerChange[]
}

// Stock Inventory Report (Implementado)
{
  type: 'STOCK_INVENTORY'
  generatedAt: DateTime
  data: Stock[]
}

// Consumption Report (Placeholder)
{
  type: 'MONTHLY_CONSUMPTION'
  period: { startDate, endDate }
  data: []
}

// Costs Report (Placeholder)
{
  type: 'COSTS'
  period: { startDate, endDate }
  data: []
}
```

---

### 7. Zabbix Module
**Status**: ✅ Completo (Integração)

**Endpoints**:
- `POST /api/v1/zabbix/sync/printers` - Sincronizar impressoras (ADMIN, MANAGER)
- `POST /api/v1/zabbix/sync/metrics` - Sincronizar métricas (ADMIN, MANAGER)

**Funcionalidades**:
- Autenticação com API Zabbix
- Sincronização de hosts (impressoras)
- Sincronização de métricas
- Mapeamento de status (0 = ONLINE, outros = OFFLINE)
- Atualização de ZabbixSync status

---

### 8. Health Module
**Status**: ✅ Completo

**Endpoints**:
- `GET /health` - Health check com Prisma ping
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

```
1. POST /api/v1/auth/login
   ├─ Email + Senha
   └─ Response: { accessToken, refreshToken, user }

2. Usar accessToken em Authorization header
   ├─ Authorization: Bearer <accessToken>
   └─ Válido por: JWT_EXPIRATION (padrão: 3600s = 1h)

3. Quando expirar, usar refreshToken
   ├─ POST /api/v1/auth/refresh
   ├─ Body: { refreshToken }
   └─ Response: { accessToken, refreshToken, user }

4. Logout
   ├─ POST /api/v1/auth/logout
   └─ Deleta todas as sessões do usuário
```

### Roles e Permissões

| Ação | ADMIN | MANAGER | OPERATOR | VIEWER |
|------|-------|---------|----------|--------|
| **Printers** |
| Criar | ✅ | ✅ | ❌ | ❌ |
| Listar | ✅ | ✅ | ✅ | ✅ |
| Visualizar | ✅ | ✅ | ✅ | ✅ |
| Atualizar | ✅ | ✅ | ❌ | ❌ |
| Deletar | ✅ | ❌ | ❌ | ❌ |
| **Supplies** |
| Criar | ✅ | ✅ | ❌ | ❌ |
| Listar | ✅ | ✅ | ✅ | ✅ |
| Visualizar | ✅ | ✅ | ✅ | ✅ |
| Atualizar | ✅ | ✅ | ❌ | ❌ |
| Deletar | ✅ | ❌ | ❌ | ❌ |
| **Stock** |
| Criar Movimentação | ✅ | ✅ | ✅ | ❌ |
| Listar | ✅ | ✅ | ✅ | ✅ |
| Visualizar | ✅ | ✅ | ✅ | ✅ |
| Atualizar Níveis | ✅ | ✅ | ❌ | ❌ |
| **Alerts** |
| Criar | ✅ | ✅ | ✅ | ❌ |
| Listar | ✅ | ✅ | ✅ | ✅ |
| Reconhecer | ✅ | ✅ | ✅ | ❌ |
| Resolver | ✅ | ✅ | ✅ | ❌ |
| **Reports** |
| Criar | ✅ | ✅ | ❌ | ❌ |
| Listar | ✅ | ✅ | ✅ | ✅ |
| Visualizar | ✅ | ✅ | ✅ | ✅ |
| **Zabbix** |
| Sincronizar | ✅ | ✅ | ❌ | ❌ |

---

## 🔗 Relacionamentos Entre Entidades

```
User
├─ 1:N Session (um usuário pode ter múltiplas sessões)
└─ 1:N AuditLog (um usuário pode ter múltiplos logs de auditoria)

Sector
└─ 1:N Printer (um setor pode ter múltiplas impressoras)

Printer
├─ N:1 Sector (uma impressora pertence a um setor)
├─ 1:N PrinterMetric (uma impressora pode ter múltiplas métricas)
├─ 1:N TonerLevel (uma impressora pode ter múltiplos níveis de toner)
├─ 1:N ConsumptionHistory (uma impressora pode ter múltiplos históricos de consumo)
├─ 1:N TonerChange (uma impressora pode ter múltiplas detecções de troca)
└─ 1:N MaintenanceHistory (uma impressora pode ter múltiplos históricos de manutenção)

Supply
├─ 1:1 Stock (um suprimento tem um controle de estoque)
└─ 1:N StockMovement (um suprimento pode ter múltiplas movimentações)

Alert
└─ N:1 Printer (um alerta pode estar relacionado a uma impressora)
```

---

## 🔄 Fluxos Operacionais

### 1. Fluxo de Login
```
1. Usuário acessa tela de login
2. Insere email e senha
3. Frontend: POST /api/v1/auth/login
4. Backend: Valida credenciais
5. Backend: Retorna { accessToken, refreshToken, user }
6. Frontend: Armazena tokens no localStorage/sessionStorage
7. Frontend: Redireciona para dashboard
```

### 2. Fluxo de Requisição Autenticada
```
1. Frontend: Obtém accessToken do storage
2. Frontend: Adiciona header: Authorization: Bearer <accessToken>
3. Backend: Valida JWT
4. Backend: Extrai user info do token
5. Backend: Verifica role do usuário
6. Backend: Se autorizado, executa ação
7. Backend: Retorna dados
8. Frontend: Processa resposta
```

### 3. Fluxo de Refresh Token
```
1. Frontend: Recebe erro 401 (token expirado)
2. Frontend: POST /api/v1/auth/refresh com refreshToken
3. Backend: Valida refreshToken
4. Backend: Retorna novo { accessToken, refreshToken }
5. Frontend: Atualiza tokens no storage
6. Frontend: Retenta requisição original com novo token
```

### 4. Fluxo de Gestão de Impressoras
```
1. Usuário acessa tela de impressoras
2. Frontend: GET /api/v1/printers?skip=0&take=10
3. Backend: Retorna lista paginada de impressoras
4. Frontend: Exibe tabela com impressoras
5. Usuário clica em uma impressora
6. Frontend: GET /api/v1/printers/:id
7. Backend: Retorna detalhes + métricas + histórico
8. Frontend: Exibe dashboard de impressora
9. Usuário clica em "Editar"
10. Frontend: PATCH /api/v1/printers/:id com dados atualizados
11. Backend: Valida e atualiza impressora
12. Frontend: Exibe mensagem de sucesso
```

### 5. Fluxo de Gestão de Estoque
```
1. Usuário acessa tela de estoque
2. Frontend: GET /api/v1/stock/levels
3. Backend: Retorna níveis de estoque
4. Frontend: Exibe tabela com suprimentos e quantidades
5. Usuário clica em "Criar Movimentação"
6. Frontend: Abre formulário
7. Usuário seleciona suprimento, tipo, quantidade
8. Frontend: POST /api/v1/stock/movements
9. Backend: Valida e cria movimentação
10. Backend: Atualiza quantidade em Stock
11. Frontend: Atualiza lista de movimentações
```

### 6. Fluxo de Alertas
```
1. Sistema detecta condição crítica (job agendado)
2. Backend: POST /api/v1/alerts
3. Backend: Cria novo alerta
4. Frontend: Polling ou WebSocket recebe novo alerta
5. Frontend: Exibe notificação/badge
6. Usuário clica em alerta
7. Frontend: PATCH /api/v1/alerts/:id/acknowledge
8. Backend: Marca como reconhecido
9. Frontend: Atualiza status do alerta
```

### 7. Fluxo de Relatórios
```
1. Usuário acessa tela de relatórios
2. Frontend: GET /api/v1/reports
3. Backend: Retorna lista de relatórios gerados
4. Usuário clica em "Gerar Novo Relatório"
5. Frontend: Abre formulário com tipo e filtros
6. Usuário seleciona tipo e data
7. Frontend: POST /api/v1/reports
8. Backend: Cria registro de relatório
9. Frontend: Exibe "Gerando..." ou redireciona para lista
10. Usuário clica em relatório gerado
11. Frontend: GET /api/v1/reports/:id
12. Backend: Retorna dados do relatório
13. Frontend: Exibe gráficos/tabelas
```

---

## ⚠️ Dependências Pendentes

### Funcionalidades Não Implementadas no Backend

#### 1. Cálculos de Consumo
**Status**: ❌ Não implementado  
**Impacto**: Afeta dashboards de consumo e previsões  
**Necessário para**: 
- Calcular consumo de toner
- Detectar trocas de toner
- Gerar previsões

**Endpoints que precisam ser implementados**:
```
POST /api/v1/analytics/consumption/calculate
GET /api/v1/analytics/consumption/:printerId
GET /api/v1/analytics/forecast/:printerId
```

#### 2. Jobs de Sincronização
**Status**: ❌ Não implementado  
**Impacto**: Sincronização manual apenas  
**Necessário para**:
- Sincronização automática de impressoras
- Sincronização automática de métricas
- Detecção automática de alertas

#### 3. Geração de Relatórios Completa
**Status**: ⏳ Parcialmente implementado  
**Impacto**: Alguns relatórios retornam dados vazios  
**Implementado**:
- ✅ Toner Changes Report
- ✅ Stock Inventory Report

**Não implementado**:
- ❌ Monthly Consumption Report (retorna [])
- ❌ Annual Consumption Report (não existe endpoint)
- ❌ Costs Report (retorna [])
- ❌ Printer Performance Report (não existe endpoint)

#### 4. Módulos Não Mapeados
**Status**: ❌ Não implementados  
**Entidades existentes no schema mas sem módulos**:
- Analytics (consumo, previsões)
- Users Management (CRUD de usuários)
- Sectors Management (CRUD de setores)
- Maintenance (gestão de manutenção)
- Audit (visualização de logs de auditoria)

---

## 📋 Contratos de API (DTOs)

### Padrão de Resposta

#### Sucesso (2xx)
```typescript
// Lista com paginação
{
  data: T[]
  pagination: {
    total: number
    skip: number
    take: number
    pages: number
  }
}

// Entidade única
{
  id: string
  // ... campos da entidade
}
```

#### Erro (4xx, 5xx)
```typescript
{
  statusCode: number
  message: string | string[]
  error: string
}
```

### Validação

**Regras globais**:
- Whitelist: Apenas campos definidos no DTO são aceitos
- Transform: Tipos são convertidos automaticamente
- Forbidden: Campos extras causam erro 400

**Exemplo**:
```typescript
// Request válido
{
  email: "user@example.com",
  password: "password123"
}

// Request inválido (campo extra)
{
  email: "user@example.com",
  password: "password123",
  extraField: "value"  // ❌ Erro 400: property extraField should not exist
}
```

---

## 📊 Regras de Negócio

### Autenticação
1. Senha deve ter mínimo 6 caracteres
2. Email deve ser válido
3. Usuário deve estar ativo (isActive = true)
4. Access token expira em 1 hora
5. Refresh token expira em 7 dias
6. Logout deleta todas as sessões do usuário

### Impressoras
1. zabbixHostId deve ser único
2. hostname deve ser único
3. Status pode ser: ONLINE, OFFLINE, MAINTENANCE, ERROR
4. Soft delete: deletedAt é preenchido ao invés de deletar
5. Ao criar impressora, sectorId é opcional

### Suprimentos
1. Ao criar suprimento, um Stock é criado automaticamente com:
   - quantity: 0
   - minimumLevel: 5
   - maximumLevel: 100
2. compatibleModels é um array de strings
3. nominalCapacity é em páginas
4. unitCost é o preço unitário

### Estoque
1. **Movimentação EXIT/TRANSFER**: Não pode exceder quantidade disponível
2. **Movimentação ENTRY**: Adiciona quantidade
3. **Movimentação ADJUSTMENT**: Sobrescreve quantidade
4. **Movimentação LOSS**: Subtrai quantidade
5. Estoque crítico: quantity <= minimumLevel
6. createdBy é obrigatório (ID do usuário)

### Alertas
1. Tipos: LOW_TONER, CRITICAL_STOCK, PRINTER_OFFLINE, ABNORMAL_CONSUMPTION, OPERATIONAL_FAILURE, MAINTENANCE_DUE
2. Severidade: INFO, WARNING, CRITICAL
3. isActive = true enquanto não resolvido
4. acknowledgedBy é preenchido quando reconhecido
5. resolvedAt é preenchido quando resolvido

### Relatórios
1. type é obrigatório
2. title é obrigatório
3. generatedBy é obrigatório (ID do usuário)
4. filters é um objeto JSON opcional
5. Alguns relatórios retornam dados vazios (não implementados)

### Toner
1. Cores: BLACK, CYAN, MAGENTA, YELLOW, WASTE
2. percentageLevel: 0-100
3. Detecção de troca: quando percentageLevel aumenta > 50%
4. Previsão: estimatedReplaceDate baseado em histórico

### Manutenção
1. Tipos: PREVENTIVE, CORRECTIVE, CLEANING, PARTS_REPLACEMENT
2. Status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
3. endDate é preenchido quando status = COMPLETED

---

## 🎯 Conclusão

### Pronto para Frontend
- ✅ Autenticação e RBAC
- ✅ CRUD de Impressoras
- ✅ CRUD de Suprimentos
- ✅ Gestão de Estoque
- ✅ Sistema de Alertas
- ✅ Alguns Relatórios
- ✅ Integração Zabbix

### Requer Implementação no Backend
- ❌ Cálculos de Consumo
- ❌ Jobs de Sincronização Automática
- ❌ Relatórios Completos
- ❌ Módulos de Gestão (Usuários, Setores, Manutenção, Auditoria)

### Recomendação
O frontend pode ser desenvolvido com os módulos já implementados. Os módulos pendentes podem ser implementados em paralelo ou em fases posteriores do MVP.

---

**Versão**: 1.0.0  
**Data**: Junho 2024  
**Status**: ✅ Análise Completa
