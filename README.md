# GATTI Supply Management System

Sistema corporativo de gestão de impressoras, suprimentos, estoque e relatórios analíticos, integrado com Zabbix e suporte nativo à descoberta e monitoramento de ativos via SNMP.

## 📁 Estrutura do Repositório

```
gerenciador-de-insumos/
├── gatti-backend/          # Backend NestJS (API REST, Prisma ORM, RBAC, SNMP)
├── gatti-frontend/         # Frontend Vite + React 19 + TypeScript + Tailwind CSS 4
├── SNMP_SETUP.md           # Guia operacional da varredura SNMP sem Zabbix
├── SNMP_QA_EVIDENCE.md     # Evidências de testes funcionais e de integração
└── README.md               # Este documento
```

---

## 🚀 Guia Passo a Passo para Deploy em Produção

Este guia descreve o procedimento completo para colocar o **GATTI** em produção em um servidor Linux (Ubuntu/Debian) com Node.js 20+, PostgreSQL 15+ e acesso à rede local de impressoras para descoberta SNMP.

### 1. Pré-requisitos do Sistema

- **Node.js**: Versão 20 LTS ou superior.
- **Gerenciador de Pacotes**: `npm` (backend) e `pnpm` (frontend).
- **Banco de Dados**: PostgreSQL 15+ com a extensão `citext` habilitada.
- **Rede**: Rota direta entre o host do backend e a VLAN de impressoras (ex: `192.168.2.0/24`) caso utilize varredura SNMP nativa.

### 2. Configuração do Backend (NestJS)

Clone o repositório na máquina de destino e acesse o diretório do backend:

```bash
git clone https://github.com/buziodev/gerenciador-de-insumos.git
cd gerenciador-de-insumos/gatti-backend
```

Instale as dependências e crie o arquivo de configuração `.env` a partir do modelo de exemplo:

```bash
npm install
cp .env.example .env
```

Edite o arquivo `.env` com as credenciais do seu banco de dados PostgreSQL, segredos JWT seguros e parâmetros SNMP:

```dotenv
NODE_ENV=production
APP_PORT=3001
APP_URL=https://gatti.suaempresa.com

# Banco de Dados PostgreSQL
DATABASE_URL=postgresql://gatti_user:SUA_SENHA_SEGURA@localhost:5432/gatti_prod

# Segredos JWT (gere strings aleatórias longas)
JWT_SECRET=sua-chave-jwt-secreta-e-longa
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=sua-chave-refresh-secreta-e-longa
JWT_REFRESH_EXPIRATION=7d

# Administrador Inicial (criado automaticamente pelo seed)
INITIAL_ADMIN_EMAIL=admin@suaempresa.com
INITIAL_ADMIN_PASSWORD=SenhaForte-2026!
INITIAL_ADMIN_FIRST_NAME=Administrador
INITIAL_ADMIN_LAST_NAME=GATTI

# Descoberta SNMP para Ricoh P 311 / M 320 (opcional)
SNMP_COMMUNITY=sua_comunidade_snmp_leitura
SNMP_PORT=161
SNMP_DISCOVERY_START_IP=192.168.2.2
SNMP_DISCOVERY_END_IP=192.168.2.220
```

Execute as migrações do Prisma, gere o client e popule o administrador inicial:

```bash
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
```

Compile o backend para produção e inicie o serviço (recomenda-se utilizar um gerenciador de processos como PM2 ou systemd):

```bash
npm run build
# Exemplo com PM2:
pm2 start dist/main.js --name "gatti-backend"
```

### 3. Configuração do Frontend (Vite / React)

Acesse o diretório do frontend:

```bash
cd ../gatti-frontend
pnpm install
```

Crie o arquivo `.env.production` para apontar para a API NestJS publicada:

```env
VITE_API_BASE_URL=https://gatti.suaempresa.com
VITE_API_PREFIX=api/v1
```

Compile o frontend para produção:

```bash
pnpm build
```

O diretório `dist/` resultante conterá os arquivos estáticos prontos para publicação em servidores web (Nginx, Caddy) ou hospedagem de alta performance.

---

## 📊 Matriz de Papéis e Permissões (RBAC)

O sistema conta com 4 níveis de acesso validados por tokens JWT com renovação segura e revogação por `jti`:

| Perfil | Acesso aos Módulos | Permissões de Escrita | Operação SNMP |
| --- | --- | --- | --- |
| **ADMIN** | Completo (inclui Administração) | Total (Usuários, Setores, Impressoras, Estoque) | Configuração, Varrer, Sincronizar |
| **MANAGER** | Módulos operacionais e relatórios | Criação e edição de ativos e relatórios | Varrer, Sincronizar |
| **OPERATOR** | Módulos operacionais (Estoque, Alertas) | Movimentação de estoque e reconhecimento | Varrer |
| **VIEWER** | Leitura em todos os módulos | Nenhuma (somente leitura) | Apenas consulta de configuração |

---

## 🔄 Descoberta SNMP Nativa (Sem Zabbix)

Para ambientes que não utilizam Zabbix, o GATTI possui um módulo SNMP embutido capaz de varrer a faixa de IP configurada, identificar impressoras **Ricoh P 311** e **Ricoh M 320**, e sincronizar contadores de páginas e níveis de toner por cor [1] [2] [3].

1. **Configuração**: Certifique-se de que `SNMP_COMMUNITY` está definido no `.env` do backend. Sem esta variável, as rotas de varredura rejeitam execuções com erro `400 Bad Request`.
2. **Varredura (`POST /api/v1/snmp/discover`)**: Executa um scan concorrente na faixa IP e retorna os ativos responsivos sem alterar o banco de dados.
3. **Sincronização (`POST /api/v1/snmp/sync/printers`)**: Descobre e persiste os ativos na base de dados, atualizando status online/offline e níveis de suprimentos.

---

## 📚 Documentação Adicional

- **`SNMP_SETUP.md`**: Guia técnico detalhado sobre OIDs, Printer-MIB e requisitos de rede para varredura de impressoras.
- **`SNMP_QA_EVIDENCE.md`**: Relatório de testes de integração (61/61 assertions aprovadas).

## 📄 Referências

[1] IETF. *RFC 3805: Printer MIB v2*. Disponível em: <https://datatracker.ietf.org/doc/html/rfc3805>.

[2] Zabbix Community. *Template SNMP Ricoh Printers*. Disponível em: <https://raw.githubusercontent.com/zabbix/community-templates/main/Printers/Ricoh/template_ricoh_snmp_printers/6.0/template_ricoh_snmp_printers.yaml>.

[3] Observium MIB Browser. *RicohPrivateMIB*. Disponível em: <https://mibs.observium.org/mib/RicohPrivateMIB/>.

---
Desenvolvido por **Kauã B e J** — Publicado no repositório oficial [buziodev/gerenciador-de-insumos](https://github.com/buziodev/gerenciador-de-insumos).
