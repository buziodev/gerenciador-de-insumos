import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZabbixService {
  private readonly logger = new Logger(ZabbixService.name);
  private authToken: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async authenticate(): Promise<string> {
    try {
      const url = this.configService.get('ZABBIX_API_URL');
      const user = this.configService.get('ZABBIX_API_USER');
      const password = this.configService.get('ZABBIX_API_PASSWORD');

      const response = await firstValueFrom(
        this.httpService.post(url, {
          jsonrpc: '2.0',
          method: 'user.login',
          params: {
            username: user,
            password: password,
          },
          id: 1,
        }),
      );

      this.authToken = response.data.result;
      this.logger.log('Autenticação com Zabbix realizada com sucesso');
      return this.authToken;
    } catch (error) {
      this.logger.error('Erro ao autenticar com Zabbix:', error);
      throw error;
    }
  }

  async getPrinters() {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const url = this.configService.get('ZABBIX_API_URL');
      const response = await firstValueFrom(
        this.httpService.post(url, {
          jsonrpc: '2.0',
          method: 'host.get',
          params: {
            output: ['hostid', 'name', 'host', 'status'],
            selectInterfaces: ['ip', 'port', 'type'],
            selectInventory: ['serialno', 'model', 'manufacturer'],
            filter: {
              host: 'printer*', // Filtrar apenas hosts que começam com "printer"
            },
          },
          auth: this.authToken,
          id: 1,
        }),
      );

      return response.data.result || [];
    } catch (error) {
      this.logger.error('Erro ao obter impressoras do Zabbix:', error);
      throw error;
    }
  }

  async getMetrics(hostId: string) {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const url = this.configService.get('ZABBIX_API_URL');
      const response = await firstValueFrom(
        this.httpService.post(url, {
          jsonrpc: '2.0',
          method: 'history.get',
          params: {
            output: 'extend',
            history: 0, // Valores numéricos
            hostids: hostId,
            limit: 100,
            sortfield: 'clock',
            sortorder: 'DESC',
          },
          auth: this.authToken,
          id: 1,
        }),
      );

      return response.data.result || [];
    } catch (error) {
      this.logger.error('Erro ao obter métricas do Zabbix:', error);
      throw error;
    }
  }

  async syncPrinters() {
    try {
      this.logger.log('Iniciando sincronização de impressoras com Zabbix');

      const zabbixPrinters = await this.getPrinters();

      for (const printer of zabbixPrinters) {
        const existingPrinter = await this.prisma.printer.findUnique({
          where: { zabbixHostId: printer.hostid },
        });

        if (!existingPrinter) {
          await this.prisma.printer.create({
            data: {
              zabbixHostId: printer.hostid,
              name: printer.name,
              hostname: printer.host,
              ipAddress: printer.interfaces?.[0]?.ip || '',
              model: printer.inventory?.model || 'Desconhecido',
              manufacturer: printer.inventory?.manufacturer || 'Desconhecido',
              serialNumber: printer.inventory?.serialno,
              group: 'Importado do Zabbix',
              status: printer.status === '0' ? 'ONLINE' : 'OFFLINE',
              lastSync: new Date(),
            },
          });

          this.logger.log(`Impressora criada: ${printer.name}`);
        } else {
          await this.prisma.printer.update({
            where: { zabbixHostId: printer.hostid },
            data: {
              status: printer.status === '0' ? 'ONLINE' : 'OFFLINE',
              lastSync: new Date(),
            },
          });

          this.logger.log(`Impressora atualizada: ${printer.name}`);
        }
      }

      await this.prisma.zabbixSync.updateMany({
        data: {
          lastSyncPrinters: new Date(),
          totalPrinters: zabbixPrinters.length,
          status: 'SUCCESS',
        },
      });

      this.logger.log(`Sincronização concluída: ${zabbixPrinters.length} impressoras`);
    } catch (error) {
      this.logger.error('Erro durante sincronização:', error);

      await this.prisma.zabbixSync.updateMany({
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  async syncMetrics() {
    try {
      this.logger.log('Iniciando sincronização de métricas com Zabbix');

      const printers = await this.prisma.printer.findMany({
        where: { isActive: true },
      });

      for (const printer of printers) {
        const metrics = await this.getMetrics(printer.zabbixHostId);

        for (const metric of metrics) {
          await this.prisma.printerMetric.create({
            data: {
              printerId: printer.id,
              pageCount: parseInt(metric.value) || 0,
              recordedAt: new Date(parseInt(metric.clock) * 1000),
            },
          });
        }
      }

      await this.prisma.zabbixSync.updateMany({
        data: {
          lastSyncMetrics: new Date(),
          status: 'SUCCESS',
        },
      });

      this.logger.log('Sincronização de métricas concluída');
    } catch (error) {
      this.logger.error('Erro durante sincronização de métricas:', error);
      throw error;
    }
  }
}
