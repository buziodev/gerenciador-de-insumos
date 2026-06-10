# GATTI - Gerenciador de Insumos

Sistema completo de gestão de impressoras, suprimentos e estoque com integração Zabbix.

## 📁 Estrutura do Projeto

```
gerenciador-de-insumos/
├── gatti-backend/          # Backend NestJS (API REST)
├── gatti-frontend/         # Frontend Next.js (React 19)
├── mock-backend.js         # Mock backend para desenvolvimento
└── README.md               # Este arquivo
```

## 🚀 Quick Start

### Backend (NestJS)

```bash
cd gatti-backend
npm install
npm run dev
```

**Porta**: 3001  
**Documentação**: http://localhost:3001/api/v1/docs

### Frontend (Next.js)

```bash
cd gatti-frontend
pnpm install
pnpm dev
```

**Porta**: 3000  
**URL**: http://localhost:3000

### Mock Backend (para desenvolvimento)

```bash
node mock-backend.js
```

**Porta**: 3001

## 🔐 Credenciais de Teste

```
Email: admin@gatti.com
Senha: admin123
```

## 📊 Stack Tecnológico

### Backend
- **Framework**: NestJS 10+
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Fila**: BullMQ
- **Autenticação**: JWT
- **Validação**: Class Validator
- **Documentação**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 15+
- **UI**: React 19 + shadcn/ui
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query
- **Formulários**: React Hook Form
- **Validação**: Zod
- **Gráficos**: Recharts
- **Icons**: Lucide Icons

## 📚 Documentação

- **Backend**: `gatti-backend/README.md`
- **Frontend**: `gatti-frontend/README.md`
- **Arquitetura**: `gatti-backend/ARCHITECTURE.md`
- **Análise**: `gatti-backend/BACKEND_ANALYSIS.md`

## 🔄 Integração com Zabbix

O sistema sincroniza automaticamente:
- Impressoras e suas métricas
- Níveis de toner
- Alertas de consumo
- Histórico de manutenção

## 🛠️ Desenvolvimento

### Variáveis de Ambiente

#### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/gatti
JWT_SECRET=sua-chave-secreta
ZABBIX_API_URL=http://zabbix.example.com/api_jsonrpc.php
ZABBIX_API_KEY=sua-chave-api
PORT=3001
```

#### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_API_PREFIX=api/v1
```

## 📦 Deploy

### Docker

```bash
cd gatti-backend
docker-compose up -d
```

### Produção

```bash
# Backend
npm run build
npm run start

# Frontend
pnpm build
pnpm start
```

## 🧪 Testes

```bash
# Backend
npm run test
npm run test:e2e

# Frontend
pnpm test
```

## 📝 Commits

Commits realizados por: **Kauã B e J**

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
2. Commit suas mudanças: `git commit -m 'Add: minha feature'`
3. Push para a branch: `git push origin feature/minha-feature`
4. Abra um Pull Request

## 📄 Licença

MIT

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ por GATTI Dev Team**
