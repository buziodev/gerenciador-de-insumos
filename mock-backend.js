const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'gatti-secret-dev-key-change-in-production';

// Middleware
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mock data
const mockUser = {
  id: 'user-1',
  email: 'admin@gatti.com',
  firstName: 'Admin',
  lastName: 'GATTI',
  role: 'ADMIN',
};

const mockPrinters = [
  {
    id: 'printer-1',
    name: 'HP LaserJet Pro M404n',
    ipAddress: '192.168.1.100',
    serialNumber: 'SN001',
    model: 'M404n',
    location: 'Sala 1',
    sectorId: 'sector-1',
    status: 'ONLINE',
    tonerLevel: 85,
    pageCount: 15000,
    createdAt: new Date(),
  },
  {
    id: 'printer-2',
    name: 'Canon imageCLASS MF445dw',
    ipAddress: '192.168.1.101',
    serialNumber: 'SN002',
    model: 'MF445dw',
    location: 'Sala 2',
    sectorId: 'sector-1',
    status: 'ONLINE',
    tonerLevel: 60,
    pageCount: 25000,
    createdAt: new Date(),
  },
];

const mockSupplies = [
  {
    id: 'supply-1',
    name: 'Toner HP 26A',
    sku: 'HP-26A',
    type: 'TONER',
    manufacturer: 'HP',
    unitCost: 85.50,
    minStock: 10,
    maxStock: 50,
    currentStock: 25,
  },
  {
    id: 'supply-2',
    name: 'Toner Canon 329',
    sku: 'CANON-329',
    type: 'TONER',
    manufacturer: 'Canon',
    unitCost: 75.00,
    minStock: 10,
    maxStock: 50,
    currentStock: 18,
  },
];

const mockAlerts = [
  {
    id: 'alert-1',
    printerId: 'printer-1',
    type: 'LOW_TONER',
    severity: 'WARNING',
    message: 'Toner baixo na impressora HP LaserJet Pro M404n',
    isResolved: false,
    createdAt: new Date(),
  },
  {
    id: 'alert-2',
    printerId: 'printer-2',
    type: 'OFFLINE',
    severity: 'CRITICAL',
    message: 'Impressora Canon imageCLASS MF445dw offline',
    isResolved: false,
    createdAt: new Date(),
  },
];

// Auth Endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Mock validation
  if (email === 'admin@gatti.com' && password === 'admin123') {
    const token = jwt.sign({ ...mockUser }, JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ userId: mockUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      accessToken: token,
      refreshToken: refreshToken,
      user: mockUser,
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  try {
    jwt.verify(refreshToken, JWT_SECRET);
    const token = jwt.sign({ ...mockUser }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      accessToken: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Printers Endpoints
app.get('/api/v1/printers', (req, res) => {
  res.json({
    data: mockPrinters,
    pagination: {
      total: mockPrinters.length,
      skip: 0,
      take: 10,
      pages: 1,
    },
  });
});

app.get('/api/v1/printers/:id', (req, res) => {
  const printer = mockPrinters.find((p) => p.id === req.params.id);
  if (printer) {
    res.json(printer);
  } else {
    res.status(404).json({ message: 'Impressora não encontrada' });
  }
});

app.post('/api/v1/printers', (req, res) => {
  const newPrinter = {
    id: `printer-${Date.now()}`,
    ...req.body,
    createdAt: new Date(),
  };
  mockPrinters.push(newPrinter);
  res.status(201).json(newPrinter);
});

app.put('/api/v1/printers/:id', (req, res) => {
  const printer = mockPrinters.find((p) => p.id === req.params.id);
  if (printer) {
    Object.assign(printer, req.body);
    res.json(printer);
  } else {
    res.status(404).json({ message: 'Impressora não encontrada' });
  }
});

app.delete('/api/v1/printers/:id', (req, res) => {
  const index = mockPrinters.findIndex((p) => p.id === req.params.id);
  if (index !== -1) {
    mockPrinters.splice(index, 1);
    res.json({ message: 'Impressora deletada' });
  } else {
    res.status(404).json({ message: 'Impressora não encontrada' });
  }
});

// Supplies Endpoints
app.get('/api/v1/supplies', (req, res) => {
  res.json({
    data: mockSupplies,
    pagination: {
      total: mockSupplies.length,
      skip: 0,
      take: 10,
      pages: 1,
    },
  });
});

app.get('/api/v1/supplies/:id', (req, res) => {
  const supply = mockSupplies.find((s) => s.id === req.params.id);
  if (supply) {
    res.json(supply);
  } else {
    res.status(404).json({ message: 'Suprimento não encontrado' });
  }
});

app.post('/api/v1/supplies', (req, res) => {
  const newSupply = {
    id: `supply-${Date.now()}`,
    ...req.body,
    createdAt: new Date(),
  };
  mockSupplies.push(newSupply);
  res.status(201).json(newSupply);
});

// Alerts Endpoints
app.get('/api/v1/alerts', (req, res) => {
  res.json({
    data: mockAlerts,
    pagination: {
      total: mockAlerts.length,
      skip: 0,
      take: 10,
      pages: 1,
    },
  });
});

app.post('/api/v1/alerts/:id/acknowledge', (req, res) => {
  const alert = mockAlerts.find((a) => a.id === req.params.id);
  if (alert) {
    alert.acknowledgedBy = req.body.userId;
    alert.acknowledgedAt = new Date();
    res.json(alert);
  } else {
    res.status(404).json({ message: 'Alerta não encontrado' });
  }
});

// Dashboard Endpoints
app.get('/api/v1/dashboard/metrics', (req, res) => {
  res.json({
    totalPrinters: mockPrinters.length,
    onlinePrinters: mockPrinters.filter((p) => p.status === 'ONLINE').length,
    lowTonerAlerts: mockAlerts.filter((a) => a.type === 'LOW_TONER').length,
    criticalAlerts: mockAlerts.filter((a) => a.severity === 'CRITICAL').length,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         GATTI - Mock Backend Server (Express)              ║
║                                                            ║
║  🚀 Servidor iniciado em: http://localhost:${PORT}         ║
║  📚 Documentação: http://localhost:${PORT}/api/v1/docs     ║
║  🌍 Ambiente: development (MOCK)                           ║
║                                                            ║
║  Credenciais de teste:                                    ║
║  Email: admin@gatti.com                                  ║
║  Senha: admin123                                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
