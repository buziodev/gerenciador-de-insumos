# Descoberta local de impressoras via SNMP

O GATTI agora pode descobrir e sincronizar impressoras Ricoh sem depender do Zabbix. O backend executa uma varredura SNMP v2c na faixa configurada, consulta a identidade do dispositivo e aceita somente descrições que contenham **Ricoh P 311** ou **Ricoh M 320**.

> **Requisito de rede:** o processo do backend precisa executar em um host com rota direta para `192.168.2.0/24`. Um frontend hospedado fora dessa LAN não consegue descobrir impressoras apenas por estar aberto no navegador. A chamada deve chegar ao backend que está dentro da rede corporativa, ou a um agente local autorizado.

## Configuração

Defina as variáveis no ambiente do backend. Não grave a comunidade SNMP em código, no frontend ou no repositório.

```dotenv
SNMP_COMMUNITY=public
SNMP_PORT=161
SNMP_TIMEOUT_MS=750
SNMP_RETRIES=1
SNMP_DISCOVERY_START_IP=192.168.2.2
SNMP_DISCOVERY_END_IP=192.168.2.220
SNMP_DISCOVERY_CONCURRENCY=16
```

A comunidade `public` é apenas um valor de exemplo. Deve ser substituída pela comunidade somente leitura utilizada na rede. O serviço atual usa SNMP v2c; SNMPv3, com autenticação e privacidade, ainda não está implementado.

## Endpoints

| Endpoint | Papel mínimo | Finalidade |
| --- | --- | --- |
| `GET /api/v1/snmp/config` | Viewer | Exibe faixa, porta, versão, modelos e se a comunidade está configurada; nunca retorna a comunidade. |
| `POST /api/v1/snmp/discover` | Operator | Varre a faixa e retorna somente dispositivos Ricoh P 311/M 320 responsivos. Não grava dados. |
| `POST /api/v1/snmp/sync/printers` | Manager | Descobre e cria/atualiza impressoras, status, contador e níveis de toner. |

O frontend disponibiliza **Varrer SNMP** para Admin, Manager e Operator. O botão **Sincronizar SNMP** fica restrito a Admin e Manager, porque altera dados persistidos.

## Dados consultados

A identidade e o contador utilizam objetos padrão do sistema e da Printer-MIB v2: `sysDescr.0`, `sysName.0`, `hrDeviceDescr.1`, `hrDeviceStatus.1` e `prtMarkerLifeCount.1.1` (`1.3.6.1.2.1.43.10.2.1.4.1.1`). Para Ricoh, a leitura de número de série e toner usa a RicohPrivateMIB, incluindo `ricohEngSerialNumber.0`, a tabela de nomes de toner e a tabela de níveis de toner. A Printer-MIB define o modelo de informação para equipamentos de impressão e seus estados [1]. O template comunitário de Ricoh do Zabbix confirma os OIDs de descrição, contador, estado, toner e bandejas usados como referência de interoperabilidade [2]. A listagem da RicohPrivateMIB documenta o enterprise ID `367`, os objetos de identidade, contador e toner usados pelo adaptador [3].

Os valores de status são normalizados para `ONLINE`, `OFFLINE` ou `ERROR`. Uma resposta SNMP válida é considerada online quando o equipamento não informa estado de erro ou desligado. Valores de toner negativos ou indefinidos não são gravados como porcentagem.

## Operação recomendada

Primeiro execute a varredura sem persistência e confirme a quantidade de dispositivos encontrados. Em seguida, execute a sincronização administrativa. A operação é limitada a lotes concorrentes e cada IP possui timeout e número de tentativas configuráveis, evitando que um endereço sem resposta bloqueie indefinidamente o restante da rede.

Para homologar Ricoh reais, habilite SNMP somente leitura no equipamento, confirme a comunidade, permita UDP/161 entre o backend e a VLAN `192.168.2.0/24`, e valide os campos exibidos na tela. O ambiente de QA usado durante o desenvolvimento não tinha rota para essa rede e retornou 219 timeouts e zero dispositivos; isso valida o comportamento de ausência de resposta, mas não substitui o teste dentro da LAN real.

## Referências

[1]: https://datatracker.ietf.org/doc/html/rfc3805 "RFC 3805 — Printer MIB v2"

[2]: https://raw.githubusercontent.com/zabbix/community-templates/main/Printers/Ricoh/template_ricoh_snmp_printers/6.0/template_ricoh_snmp_printers.yaml "Zabbix Community Template — SNMP Ricoh Printers"

[3]: https://mibs.observium.org/mib/RicohPrivateMIB/ "Observium MIB Browser — RicohPrivateMIB"

<!-- Estilo: documentação operacional clara, sem prometer descoberta fora da rede do backend; configuração e limites ficam explícitos. -->
