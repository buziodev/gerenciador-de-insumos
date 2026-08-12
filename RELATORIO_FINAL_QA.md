# Relatório Final de QA — GATTI Supply Management System

**Data da rodada:** 12 de agosto de 2026
**Ambiente exercitado:** frontend local na porta 3200, API NestJS na porta 3001 e PostgreSQL descartável `gatti_qa`.
**Escopo:** autenticação, autorização por papel, módulos operacionais, administração, persistência transacional de estoque, integração HTTP entre frontend e backend, builds e suíte de integração.

> **Conclusão de QA:** os cenários funcionais definidos para esta rodada foram concluídos e as regressões de compilação e integração passaram. Este resultado não substitui uma homologação em infraestrutura de produção nem valida integrações externas ainda não configuradas.

## Resultado executivo

| Área verificada | Resultado | Evidência principal |
| --- | --- | --- |
| Autenticação e sessão | Aprovado | Redirecionamento sem sessão, rejeição de login inválido, login administrativo, renovação e logout foram exercitados. |
| RBAC de frontend | Aprovado após correção | Viewer foi bloqueado em `/admin` e deixou de visualizar controles de escrita nos cinco módulos afetados. |
| Administração | Aprovado | Usuários e setores foram consultados, criados/atualizados em cenários anteriores e removidos logicamente nesta rodada. |
| Suprimentos e estoque | Aprovado | Criação de suprimento, entrada de 10 unidades e rejeição de saída de 999 unidades acima do saldo. |
| Impressoras | Aprovado | Criação, atualização e exclusão lógica, com atualização de tabela e indicadores. |
| Alertas | Aprovado | Criação, reconhecimento e resolução, com transições corretas de ações e status. |
| Relatórios | Aprovado no escopo de solicitação | Validação de título, registro da solicitação e exibição de estado `Em processamento`. |
| Dashboard | Aprovado | Indicadores refletiram uma impressora online e um alerta ativo criados para o teste. |
| Compilação | Aprovado | `pnpm check`, `pnpm build` e `npm run build` concluídos com sucesso. |
| Integração de API | Aprovado | Suíte contra base limpa `gatti_qa`: **61 verificações aprovadas, 0 falhas**. |

## Defeitos encontrados e corrigidos

| ID | Severidade | Achado | Correção aplicada | Regressão executada |
| --- | --- | --- | --- | --- |
| QA-001 | Alta | O perfil Viewer alcançava a tela administrativa pela URL direta `/admin`. | A rota passou a exigir `UserRole.ADMIN`. | Acesso direto como Viewer redirecionou para `/403`. |
| QA-002 | Alta | Botões de escrita estavam visíveis para Viewer, apesar da API já negar as ações. | Controles de criação, alteração, exclusão, reconhecimento e resolução passaram a respeitar `useCanAccess`. | Viewer manteve apenas leitura em Impressoras, Suprimentos, Estoque, Alertas e Relatórios. |

As mudanças de produção de interface foram publicadas no commit `cd53f6d` (`fix(qa): proteger rotas e controles de escrita por papel RBAC`). O fechamento documental foi publicado em `ece77fe`.

## Cenários funcionais exercitados

O login sem sessão levou à página de autenticação. Uma senha incorreta retornou mensagem de erro com tentativas restantes, enquanto o login administrativo retornou ao dashboard. O modo escuro foi alternado sem perda perceptível de legibilidade. A política de acesso foi confirmada tanto pela navegação quanto pelo acesso direto a rota protegida.

No módulo de suprimentos, o formulário vazio foi bloqueado no cliente e um novo toner de QA foi criado. Uma entrada de 10 unidades gerou movimentação persistida. A tentativa de saída de 999 unidades, com saldo disponível de 10, foi rejeitada sem adicionar movimentação, validando a proteção contra saldo negativo no fluxo exercitado.

No módulo de impressoras, foi criado um ativo com dados Zabbix de teste, editado e removido logicamente. A tabela e os cartões de contagem acompanharam cada operação. Nos alertas, o registro ativo de QA exibiu as ações previstas; após reconhecimento, a ação correspondente desapareceu e, após resolução, o status mudou para Resolvido e as ações foram removidas.

Em relatórios, uma solicitação vazia foi bloqueada por falta de título. A solicitação válida apareceu imediatamente na listagem como `Em processamento`, que é o comportamento esperado enquanto não houver `fileUrl` produzido por processamento posterior. O dashboard foi carregado primeiro em estado vazio e depois com dados ativos controlados, refletindo `1` impressora, `1` impressora online e `1` alerta ativo.

## Validações técnicas

| Comando ou verificação | Resultado | Observação |
| --- | --- | --- |
| `pnpm check` no frontend | Aprovado | Verificação TypeScript concluída sem erro. |
| `pnpm build` no frontend | Aprovado com aviso não bloqueante | O Vite emitiu aviso de bundle JavaScript acima de 500 kB após minificação. |
| `npm run build` no backend | Aprovado | Compilação NestJS concluída. |
| Reset de `gatti_qa` + migrations + seed | Aprovado | Base descartável recriada e administrador de QA semeado. |
| `npm run test:integration` | Aprovado | 61 verificações aprovadas e 0 falhas. |
| Console e rede do navegador | Aprovado | Sem erros de aplicação observados; respostas 400 vistas foram negativas esperadas de teste. |

## Limitações e pendências para uma liberação produtiva

O resultado acima atesta apenas o ambiente local descartável utilizado. A integração Zabbix não foi homologada contra instância real porque ainda não foram fornecidos URL, credenciais e mapeamento de hosts/itens. A autorização de rota de sincronização foi testada, mas não se deve inferir conectividade real com Zabbix a partir disso.

O processamento assíncrono de arquivos de relatório não foi validado: a API registra a solicitação, enquanto a geração e o preenchimento de `fileUrl` dependem do fluxo de processamento configurado para o ambiente. Redis, BullMQ e notificações WebSocket também não foram exercitados operacionalmente nesta rodada. A adoção de WebSocket deve ser guiada por necessidade operacional comprovada; o frontend já realiza consulta controlada para os dados em tela.

Ainda faltam homologação de Docker e infraestrutura, testes de carga, observabilidade centralizada, testes de recuperação de falhas e execução automatizada em CI. O aviso de bundle do frontend não bloqueou o build, mas recomenda-se separar módulos por importação dinâmica antes de uma operação de grande escala.

## Critérios para homologação e implantação

| Etapa | Ação necessária |
| --- | --- |
| Configuração | Prover variáveis reais de produção, incluindo `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `APP_PORT`, credenciais Redis quando aplicável e configuração Zabbix validada. |
| Banco de dados | Executar migrations com backup e plano de reversão; não reutilizar a base `gatti_qa`. |
| Backend | Executar `npm run build` e iniciar com `npm run start:prod`; validar `/api/v1/health`, `/api/v1/health/ready` e `/api/v1/health/live`. |
| Frontend | Executar `pnpm check` e `pnpm build`; configurar o host para encaminhar `/api/v1` à API correta. |
| Segurança | Criar administrador inicial com segredo fora do repositório, restringir CORS ao domínio oficial, encerrar credenciais temporárias de QA e manter rate limiting ativo. |
| Homologação | Repetir os fluxos de negócio críticos com dados representativos e integrar Zabbix somente após validar mapeamentos e permissões. |

## Rastreabilidade no repositório

Os detalhes observacionais desta rodada estão preservados em `QA_NOTES.md`; a relação de itens executados está em `QA_CHECKLIST.md`. O código e a documentação foram enviados para a branch `main` de [`buziodev/gerenciador-de-insumos`](https://github.com/buziodev/gerenciador-de-insumos).
