# Validação técnica — GATTI Supply Management System

**Data:** 12 de agosto de 2026
**Escopo:** `gatti-backend` e `gatti-frontend` na cópia de trabalho versionável.

## Resultado de validação

O sistema foi executado contra um **PostgreSQL real e descartável**, com a migração inicial aplicada e um administrador provisionado por variáveis de ambiente. A API NestJS foi inicializada e uma suíte de integração HTTP percorreu autenticação, RBAC, CRUDs, estoque, relatórios, alertas, health checks e exclusões lógicas.

| Área | Evidência executada | Resultado |
|---|---|---|
| Backend NestJS | `npm run build` | Aprovado |
| Schema Prisma | `npx prisma validate` | Aprovado |
| Migração inicial | `npx prisma migrate deploy` em PostgreSQL limpo | Aprovado |
| Seed parametrizado | `npm run prisma:seed` com credenciais em variáveis de ambiente | Aprovado |
| API e regras de negócio | `npm run test:integration` contra API e banco reais | **61 asserções aprovadas; 0 falhas** |
| Frontend TypeScript | `pnpm check` | Aprovado |
| Build do frontend | `pnpm build` | Aprovado; persiste aviso de bundle acima de 500 kB |
| Login no navegador | Login administrativo via frontend e proxy Vite | Aprovado |
| Módulos no navegador | Dashboard, impressoras, suprimentos, estoque, alertas, relatórios e administração | Aprovado nos fluxos exercitados |
| Docker/Compose | Build e subida dos contêineres | Não executados; Docker não está disponível neste ambiente |

> O resultado comprova os fluxos listados nesta validação. Ele **não substitui** uma homologação de contêineres, uma configuração Zabbix real, testes de carga ou uma suíte formal de cobertura unitária.

## Cobertura da suíte de integração

A suíte `gatti-backend/scripts/integration-smoke.mjs` foi adicionada como `npm run test:integration`. Ela usa um administrador criado pelo seed e aplica as operações em PostgreSQL, sem dados de demonstração permanentes no código.

| Domínio | Casos exercitados |
|---|---|
| Autenticação | Rota protegida sem token, login inválido, login válido, refresh, logout e invalidação de refresh token |
| RBAC | Bloqueio de `VIEWER` em setor, suprimento e sincronização Zabbix |
| Usuários | Criar, listar, buscar, atualizar, alterar senha, alterar papel, soft delete e leitura posterior retornando 404 |
| Setores | Criar, listar, buscar, atualizar, soft delete e leitura posterior retornando 404 |
| Impressoras | Criar, listar, buscar, atualizar, métricas, soft delete e leitura posterior retornando 404 |
| Suprimentos | Criar com estoque inicial, listar, buscar, atualizar, consultar estoque e soft delete |
| Estoque | Configurar níveis, rejeitar mínimo/máximo inválidos, entrada, saída, rejeição de saldo insuficiente e listagens |
| Alertas | Criar, listar, listar ativos/críticos, consultar por impressora, reconhecer e resolver |
| Relatórios | Registrar solicitação, listar, consultar e obter resumos de consumo, custos, toner e inventário |
| Saúde | Aplicação inicializada com PostgreSQL e rota de prontidão vinculada ao banco |

## Defeitos reproduzidos e correções aplicadas

| Defeito confirmado | Correção aplicada | Regressão |
|---|---|---|
| Refresh token emitido no mesmo segundo podia repetir valor e violar unicidade de sessão | Inclusão de `jti` único e invalidação da sessão anterior antes de gerar a nova | Refresh HTTP aprovado |
| Módulos Nest que usam Prisma não importavam o provider | Importação de `PrismaModule` em usuários, setores e saúde | Bootstrap Nest aprovado |
| CRUD de usuários tentava selecionar o campo inexistente `sectorId` | DTO e serviço alinhados ao modelo Prisma; leituras respeitam soft delete | CRUD de usuários aprovado |
| Setores usavam `code` e relação `users`, ausentes do schema | Contrato alinhado a `costCenter`, `manager` e relação com impressoras | CRUD de setores aprovado |
| Busca de impressoras aplicava `contains` em coluna PostgreSQL `inet` | Busca textual permanece em nome/hostname e IP aceita comparação exata válida | Listagem HTTP e frontend aprovadas |
| Relatórios sem período construíam `Invalid Date` | Janela padrão de 30 dias e validação de intervalo | Três resumos aprovados |
| Paginação recebia `skip` e `take` como texto e falhava no Prisma | Conversão implícita na `ValidationPipe` | Frontend passou a carregar listas com `take=100` |
| Autorias podiam ser enviadas pelo cliente | Estoque, reconhecimento de alerta e relatório derivam autoria do JWT; contratos do frontend foram atualizados | Asserções de autoria aprovadas |
| Administração era uma tela de placeholder | CRUD real de usuários e setores com tabelas, formulários, edição, troca de papel e exclusão | Criação e edição validadas no navegador; exclusões cobertas pela suíte HTTP |
| Dashboard exibia indicadores e listas simulados | Indicadores e estados vazios agora provêm das APIs de impressoras, alertas e estoque crítico | Validado no navegador |

## Fluxos de interface observados

O navegador confirmou o redirecionamento sem sessão para `/auth/login`, o login administrativo e a renderização autenticada das rotas de módulos. As páginas de impressoras e suprimentos carregaram corretamente a paginação; estoque e alertas mostraram registros criados pela suíte; relatórios exibiram a solicitação persistida.

A administração deixou de exibir o placeholder anterior. Foi criado pela interface o usuário temporário `usuario.ui@gatti.test`, que teve seu papel atualizado de **Visualizador** para **Gerente**. Também foi criado e atualizado o setor temporário **Operações de Teste**. A tentativa de confirmação do soft delete de setor foi interrompida pelo diálogo nativo do navegador; essa mesma operação foi concluída e validada na suíte HTTP.

As notas detalhadas de navegação e evidências estão em [`TEST_NOTES.md`](./TEST_NOTES.md).

## Limitações objetivas para homologação

| Pendência | Situação atual | Ação necessária |
|---|---|---|
| Docker/Compose | Arquivos foram revisados, mas não executados localmente | Rodar `docker compose build` e `docker compose up` em ambiente com Docker/Compose |
| Redis e filas | Não foram exercitados como dependência operacional completa | Homologar filas e jobs se forem habilitados no fluxo de produção |
| Zabbix | Sem URL, credenciais e mapeamento de itens fornecidos | Configurar segredos e validar sincronização com host de homologação |
| WebSocket | Não implementado; alertas usam polling | Confirmar necessidade operacional antes de introduzir canal em tempo real |
| Cobertura automatizada formal | Há suíte de integração executável, mas não há Jest/Vitest com cobertura percentual | Adicionar testes unitários e relatório de cobertura no pipeline CI |
| Bundle do frontend | `pnpm build` alerta para chunk acima de 500 kB | Medir carregamento real e aplicar code splitting se necessário |

## Procedimento reproduzível de integração

Em um PostgreSQL descartável, crie um banco e um usuário exclusivos. Depois, aplique a migração, crie o administrador por ambiente, inicie a API e execute a suíte. Os valores de exemplo abaixo devem ser substituídos por segredos em qualquer ambiente não temporário.

```bash
cd gatti-backend
export DATABASE_URL='postgresql://USUARIO:SENHA@HOST:5432/gatti_test'
export INITIAL_ADMIN_EMAIL='admin@example.test'
export INITIAL_ADMIN_PASSWORD='senha-temporaria-forte'
export INITIAL_ADMIN_FIRST_NAME='Admin'
export INITIAL_ADMIN_LAST_NAME='Homologação'

npx prisma migrate deploy
npm run prisma:seed
npm run build

# Em outro terminal, inicie a API com JWT_SECRET e JWT_REFRESH_SECRET definidos.
npm run test:integration
```

Para contêineres, a validação deve ser executada a partir de `gatti-backend` com `POSTGRES_PASSWORD`, `JWT_SECRET` e `JWT_REFRESH_SECRET` definidos no ambiente. Não inclua esses valores em arquivos versionados.
