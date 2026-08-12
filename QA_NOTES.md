# Evidências da rodada independente de QA

## Autenticação

Uma rota protegida sem sessão direcionou corretamente para `/auth/login`. Com senha inválida, a interface permaneceu no formulário, limpou os campos e exibiu a mensagem **“Email ou senha inválidos. Tentativas restantes: 4”**. Esse comportamento comunica a falha sem expor a credencial válida.

Com as credenciais administrativas de QA, o login retornou ao dashboard, exibiu confirmação visual de sucesso e identificou a sessão como `ADMIN`. O dashboard respondeu com contagens reais em zero e estados vazios coerentes com a base recém-criada.

O alternador de tema mudou o dashboard e a administração para o modo escuro, preservando legibilidade de cartões, tabelas, navegação lateral e ações. A navegação para Administração permaneceu funcional.

O administrador criou com sucesso o usuário temporário `viewer.qa@gatti.test` com papel **Visualizador**. A tabela administrativa foi atualizada de um para dois registros e apresentou confirmação de sucesso.

Após logout e novo login, o perfil Viewer foi aceito, exibiu identificação correta e acessou o dashboard em modo de leitura. A navegação lateral ocultou a opção **Administração**, como esperado para esse papel.

### Defeito QA-001 — rota administrativa acessível diretamente por Viewer

Apesar de a navegação ocultar Administração para Viewer, a URL direta `/admin` inicialmente renderizava a tela administrativa e seus controles. As consultas não autorizadas retornavam uma lista vazia, mas a página poderia induzir tentativa de operações indevidas. A rota foi corrigida com `requiredRoles={[UserRole.ADMIN]}`. Na regressão imediata, o mesmo acesso Viewer redirecionou para `/403` e exibiu **Acesso Negado**.

### Defeito QA-002 — controles de escrita visíveis para Viewer

O perfil Viewer inicialmente visualizou **Nova impressora** em `/printers`, embora não tivesse autorização para criar registros. Foram aplicadas verificações de permissão de criação, atualização e exclusão em impressoras e suprimentos, e de criação ou atualização em estoque, relatórios e alertas. Após a correção, a página de impressoras manteve a leitura e o campo de busca, mas removeu o botão de criação para Viewer.

Como regressão visual, os módulos de **Suprimentos** e **Estoque** também preservaram listagem e busca para Viewer, sem expor os controles **Novo suprimento** ou **Nova movimentação**.

As telas de **Alertas** e **Relatórios** mantiveram a consulta para Viewer, sem apresentar as ações de reconhecer, resolver ou solicitar novo relatório. A correção de controles de escrita por perfil foi confirmada nos cinco módulos afetados.

## Fluxos operacionais como administrador

No módulo de suprimentos, o envio de formulário vazio manteve o diálogo aberto e exibiu a validação **“Informe nome, fabricante, capacidade inteira positiva e custo positivo.”**. A interface não disparou uma chamada inválida para a API.

Com dados válidos, o suprimento **Toner QA Preto** foi criado. A interface confirmou o sucesso e atualizou a tabela para um registro, exibindo fabricante, capacidade nominal e custo formatado.

Foi registrada uma entrada de **10** unidades para o suprimento de QA. A confirmação apareceu na interface e a tabela passou a mostrar uma movimentação do tipo Entrada, com quantidade, motivo e data consistentes.

Em seguida, uma saída de **999** unidades foi submetida para o mesmo suprimento, cujo saldo disponível era 10. A API rejeitou a requisição; a interface exibiu a mensagem **“Não foi possível registrar a movimentação.”** e a tabela permaneceu com apenas a entrada original. Isso confirma, no fluxo exercitado, que a operação não gera saldo negativo.

No módulo de impressoras, o administrador cadastrou o ativo **Impressora QA**, associado ao host `zbx-qa-001`, IP `192.168.1.200`, fabricante HP, modelo LaserJet QA e status ONLINE. A tabela e os indicadores foram atualizados para uma impressora online. Na sequência, a edição para **Impressora QA Revisada** foi confirmada visualmente na listagem após resposta de sucesso da API.

O fluxo de exclusão da impressora também foi concluído. Após confirmação, o ativo deixou de aparecer na tabela e os indicadores retornaram a zero, comportamento compatível com exclusão lógica. A confirmação nativa do navegador bloqueou o acionamento convencional de automação; a confirmação foi aceita programaticamente apenas para permitir a execução do cenário funcional da aplicação.

Para validar o tratamento operacional, foi criado via API um alerta temporário do tipo LOW_TONER e severidade WARNING. A tela de Alertas o exibiu como **Ativo**, com as ações **Reconhecer** e **Resolver**. Ao reconhecer, a interface confirmou a operação e removeu apenas a ação Reconhecer; ao resolver, confirmou o encerramento, apresentou status **Resolvido** e ocultou todas as ações de tratamento.

No módulo de relatórios, uma solicitação sem título foi bloqueada localmente com a mensagem **“Informe um título para solicitar o relatório.”**. Com o título **Relatório de consumo QA funcional** e o tipo Consumo mensal, a API registrou a solicitação, a listagem foi atualizada para um registro e apresentou corretamente o estado **Em processamento**, pois não há `fileUrl` preenchido.

O dashboard foi conferido inicialmente após o encerramento dos dados transitórios e apresentou estados vazios coerentes. Com uma impressora online e um alerta ativo temporários criados para a validação, a nova consulta exibiu **1** impressora total, **1 de 1** online, **1** alerta ativo e a mensagem do alerta recente. Os indicadores, portanto, refletem dados retornados pela API e não valores estáticos.

Na Administração, as tabelas de usuários e setores foram consultadas com os registros criados anteriormente. O usuário temporário `viewer.qa@gatti.test` foi removido e a listagem passou de dois para um usuário. Como não havia setor disponível após os testes anteriores, foi criado o **Setor QA Temporário**, que apareceu na tabela com o centro de custo `CC-QA-001` e foi removido em seguida, retornando a listagem ao estado vazio. Esses cenários confirmam as exclusões lógicas no fluxo administrativo.

## Observabilidade da rodada

O console do navegador não apresentou erros de aplicação durante os cenários executados. A revisão dos registros de rede confirmou respostas 200/201 para consultas e criações e 204 para as exclusões lógicas exercitadas, seguidas pelas consultas de atualização das tabelas. As respostas 400 observadas durante a rodada corresponderam aos cenários negativos deliberados (formulários inválidos e saída de estoque sem saldo), portanto não foram classificadas como falhas não tratadas.

## Regressão final

Após as correções de RBAC e a rodada funcional, o frontend concluiu `pnpm check` e `pnpm build` com sucesso. O backend concluiu `npm run build` com sucesso. A base PostgreSQL descartável `gatti_qa` foi reinicializada com as migrations e o administrador de QA, e a API foi reiniciada na porta 3001. A suíte `npm run test:integration` foi executada contra essa API limpa com **61 verificações aprovadas e 0 falhas**.
