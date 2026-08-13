# GATTI Supply Management System

Sistema corporativo de gestão de impressoras, suprimentos, estoque e relatórios analíticos, integrado com Zabbix e suporte nativo à descoberta e monitoramento de ativos via SNMP. **Totalmente dockerizado para deploy simplificado com um único comando.**

## 📁 Estrutura do Repositório

```
gerenciador-de-insumos/
├── gatti-backend/          # Backend NestJS (API REST, Prisma ORM, RBAC, SNMP)
├── gatti-frontend/         # Frontend Vite + React 19 + TypeScript + Nginx
├── docker-compose.yml      # Orquestração Docker de todo o ecossistema
├── .env.docker             # Exemplo de variáveis de ambiente para Docker
├── SNMP_SETUP.md           # Guia operacional da varredura SNMP sem Zabbix
└── SNMP_QA_EVIDENCE.md     # Evidências de testes funcionais e de integração
```

---

## 🐳 Deploy Completo com Docker (Recomendado)

Para colocar toda a aplicação (PostgreSQL, Backend NestJS e Frontend Nginx) em funcionamento em qualquer servidor Linux ou ambiente com Docker, siga os passos abaixo:

### 1. Pré-requisitos
- **Docker** (versão 24+)
- **Docker Compose** (versão 2+ ou plugin `docker compose`)

### 2. Clonar o Repositório
```bash
git clone https://github.com/buziodev/gerenciador-de-insumos.git
cd gerenciador-de-insumos
```

### 3. Configurar Variáveis de Ambiente (Opcional)
Se desejar alterar senhas, chaves JWT ou a comunidade SNMP padrão (`public`), edite o arquivo `.env.docker` ou defina as variáveis diretamente. Por padrão, o arquivo já vem pronto para uso imediato em homologação/testes.

### 4. Subir toda a Estrutura
Execute o comando de construção e subida dos containers em segundo plano:

```bash
docker compose up --build -d
```

O **Docker Compose** fará automaticamente:
1. Subida do banco **PostgreSQL 15** com volume persistente.
2. Build da imagem do **Backend NestJS**, execução das migrações do Prisma, aplicação do seed inicial e inicialização da API na porta `3001`.
3. Build da imagem do **Frontend Vite/React** otimizado e servido via **Nginx** na porta `80`.

### 5. Acesso ao Sistema
- **Aplicação Web (Frontend)**: `http://localhost` (porta 80)
- **API REST / Swagger**: `http://localhost:3001/api/v1/docs`

#### Credenciais Iniciais Criadas pelo Seed:
- **Email**: `admin@gatti.test`
- **Senha**: `AdminPassword-2026!`

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

## 🔄 Descoberta SNMP Nativa (Comunidade `public`)

Para ambientes que não utilizam Zabbix, o GATTI possui um módulo SNMP embutido capaz de varrer a faixa de IP configurada (`192.168.2.2–192.168.2.220`), identificar impressoras **Ricoh P 311** e **Ricoh M 320**, e sincronizar contadores de páginas e níveis de toner por cor [1] [2] [3].

1. **Configuração**: O Docker Compose já injeta `SNMP_COMMUNITY=public`.
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
