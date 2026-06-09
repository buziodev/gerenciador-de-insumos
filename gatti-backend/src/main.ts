import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware de segurança
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefixo da API
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('GATTI - Gerenciador de Insumos')
    .setDescription('API Backend para Gestão de Impressoras, Suprimentos e Estoque com Integração Zabbix')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addTag('Auth', 'Autenticação e Autorização')
    .addTag('Printers', 'Gestão de Impressoras')
    .addTag('Supplies', 'Gestão de Suprimentos')
    .addTag('Stock', 'Gestão de Estoque')
    .addTag('Analytics', 'Analytics e Indicadores')
    .addTag('Alerts', 'Sistema de Alertas')
    .addTag('Reports', 'Geração de Relatórios')
    .addTag('Zabbix', 'Integração Zabbix')
    .addTag('Health', 'Health Check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         GATTI - Gerenciador de Insumos Backend             ║
║                                                            ║
║  🚀 Servidor iniciado em: http://localhost:${port}         ║
║  📚 Documentação: http://localhost:${port}/${apiPrefix}/docs  ║
║  🌍 Ambiente: ${process.env.NODE_ENV || 'development'}                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
  process.exit(1);
});
