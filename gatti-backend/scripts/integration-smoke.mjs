const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3101/api/v1';
const adminEmail = process.env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('Defina TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD para executar a integração.');
}

const results = [];

async function request(name, path, options = {}, expectedStatuses = [200]) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let body = raw;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    // A resposta sem JSON ainda é registrada no diagnóstico.
  }

  const passed = expectedStatuses.includes(response.status);
  results.push({ name, status: response.status, expectedStatuses, passed, body });
  if (!passed) {
    const error = new Error(`${name}: esperado ${expectedStatuses.join('/')} e recebido ${response.status}`);
    error.responseBody = body;
    throw error;
  }
  return body;
}

const post = (name, path, payload, headers, statuses) =>
  request(name, path, { method: 'POST', body: JSON.stringify(payload), headers }, statuses);
const patch = (name, path, payload, headers, statuses) =>
  request(name, path, { method: 'PATCH', body: JSON.stringify(payload), headers }, statuses);
const remove = (name, path, headers, statuses) =>
  request(name, path, { method: 'DELETE', headers }, statuses);

try {
  await request('rota protegida sem token', '/printers', {}, [401]);
  await post('login inválido', '/auth/login', { email: adminEmail, password: 'senha-incorreta' }, {}, [400]);

  const adminSession = await post('login administrador', '/auth/login', {
    email: adminEmail,
    password: adminPassword,
  }, {}, [200]);
  const adminHeaders = { authorization: `Bearer ${adminSession.accessToken}` };
  const adminId = adminSession.user.id;

  const refreshedSession = await post('renovar token', '/auth/refresh', {
    refreshToken: adminSession.refreshToken,
  }, {}, [200]);
  const refreshedHeaders = { authorization: `Bearer ${refreshedSession.accessToken}` };

  const viewer = await post('criar usuário viewer', '/users', {
    firstName: 'Viewer',
    lastName: 'Integration',
    email: 'viewer.integration@gatti.test',
    password: 'Viewer-Integration-2026!',
    role: 'VIEWER',
  }, refreshedHeaders, [201]);
  const viewerId = viewer.id;

  await request('listar usuários como administrador', '/users', { headers: refreshedHeaders }, [200]);
  await request('obter usuário viewer como administrador', `/users/${viewerId}`, { headers: refreshedHeaders }, [200]);
  await patch('atualizar usuário viewer', `/users/${viewerId}`, {
    firstName: 'Viewer Atualizado',
  }, refreshedHeaders, [200]);
  await patch('alterar senha do viewer', `/users/${viewerId}/password`, {
    currentPassword: 'Viewer-Integration-2026!',
    newPassword: 'Viewer-Integration-2026-Atualizada!',
  }, refreshedHeaders, [200]);
  await patch('alterar papel do viewer', `/users/${viewerId}/role`, {
    role: 'VIEWER',
  }, refreshedHeaders, [200]);

  const viewerSession = await post('login viewer', '/auth/login', {
    email: 'viewer.integration@gatti.test',
    password: 'Viewer-Integration-2026-Atualizada!',
  }, {}, [200]);
  const viewerHeaders = { authorization: `Bearer ${viewerSession.accessToken}` };

  await post('viewer bloqueado ao criar setor', '/sectors', {
    name: 'Setor não autorizado',
  }, viewerHeaders, [403]);
  await post('viewer bloqueado ao criar suprimento', '/supplies', {
    name: 'Suprimento não autorizado',
    type: 'TONER',
    manufacturer: 'GATTI',
    nominalCapacity: 1,
    unitCost: 1,
  }, viewerHeaders, [403]);

  const sector = await post('criar setor', '/sectors', {
    name: 'Integração',
    costCenter: 'CC-INT-001',
    manager: 'Gestão de Integração',
    description: 'Setor exclusivo da bateria de integração',
  }, refreshedHeaders, [201]);
  await request('listar setores', '/sectors?search=Integração', { headers: refreshedHeaders }, [200]);
  await request('obter setor', `/sectors/${sector.id}`, { headers: refreshedHeaders }, [200]);
  await patch('atualizar setor', `/sectors/${sector.id}`, {
    description: 'Setor atualizado na integração',
  }, refreshedHeaders, [200]);

  const printer = await post('criar impressora', '/printers', {
    zabbixHostId: 'integration-host-001',
    name: 'Impressora Integração',
    hostname: 'printer-integration.gatti.test',
    ipAddress: '10.20.30.40',
    model: 'GATTI Test Printer',
    manufacturer: 'GATTI',
    serialNumber: 'GATTI-INT-001',
    group: 'Integração',
    status: 'ONLINE',
    sectorId: sector.id,
  }, refreshedHeaders, [201]);
  await request('listar impressoras', '/printers?search=Integração', { headers: refreshedHeaders }, [200]);
  await request('obter impressora', `/printers/${printer.id}`, { headers: refreshedHeaders }, [200]);
  await patch('atualizar impressora', `/printers/${printer.id}`, {
    status: 'MAINTENANCE',
  }, refreshedHeaders, [200]);
  await request('métricas da impressora', `/printers/${printer.id}/metrics?days=7`, { headers: refreshedHeaders }, [200]);

  const supply = await post('criar suprimento com estoque inicial', '/supplies', {
    name: 'Toner Integração',
    type: 'TONER',
    manufacturer: 'GATTI',
    model: 'INT-001',
    compatibleModels: ['GATTI Test Printer'],
    nominalCapacity: 1000,
    unitCost: 75.5,
  }, refreshedHeaders, [201]);
  await request('listar suprimentos', '/supplies?search=Integração', { headers: refreshedHeaders }, [200]);
  await request('obter suprimento', `/supplies/${supply.id}`, { headers: refreshedHeaders }, [200]);
  await patch('atualizar suprimento', `/supplies/${supply.id}`, {
    unitCost: 80,
  }, refreshedHeaders, [200]);
  await request('obter estoque inicial do suprimento', `/supplies/${supply.id}/stock`, { headers: refreshedHeaders }, [200]);

  await patch('definir níveis de estoque válidos', `/stock/${supply.id}/levels`, {
    minimumLevel: 2,
    maximumLevel: 12,
  }, refreshedHeaders, [200]);
  await patch('rejeitar níveis de estoque inválidos', `/stock/${supply.id}/levels`, {
    minimumLevel: 10,
    maximumLevel: 2,
  }, refreshedHeaders, [400]);

  const entry = await post('entrada de estoque com autoria derivada do JWT', '/stock/movements', {
    supplyId: supply.id,
    type: 'ENTRY',
    quantity: 5,
    reason: 'Entrada de integração',
  }, refreshedHeaders, [201]);
  if (entry.createdBy !== adminId) {
    throw new Error('A movimentação de estoque não derivou createdBy do JWT.');
  }
  await post('saída de estoque dentro do saldo', '/stock/movements', {
    supplyId: supply.id,
    type: 'EXIT',
    quantity: 3,
    reason: 'Saída de integração',
  }, refreshedHeaders, [201]);
  await post('rejeitar saída acima do saldo', '/stock/movements', {
    supplyId: supply.id,
    type: 'LOSS',
    quantity: 3,
    reason: 'Perda acima do saldo',
  }, refreshedHeaders, [400]);
  await request('listar movimentações', `/stock/movements?supplyId=${supply.id}`, { headers: refreshedHeaders }, [200]);
  await request('listar níveis de estoque', '/stock/levels', { headers: refreshedHeaders }, [200]);
  await request('listar estoque crítico', '/stock/critical', { headers: refreshedHeaders }, [200]);

  const alert = await post('criar alerta', '/alerts', {
    printerId: printer.id,
    type: 'LOW_TONER',
    severity: 'WARNING',
    message: 'Alerta criado pela integração',
  }, refreshedHeaders, [201]);
  await request('listar alertas', '/alerts', { headers: refreshedHeaders }, [200]);
  await request('listar alertas ativos', '/alerts/active', { headers: refreshedHeaders }, [200]);
  await request('listar alertas críticos', '/alerts/critical', { headers: refreshedHeaders }, [200]);
  await request('listar alertas por impressora', `/alerts/printer/${printer.id}`, { headers: refreshedHeaders }, [200]);
  await request('obter alerta', `/alerts/${alert.id}`, { headers: refreshedHeaders }, [200]);
  const acknowledgedAlert = await patch('reconhecer alerta com autoria do JWT', `/alerts/${alert.id}/acknowledge`, {}, refreshedHeaders, [200]);
  if (acknowledgedAlert.acknowledgedBy !== adminId) {
    throw new Error('O alerta não derivou acknowledgedBy do JWT.');
  }
  await patch('resolver alerta', `/alerts/${alert.id}/resolve`, {}, refreshedHeaders, [200]);

  const report = await post('gerar relatório', '/reports', {
    type: 'STOCK_INVENTORY',
    title: 'Inventário da integração',
    description: 'Relatório gerado no teste de integração',
    filters: { sectorId: sector.id },
  }, refreshedHeaders, [201]);
  if (report.generatedBy !== adminId) {
    throw new Error('O relatório não derivou generatedBy do JWT.');
  }
  await request('listar relatórios', '/reports', { headers: refreshedHeaders }, [200]);
  await request('obter relatório', `/reports/${report.id}`, { headers: refreshedHeaders }, [200]);
  await request('resumo de consumo', '/reports/consumption/monthly', { headers: refreshedHeaders }, [200]);
  await request('resumo de custos', '/reports/costs/summary', { headers: refreshedHeaders }, [200]);
  await request('resumo de trocas de toner', '/reports/toner-changes/summary', { headers: refreshedHeaders }, [200]);
  await request('inventário de estoque', '/reports/stock/inventory', { headers: refreshedHeaders }, [200]);

  await post('viewer bloqueado na sincronização Zabbix', '/zabbix/sync/printers', {}, viewerHeaders, [403]);

  await remove('soft delete do suprimento', `/supplies/${supply.id}`, refreshedHeaders, [204]);
  await request('suprimento excluído não é acessível', `/supplies/${supply.id}`, { headers: refreshedHeaders }, [404]);
  await remove('soft delete da impressora', `/printers/${printer.id}`, refreshedHeaders, [204]);
  await request('impressora excluída não é acessível', `/printers/${printer.id}`, { headers: refreshedHeaders }, [404]);
  await remove('soft delete do setor', `/sectors/${sector.id}`, refreshedHeaders, [204]);
  await request('setor excluído não é acessível', `/sectors/${sector.id}`, { headers: refreshedHeaders }, [404]);
  await remove('soft delete do usuário viewer', `/users/${viewerId}`, refreshedHeaders, [204]);
  await request('usuário excluído não é acessível', `/users/${viewerId}`, { headers: refreshedHeaders }, [404]);

  await post('logout administrador', '/auth/logout', {}, refreshedHeaders, [200]);
  await post('refresh inválido após logout', '/auth/refresh', {
    refreshToken: refreshedSession.refreshToken,
  }, {}, [401, 400]);
} catch (error) {
  console.error(JSON.stringify({ error: error.message, responseBody: error.responseBody, results }, null, 2));
  process.exitCode = 1;
} finally {
  if (process.exitCode !== 1) {
    console.log(JSON.stringify({ passed: results.length, results }, null, 2));
  }
}
