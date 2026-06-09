# GATTI - Gerenciador de Insumos Backend

Backend completo para a plataforma **GATTI** (Gerenciador de Insumos), um sistema SaaS escalável para gestão de impressoras, suprimentos e estoque com integração com Zabbix.

## 📋 Visão Geral

O GATTI Backend é uma aplicação NestJS que fornece uma API REST completa para:

- **Gestão de Impressoras**: Cadastro, monitoramento e histórico operacional
- **Gestão de Suprimentos**: Toners, cilindros, fusores e peças de reposição
- **Gestão de Estoque**: Movimentações, transferências e ajustes
- **Monitoramento Gerencial**: Consumo, custos e indicadores
- **Inteligência de Negócio**: Previsões de troca, tendências e alertas
- **Integração Zabbix**: Sincronização automática de dados de impressoras

## 🏗️ Arquitetura

### Padrões Implementados

- **Clean Architecture**: Separação clara entre camadas (controllers, services, repositories)
- **Domain-Driven Design (DDD)**: Modelagem orientada ao domínio
- **SOLID Principles**: Código mantível e escalável
- **Repository Pattern**: Abstração de acesso a dados
- **CQRS**: Quando necessário, separação entre leitura e escrita

### Estrutura de Diretórios

```
src/
├── modules/
│   ├── auth/              # Autenticação e autorização
│   ├── printers/          # Gestão de impressoras
│   ├── supplies/          # Gestão de suprimentos
│   ├── stock/             # Gestão de estoque
│   ├── alerts/            # Sistema de alertas
│   ├── reports/           # Geração de relatórios
│   └── health/            # Health checks
├── integrations/
│   └── zabbix/            # Integração com Zabbix
├── infrastructure/
│   └── prisma/            # Camada de persistência
├── common/                # Utilitários e helpers
├── config/                # Configurações
└── main.ts                # Ponto de entrada
```

## 🚀 Começando

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- PostgreSQL 12+
- Redis 6+
- Docker e Docker Compose (opcional)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd gatti-backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie os serviços (Docker)**
```bash
docker-compose up -d
```

5. **Execute as migrações do banco de dados**
```bash
npm run prisma:migrate
```

6. **Inicie o servidor em desenvolvimento**
```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📚 Documentação da API

A documentação interativa da API está disponível em:

```
http://localhost:3000/api/v1/docs
```

Acesse o Swagger UI para explorar todos os endpoints, testar requisições e visualizar os modelos de dados.

## 🔐 Autenticação

### JWT (JSON Web Tokens)

A API utiliza JWT para autenticação. Todos os endpoints (exceto login) requerem um token válido.

**Fluxo de Autenticação:**

1. **Login**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@gatti.com",
  "password": "password123"
}
```

Resposta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "admin@gatti.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

2. **Usar o Token**
```bash
GET /api/v1/printers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

3. **Renovar Token**
```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Roles (RBAC)

O sistema implementa controle de acesso baseado em papéis:

| Papel | Permissões |
|-------|-----------|
| **ADMIN** | Acesso total, gerenciamento de usuários, configurações |
| **MANAGER** | Gestão de impressoras, suprimentos, estoque, relatórios |
| **OPERATOR** | Operações de estoque, reconhecimento de alertas |
| **VIEWER** | Visualização de dados, relatórios (somente leitura) |

## 📊 Banco de Dados

### Schema Prisma

O banco de dados é gerenciado através do Prisma ORM com PostgreSQL.

**Principais Entidades:**

- **User**: Usuários do sistema
- **Printer**: Impressoras monitoradas
- **Sector**: Setores/departamentos
- **Supply**: Suprimentos (toners, cilindros, etc.)
- **Stock**: Controle de estoque
- **StockMovement**: Histórico de movimentações
- **PrinterMetric**: Métricas coletadas do Zabbix
- **TonerLevel**: Níveis de toner por cor
- **TonerChange**: Detecção automática de trocas
- **Alert**: Sistema de alertas
- **AuditLog**: Auditoria de operações

### Migrações

```bash
# Criar nova migração
npm run prisma:migrate

# Visualizar banco de dados
npm run prisma:studio

# Seed inicial (criar dados de exemplo)
npm run prisma:seed
```

## 🔗 Integração Zabbix

### Configuração

Configure as variáveis de ambiente:

```env
ZABBIX_API_URL=http://zabbix-server/api_jsonrpc.php
ZABBIX_API_USER=Admin
ZABBIX_API_PASSWORD=zabbix
ZABBIX_SYNC_INTERVAL=300000  # 5 minutos
```

### Sincronização

A sincronização com Zabbix é feita através de jobs agendados:

```bash
# Sincronizar impressoras manualmente
POST /api/v1/zabbix/sync/printers

# Sincronizar métricas manualmente
POST /api/v1/zabbix/sync/metrics
```

### Dados Sincronizados

- **Impressoras**: Nome, hostname, IP, modelo, fabricante, série
- **Métricas**: Page Count, Toner Level, Status, Uptime
- **Status**: Online/Offline, disponibilidade

## 📈 Funcionalidades Principais

### 1. Gestão de Impressoras

```bash
# Listar impressoras
GET /api/v1/printers?skip=0&take=10&status=ONLINE

# Obter detalhes
GET /api/v1/printers/:id

# Criar impressora
POST /api/v1/printers
{
  "zabbixHostId": "12345",
  "name": "Impressora Sala 101",
  "hostname": "printer-101.empresa.com",
  "ipAddress": "192.168.1.100",
  "model": "HP LaserJet Pro M404n",
  "manufacturer": "HP",
  "group": "Administrativo"
}

# Obter métricas
GET /api/v1/printers/:id/metrics?days=30
```

### 2. Gestão de Suprimentos

```bash
# Listar suprimentos
GET /api/v1/supplies?type=TONER

# Criar suprimento
POST /api/v1/supplies
{
  "name": "Toner Preto HP 85A",
  "type": "TONER",
  "manufacturer": "HP",
  "model": "CE285A",
  "nominalCapacity": 1600,
  "unitCost": 85.50
}

# Obter estoque
GET /api/v1/supplies/:id/stock
```

### 3. Gestão de Estoque

```bash
# Criar movimentação
POST /api/v1/stock/movements
{
  "supplyId": "supply-123",
  "type": "ENTRY",
  "quantity": 10,
  "reason": "Compra fornecedor ABC",
  "createdBy": "user-123"
}

# Listar movimentações
GET /api/v1/stock/movements

# Obter níveis de estoque
GET /api/v1/stock/levels

# Obter estoque crítico
GET /api/v1/stock/critical
```

### 4. Sistema de Alertas

```bash
# Listar alertas
GET /api/v1/alerts?severity=CRITICAL&isActive=true

# Obter alertas ativos
GET /api/v1/alerts/active

# Reconhecer alerta
PATCH /api/v1/alerts/:id/acknowledge
{
  "acknowledgedBy": "user-123"
}

# Resolver alerta
PATCH /api/v1/alerts/:id/resolve
```

### 5. Relatórios

```bash
# Gerar relatório
POST /api/v1/reports
{
  "type": "MONTHLY_CONSUMPTION",
  "title": "Consumo Mensal - Junho 2024",
  "generatedBy": "user-123"
}

# Relatório de consumo
GET /api/v1/reports/consumption/monthly?startDate=2024-06-01&endDate=2024-06-30

# Relatório de custos
GET /api/v1/reports/costs/summary?startDate=2024-06-01&endDate=2024-06-30

# Inventário de estoque
GET /api/v1/reports/stock/inventory
```

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e

# Modo watch
npm run test:watch
```

## 📦 Build e Deploy

### Build para Produção

```bash
npm run build
```

Isso gera os arquivos compilados em `dist/`.

### Docker

```bash
# Build da imagem
docker build -t gatti-backend:latest .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  gatti-backend:latest
```

### Docker Compose (Produção)

Crie um arquivo `docker-compose.prod.yml` com as configurações de produção.

## 🔍 Observabilidade

### Health Checks

```bash
# Status geral
GET /health

# Pronto para receber requisições
GET /health/ready

# Vivo
GET /health/live
```

### Logs

Os logs são estruturados em formato JSON e podem ser integrados com sistemas centralizados.

```bash
# Visualizar logs
npm run start:dev | grep "GATTI"
```

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
npm run start          # Iniciar em produção
npm run start:dev      # Iniciar em desenvolvimento
npm run start:debug    # Iniciar com debugger
npm run build          # Build para produção
npm run lint           # Verificar código
npm run format         # Formatar código
npm run test           # Executar testes
npm run prisma:migrate # Executar migrações
npm run prisma:studio  # Abrir Prisma Studio
```

### Variáveis de Ambiente

Veja `.env.example` para todas as variáveis disponíveis.

### Boas Práticas

1. **Commits**: Use mensagens descritivas
2. **Branches**: `feature/`, `fix/`, `docs/`, `refactor/`
3. **Code Style**: Siga o ESLint
4. **Testes**: Mantenha cobertura > 80%
5. **Documentação**: Mantenha README e Swagger atualizados

## 🚨 Troubleshooting

### Erro de Conexão com PostgreSQL

```bash
# Verificar se o container está rodando
docker ps | grep postgres

# Verificar logs
docker logs gatti-postgres

# Reiniciar serviço
docker-compose restart postgres
```

### Erro de Autenticação Zabbix

```bash
# Verificar credenciais em .env
# Testar conexão manualmente
curl -X POST http://zabbix-server/api_jsonrpc.php \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"user.login","params":{"username":"Admin","password":"zabbix"},"id":1}'
```

### Porta 3000 em Uso

```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm run start:dev
```

## 📝 Licença

Este projeto é propriedade da empresa GATTI.

## 👥 Contribuidores

- Tech Lead Backend
- Arquiteto de Software
- Especialista em NestJS

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com o time de desenvolvimento.

---

**Última atualização**: Junho 2024
**Versão**: 1.0.0
