# GATTI Backend - Guia MVP Completo

## 📋 Índice
1. [O Que Falta para o MVP](#o-que-falta-para-o-mvp)
2. [Guia Passo a Passo](#guia-passo-a-passo)
3. [Dependências e Requisitos](#dependências-e-requisitos)
4. [Troubleshooting](#troubleshooting)
5. [Testes da API](#testes-da-api)

---

## 🎯 O Que Falta para o MVP

### ✅ Já Implementado (100%)

| Componente | Status | Detalhes |
|-----------|--------|----------|
| Arquitetura | ✅ | Clean Architecture + DDD |
| Autenticação JWT | ✅ | Login, Refresh, Logout |
| RBAC (4 roles) | ✅ | ADMIN, MANAGER, OPERATOR, VIEWER |
| Banco de Dados | ✅ | Schema Prisma com 20+ modelos |
| Módulo Printers | ✅ | CRUD + Métricas |
| Módulo Supplies | ✅ | CRUD de suprimentos |
| Módulo Stock | ✅ | Movimentações de estoque |
| Módulo Alerts | ✅ | Sistema de alertas |
| Módulo Reports | ✅ | Estrutura de relatórios |
| Zabbix Integration | ✅ | API de sincronização |
| Health Checks | ✅ | Readiness + Liveness |
| Docker | ✅ | Docker Compose + Dockerfile |
| Documentação | ✅ | README + ARCHITECTURE + GUIDES |

### ⏳ Pendente para MVP (Essencial)

#### 1. **Instalar Dependências Faltantes** (15 min)
```
- bcrypt (criptografia de senha)
- @nestjs/axios (requisições HTTP)
- @nestjs/terminus (health checks)
```

#### 2. **Implementar Seed de Dados** (30 min)
```
- Usuário admin padrão
- 5-10 impressoras de exemplo
- Suprimentos compatíveis
- Setores
```

#### 3. **Implementar Cálculos de Consumo** (1h)
```
- Calcular consumo de toner por impressora
- Detectar automaticamente trocas de toner
- Armazenar histórico de consumo
```

#### 4. **Implementar Jobs de Sincronização** (1h)
```
- Job para sincronizar impressoras do Zabbix (a cada 5 min)
- Job para sincronizar métricas (a cada 1 min)
- Job para detectar alertas (a cada 5 min)
```

#### 5. **Implementar Geração de Relatórios Básicos** (1.5h)
```
- Relatório de consumo em JSON/CSV
- Relatório de custos
- Inventário de estoque
```

#### 6. **Implementar Alertas Automáticos** (1h)
```
- Alerta de toner baixo
- Alerta de estoque crítico
- Alerta de impressora offline
```

#### 7. **Testes Básicos** (1h)
```
- Testes unitários dos services principais
- Testes E2E dos endpoints críticos
```

**Total de Tempo Estimado: 6-7 horas**

---

## 🚀 Guia Passo a Passo

### FASE 1: Preparação do Ambiente (30 min)

#### Passo 1.1: Verificar Requisitos

```bash
# Verificar Node.js
node --version  # Deve ser 20+
npm --version   # Deve ser 10+

# Verificar Docker
docker --version
docker-compose --version

# Verificar Git (opcional)
git --version
```

**Saída esperada:**
```
v20.13.0
10.5.0
Docker version 24.0.0
Docker Compose version 2.20.0
```

#### Passo 1.2: Clonar/Extrair Projeto

```bash
# Se tiver arquivo comprimido
tar -xzf gatti-backend.tar.gz
# ou
unzip gatti-backend.zip

# Entrar na pasta
cd gatti-backend
```

#### Passo 1.3: Verificar Estrutura

```bash
# Listar arquivos principais
ls -la

# Deve ter:
# - src/
# - prisma/
# - package.json
# - docker-compose.yml
# - .env.example
# - README.md
```

---

### FASE 2: Instalar Dependências (20 min)

#### Passo 2.1: Instalar Dependências NPM

```bash
# Instalar todas as dependências
npm install

# Isso vai instalar:
# - @nestjs/core, @nestjs/common, etc
# - prisma, @prisma/client
# - passport, @nestjs/jwt
# - class-validator, class-transformer
# - etc (veja package.json)
```

**Tempo esperado:** 5-10 minutos

#### Passo 2.2: Instalar Dependências Faltantes

```bash
# Instalar pacotes adicionais necessários
npm install bcrypt --save
npm install @nestjs/axios --save
npm install @nestjs/terminus --save
npm install @nestjs/schedule --save

# Instalar tipos do TypeScript
npm install -D @types/bcrypt
npm install -D @types/node
```

**Tempo esperado:** 3-5 minutos

#### Passo 2.3: Verificar Instalação

```bash
# Verificar se tudo foi instalado
npm list | head -20

# Deve mostrar:
# @nestjs/common@10.x.x
# @nestjs/core@10.x.x
# prisma@5.x.x
# etc
```

---

### FASE 3: Configurar Ambiente (15 min)

#### Passo 3.1: Criar Arquivo .env

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo
nano .env  # ou use seu editor favorito
```

#### Passo 3.2: Configurar Variáveis Essenciais

Abra o arquivo `.env` e configure:

```env
# ==================== DATABASE ====================
DATABASE_URL="postgresql://gatti:gatti123@localhost:5432/gatti_db"

# ==================== JWT ====================
JWT_SECRET="sua-chave-secreta-super-segura-minimo-32-caracteres"
JWT_EXPIRATION="3600"  # 1 hora
JWT_REFRESH_EXPIRATION="604800"  # 7 dias

# ==================== APPLICATION ====================
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"

# ==================== REDIS ====================
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# ==================== ZABBIX ====================
ZABBIX_API_URL="http://localhost/api_jsonrpc.php"
ZABBIX_API_USER="Admin"
ZABBIX_API_PASSWORD="zabbix"
ZABBIX_SYNC_INTERVAL="300000"  # 5 minutos

# ==================== LOGGING ====================
LOG_LEVEL="debug"
```

**Importante:** 
- `JWT_SECRET` deve ter pelo menos 32 caracteres
- `DATABASE_URL` deve apontar para seu PostgreSQL
- Se não tiver Zabbix, deixe os valores padrão

---

### FASE 4: Iniciar Serviços (10 min)

#### Passo 4.1: Iniciar Docker Compose

```bash
# Iniciar PostgreSQL e Redis em background
docker-compose up -d

# Verificar se estão rodando
docker-compose ps

# Saída esperada:
# NAME              STATUS
# gatti-postgres    Up (healthy)
# gatti-redis       Up (healthy)
```

**Tempo esperado:** 2-3 minutos

#### Passo 4.2: Verificar Conectividade

```bash
# Testar conexão com PostgreSQL
docker exec gatti-postgres psql -U gatti -d gatti_db -c "SELECT 1"

# Saída esperada:
# ?column?
# ----------
#        1

# Testar conexão com Redis
docker exec gatti-redis redis-cli ping

# Saída esperada:
# PONG
```

#### Passo 4.3: Visualizar Logs

```bash
# Ver logs do PostgreSQL
docker logs gatti-postgres

# Ver logs do Redis
docker logs gatti-redis

# Seguir logs em tempo real
docker-compose logs -f
```

---

### FASE 5: Executar Migrações (15 min)

#### Passo 5.1: Gerar Cliente Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Saída esperada:
# ✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

#### Passo 5.2: Executar Migrações

```bash
# Executar todas as migrações
npx prisma migrate deploy

# Se for primeira vez, pode usar:
npx prisma migrate dev --name init

# Saída esperada:
# ✔ Migrations applied successfully
```

#### Passo 5.3: Verificar Banco de Dados

```bash
# Abrir Prisma Studio (interface visual)
npx prisma studio

# Isso abre http://localhost:5555
# Você pode ver todas as tabelas e dados
```

---

### FASE 6: Criar Dados Iniciais (20 min)

#### Passo 6.1: Criar Seed Script

Crie o arquivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de dados...');

  // Limpar dados existentes (opcional)
  // await prisma.user.deleteMany({});

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gatti.com' },
    update: {},
    create: {
      email: 'admin@gatti.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'GATTI',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // Criar usuário manager
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

  // Criar setor
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

  // Criar suprimentos
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

  // Criar impressoras de exemplo
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

#### Passo 6.2: Atualizar package.json

Adicione no `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

#### Passo 6.3: Executar Seed

```bash
# Instalar ts-node se não tiver
npm install -D ts-node

# Executar seed
npx prisma db seed

# Saída esperada:
# 🌱 Iniciando seed de dados...
# ✅ Admin criado: admin@gatti.com
# ✅ Manager criado: manager@gatti.com
# ✅ Setor criado: Administrativo
# ✅ Suprimento criado: Toner Preto HP 85A
# ✅ Impressora criada: Impressora Sala 101
# 🎉 Seed concluído com sucesso!
```

---

### FASE 7: Iniciar o Servidor (5 min)

#### Passo 7.1: Iniciar em Desenvolvimento

```bash
# Iniciar com hot-reload
npm run start:dev

# Saída esperada:
# [Nest] 12345  - 06/03/2024, 16:30:00     LOG [NestFactory] Starting Nest application...
# [Nest] 12345  - 06/03/2024, 16:30:01     LOG [InstanceLoader] PrismaModule dependencies initialized
# [Nest] 12345  - 06/03/2024, 16:30:02     LOG [InstanceLoader] AuthModule dependencies initialized
# ...
# [Nest] 12345  - 06/03/2024, 16:30:05     LOG [NestApplication] Nest application successfully started
# [Nest] 12345  - 06/03/2024, 16:30:05     LOG [NestApplication] Application is running on: http://0.0.0.0:3000
```

#### Passo 7.2: Verificar Saúde da Aplicação

Em outro terminal:

```bash
# Health check
curl http://localhost:3000/health

# Saída esperada:
# {"status":"ok","info":{"database":{"status":"up"}},"error":{},"details":{"database":{"status":"up"}}}
```

---

### FASE 8: Testar API (15 min)

#### Passo 8.1: Acessar Swagger UI

Abra no navegador:
```
http://localhost:3000/api/v1/docs
```

Você verá a documentação interativa de todos os endpoints.

#### Passo 8.2: Fazer Login

```bash
# Via curl
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gatti.com",
    "password": "admin123"
  }'

# Saída esperada:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
#   "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "id": "user-123",
#     "email": "admin@gatti.com",
#     "firstName": "Admin",
#     "lastName": "GATTI",
#     "role": "ADMIN"
#   }
# }
```

Guarde o `accessToken` para os próximos testes.

#### Passo 8.3: Listar Impressoras

```bash
# Via curl (substitua TOKEN pelo accessToken recebido)
curl -X GET http://localhost:3000/api/v1/printers \
  -H "Authorization: Bearer TOKEN"

# Saída esperada:
# {
#   "data": [
#     {
#       "id": "printer-1",
#       "name": "Impressora Sala 101",
#       "hostname": "printer-101.empresa.com",
#       "ipAddress": "192.168.1.100",
#       "status": "ONLINE"
#     },
#     ...
#   ],
#   "pagination": {
#     "total": 2,
#     "skip": 0,
#     "take": 10
#   }
# }
```

#### Passo 8.4: Listar Suprimentos

```bash
curl -X GET http://localhost:3000/api/v1/supplies \
  -H "Authorization: Bearer TOKEN"
```

#### Passo 8.5: Criar Movimentação de Estoque

```bash
curl -X POST http://localhost:3000/api/v1/stock/movements \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplyId": "supply-1",
    "type": "ENTRY",
    "quantity": 10,
    "reason": "Compra fornecedor ABC"
  }'
```

---

## 🔧 Dependências e Requisitos

### Dependências do Sistema

| Dependência | Versão | Propósito | Status |
|------------|--------|----------|--------|
| Node.js | 20+ | Runtime JavaScript | ✅ Obrigatório |
| npm | 10+ | Gerenciador de pacotes | ✅ Obrigatório |
| Docker | 20.10+ | Containerização | ✅ Obrigatório |
| Docker Compose | 2.0+ | Orquestração | ✅ Obrigatório |
| PostgreSQL | 15 | Banco de dados | ✅ Via Docker |
| Redis | 7 | Cache/Sessões | ✅ Via Docker |

### Dependências NPM (package.json)

**Já Instaladas:**
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@prisma/client": "^5.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "dotenv": "^16.0.0",
  "helmet": "^7.0.0",
  "prisma": "^5.0.0"
}
```

**Faltando (Instalar):**
```bash
npm install bcrypt @nestjs/axios @nestjs/terminus @nestjs/schedule
npm install -D @types/bcrypt
```

### Variáveis de Ambiente Obrigatórias

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=sua-chave-secreta-minimo-32-caracteres
JWT_EXPIRATION=3600

# Aplicação
NODE_ENV=development
PORT=3000

# Redis (opcional para MVP)
REDIS_HOST=localhost
REDIS_PORT=6379

# Zabbix (opcional para MVP)
ZABBIX_API_URL=http://localhost/api_jsonrpc.php
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@nestjs/axios'"

**Solução:**
```bash
npm install @nestjs/axios --save
npm install @nestjs/terminus --save
```

### Erro: "ECONNREFUSED 127.0.0.1:5432"

**Problema:** PostgreSQL não está rodando

**Solução:**
```bash
# Verificar se container está rodando
docker ps | grep postgres

# Se não estiver, iniciar
docker-compose up -d postgres

# Verificar logs
docker logs gatti-postgres
```

### Erro: "connect ECONNREFUSED 127.0.0.1:6379"

**Problema:** Redis não está rodando

**Solução:**
```bash
docker-compose up -d redis
docker logs gatti-redis
```

### Erro: "JWT_SECRET is not defined"

**Problema:** Variável de ambiente não configurada

**Solução:**
```bash
# Verificar se .env existe
ls -la .env

# Se não existir, criar
cp .env.example .env

# Editar e adicionar JWT_SECRET
nano .env
```

### Erro: "Port 3000 is already in use"

**Solução:**
```bash
# Opção 1: Usar porta diferente
PORT=3001 npm run start:dev

# Opção 2: Matar processo existente
lsof -i :3000
kill -9 <PID>
```

### Erro: "Prisma migration failed"

**Solução:**
```bash
# Resetar banco (CUIDADO: deleta dados)
npx prisma migrate reset

# Ou executar manualmente
npx prisma migrate deploy
```

---

## 📊 Testes da API

### Teste 1: Health Check

```bash
curl http://localhost:3000/health
```

**Resposta esperada:** Status 200 com `{"status":"ok"}`

### Teste 2: Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gatti.com","password":"admin123"}'
```

**Resposta esperada:** Status 200 com tokens

### Teste 3: Listar Impressoras (com autenticação)

```bash
# Substituir TOKEN pelo accessToken recebido no login
curl -X GET http://localhost:3000/api/v1/printers \
  -H "Authorization: Bearer TOKEN"
```

**Resposta esperada:** Status 200 com lista de impressoras

### Teste 4: Criar Suprimento

```bash
curl -X POST http://localhost:3000/api/v1/supplies \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Toner Novo",
    "type": "TONER",
    "manufacturer": "HP",
    "model": "CE123A",
    "nominalCapacity": 2000,
    "unitCost": 100.00
  }'
```

**Resposta esperada:** Status 201 com dados do suprimento criado

### Teste 5: Swagger UI

Abra no navegador:
```
http://localhost:3000/api/v1/docs
```

Você pode testar todos os endpoints interativamente.

---

## 📈 Próximas Implementações (Pós-MVP)

1. **Jobs com BullMQ** (Sincronização automática)
2. **Cálculos de Consumo** (Análise de toner)
3. **Geração de Relatórios** (PDF/Excel)
4. **WebSocket** (Alertas em tempo real)
5. **Testes E2E** (Cobertura completa)
6. **CI/CD** (GitHub Actions)
7. **Multi-Tenant** (Suporte a múltiplas empresas)

---

## ✅ Checklist de Conclusão

- [ ] Node.js 20+ instalado
- [ ] npm 10+ instalado
- [ ] Docker e Docker Compose instalados
- [ ] Projeto extraído/clonado
- [ ] `npm install` executado
- [ ] Dependências faltantes instaladas
- [ ] `.env` configurado
- [ ] `docker-compose up -d` executado
- [ ] Migrações executadas
- [ ] Seed de dados criado
- [ ] `npm run start:dev` funcionando
- [ ] Health check retornando 200
- [ ] Login funcionando
- [ ] Endpoints de impressoras/suprimentos respondendo
- [ ] Swagger UI acessível

---

**Versão:** 1.0.0  
**Última atualização:** Junho 2024  
**Status:** ✅ Pronto para MVP
