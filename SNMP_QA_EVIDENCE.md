# Evidência inicial da integração SNMP

A página `/printers` abriu com sessão administrativa e exibiu os controles **Varrer SNMP** e **Sincronizar SNMP**. O texto de configuração mostrou SNMP 2c, a faixa `192.168.2.2–192.168.2.220`, os modelos Ricoh P 311/M 320 e comunidade não configurada no ambiente de QA.

A varredura foi acionada pela interface. Após o clique, os controles SNMP ficaram desabilitados enquanto o scan estava em andamento, indicando estado de operação ocupado. A base de QA estava vazia, portanto não havia impressoras para listar antes do teste.

A chamada feita pela interface para `POST /api/v1/snmp/discover` retornou HTTP 201 em aproximadamente 21 segundos, com `scanned: 219`, `discovered: 0` e a faixa correta. O console não apresentou exceção de frontend. O ambiente de QA não está conectado à rede das impressoras e a comunidade SNMP não está configurada, portanto o resultado vazio é esperado e não comprova ausência de dispositivos na rede real.

A API respondeu HTTP 200 em `GET /api/v1/snmp/config` com a configuração esperada e sem expor a comunidade. A sincronização administrativa respondeu HTTP 201 com `scanned: 219`, `discovered: 0`, `created: 0` e `updated: 0`, sem inserir dados indevidos. Após a criação de um usuário Viewer temporário, as chamadas `POST /api/v1/snmp/discover` e `POST /api/v1/snmp/sync/printers` retornaram HTTP 403.

Após a revisão de segurança, o comportamento foi endurecido: `SNMP_COMMUNITY` passou a ser obrigatória para `discover()` e `syncPrinters()`. Sem ela, a API responde HTTP 400 com mensagem de configuração pendente e a interface mantém os controles desabilitados, em vez de tentar a comunidade padrão. A regressão final em base limpa permaneceu com 61 assertions aprovadas e 0 falhas.
