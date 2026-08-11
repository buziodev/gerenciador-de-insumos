# Validação técnica — GATTI Supply Management System

**Data:** 11 de agosto de 2026  
**Escopo:** cópia de trabalho em `gatti-backend` e `gatti-frontend`.

## Resultado

O código foi compilado e validado estaticamente, mas **não deve ser classificado como pronto para produção**. Não havia PostgreSQL, Redis nem Docker disponíveis no ambiente para aplicar migrações, iniciar todos os serviços ou executar fluxos autenticados de ponta a ponta.

| Área | Evidência executada | Resultado |
|---|---|---|
| Backend NestJS | `npm run build` | Aprovado |
| Schema Prisma | `npx prisma validate` com URL PostgreSQL de formato válido | Aprovado |
| Cliente Prisma | `npx prisma generate` | Aprovado |
| Frontend TypeScript | `pnpm check` | Aprovado |
| Build do frontend | `pnpm build` | Aprovado; há aviso de bundle JavaScript acima de 500 kB |
| Roteamento sem sessão | `/` e `/printers` no navegador | Ambos levam a `/auth/login` |
| Fluxos com banco | Login, CRUD e movimentações reais | Não executados: dependem de PostgreSQL e de usuário provisionado |
| Compose/Docker | `docker compose config`, build e subida | Não executados: Docker indisponível no ambiente |

## Correções verificadas

As correções de backend preservam o modelo atual e evitam alterações especulativas. A criação de suprimento e o respectivo registro inicial de estoque passaram a ocorrer em uma única transação. A exclusão lógica de um suprimento também oculta o estoque associado. As saídas, transferências e perdas usam atualização condicional de quantidade para impedir saldo negativo em concorrência, e a movimentação recebe `createdBy` exclusivamente do usuário autenticado.

As consultas de suprimento e estoque passam a respeitar `deletedAt`. A atualização dos níveis de estoque valida valores negativos e a relação entre mínimo e máximo. A rota de prontidão consulta o banco antes de responder com sucesso, por isso o health check do backend não anuncia disponibilidade quando a dependência principal está indisponível.

No frontend, as rotas dos módulos são mantidas sob a proteção existente. A raiz usa redirecionamento declarativo, sem mutar `window.location` durante a renderização. O alternador de tema foi integrado ao layout e as credenciais fictícias foram removidas da tela de login; nenhum usuário inicial foi inventado.

## Conteinerização preparada

Os Dockerfiles foram ajustados para os lockfiles e o tipo real de cada aplicação: `npm ci` e geração Prisma no NestJS; `pnpm build` e Nginx para o artefato Vite. O Compose é executado a partir de `gatti-backend`, usa o frontend irmão como contexto de build e exige `POSTGRES_PASSWORD`, `JWT_SECRET` e `JWT_REFRESH_SECRET` do ambiente. Não há senhas, segredo JWT ou credencial Zabbix operacional fixados no arquivo.

> O endpoint de disponibilidade usado pelo Compose é `GET /api/v1/health/ready`. Ele depende do banco e deve retornar erro enquanto o PostgreSQL não estiver pronto.

## Pendências objetivas de homologação

| Pendência | Motivo | Ação necessária |
|---|---|---|
| Migração inicial versionada | Não existe diretório `prisma/migrations` no repositório recuperado | Em um PostgreSQL novo de homologação, executar `npx prisma migrate dev --name init` e versionar os arquivos criados |
| Usuário inicial | Não existe seed script nem conta criada | Provisionar o primeiro administrador por procedimento seguro e validá-lo contra o endpoint de autenticação |
| Testes automatizados | O script `npm test` atual encerra com erro e não há suíte configurada | Criar testes unitários e de integração para autenticação, RBAC, estoque e soft delete |
| Teste completo de containers | Docker não está instalado neste ambiente | Executar `docker compose build` e `docker compose up` em ambiente com Docker/Compose |
| Integração Zabbix | URL, credenciais e mapeamento de itens não foram fornecidos | Configurar apenas após receber os parâmetros de ambiente e validar uma impressora de homologação |
| Atualizações em tempo real | WebSocket não foi implementado | O monitoramento atual permanece por polling; confirmar o requisito operacional antes de adicionar canal em tempo real |
| Otimização do bundle | O build alerta para chunk acima de 500 kB | Medir uso real e aplicar imports dinâmicos antes de uma publicação pública, se necessário |

## Procedimento mínimo para homologação

Em uma máquina com PostgreSQL, Redis, Node.js e Docker disponíveis, copie o modelo de ambiente e defina segredos fortes. Em um banco novo e descartável, gere e aplique a primeira migração antes de iniciar o backend. Não use `reset` ou comandos de criação de migração contra uma base com dados sem revisão prévia.

```bash
cd gatti-backend
cp .env.example .env
# Preencha DATABASE_URL, JWT_SECRET e JWT_REFRESH_SECRET no .env.
npx prisma migrate dev --name init
npm run build
npm run start:dev
```

Depois de versionar a migração, a composição pode ser validada a partir de `gatti-backend`:

```bash
POSTGRES_PASSWORD='senha-do-banco' \
JWT_SECRET='segredo-de-acesso' \
JWT_REFRESH_SECRET='segredo-de-refresh' \
docker compose up --build
```

Os testes de aceitação devem incluir login de administrador provisionado, bloqueio de papéis sem permissão, criação e exclusão lógica de suprimento, entradas e saídas concorrentes de estoque, consulta de alertas e leitura de `GET /api/v1/health/ready` com o banco disponível e indisponível.
