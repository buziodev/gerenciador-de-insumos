import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as snmp from 'net-snmp';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

const OIDS = {
  sysDescr: '1.3.6.1.2.1.1.1.0',
  sysName: '1.3.6.1.2.1.1.5.0',
  hrDeviceDescr: '1.3.6.1.2.1.25.3.2.1.3.1',
  hrDeviceStatus: '1.3.6.1.2.1.25.3.2.1.5.1',
  pageCount: '1.3.6.1.2.1.43.10.2.1.4.1.1',
  serialNumber: '1.3.6.1.4.1.367.3.2.1.2.1.4.0',
  tonerNames: '1.3.6.1.4.1.367.3.2.1.2.24.1.1.2',
  tonerLevels: '1.3.6.1.4.1.367.3.2.1.2.24.1.1.5',
} as const;

const SUPPORTED_MODELS = [/ricoh\s*p\s*311/i, /ricoh\s*m\s*320/i, /\bp\s*311\b/i, /\bm\s*320\b/i];

type DiscoveredToner = {
  color: 'BLACK' | 'CYAN' | 'MAGENTA' | 'YELLOW' | 'WASTE';
  percentageLevel: number;
  pageCount: number;
};

type DiscoveredPrinter = {
  ipAddress: string;
  hostname: string;
  name: string;
  model: string;
  manufacturer: 'Ricoh';
  serialNumber?: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  pageCount?: number;
  tonerLevels: DiscoveredToner[];
};

type ProbeResult = DiscoveredPrinter | null;

@Injectable()
export class SnmpService {
  private readonly logger = new Logger(SnmpService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  getConfiguration() {
    return {
      startIp: this.getConfig('SNMP_DISCOVERY_START_IP', '192.168.2.2'),
      endIp: this.getConfig('SNMP_DISCOVERY_END_IP', '192.168.2.220'),
      port: this.getNumberConfig('SNMP_PORT', 161),
      version: '2c',
      supportedModels: ['Ricoh P 311', 'Ricoh M 320'],
      communityConfigured: Boolean(this.configService.get<string>('SNMP_COMMUNITY')),
    };
  }

  async discover() {
    const startIp = this.getConfig('SNMP_DISCOVERY_START_IP', '192.168.2.2');
    const endIp = this.getConfig('SNMP_DISCOVERY_END_IP', '192.168.2.220');
    const community = this.getCommunity();
    const ips = this.buildIpRange(startIp, endIp);
    const concurrency = Math.min(64, this.getNumberConfig('SNMP_DISCOVERY_CONCURRENCY', 16));
    const devices: DiscoveredPrinter[] = [];

    for (let index = 0; index < ips.length; index += concurrency) {
      const batch = ips.slice(index, index + concurrency);
      const results = await Promise.all(batch.map((ip) => this.probe(ip, community)));
      devices.push(...(results.filter(Boolean) as DiscoveredPrinter[]));
    }

    return {
      source: 'SNMP',
      scanned: ips.length,
      discovered: devices.length,
      range: { startIp, endIp },
      devices,
    };
  }

  async syncPrinters() {
    const discovery = await this.discover();
    let created = 0;
    let updated = 0;

    for (const device of discovery.devices) {
      const sourceId = this.sourceId(device.ipAddress);
      const existingByIp = await this.prisma.printer.findFirst({
        where: { ipAddress: device.ipAddress },
      });
      const existingBySource = await this.prisma.printer.findUnique({
        where: { zabbixHostId: sourceId },
      });
      const existing = existingByIp ?? existingBySource;
      const recordedAt = new Date();

      if (existing) {
        const printer = await this.prisma.printer.update({
          where: { id: existing.id },
          data: {
            name: existing.name || device.name,
            hostname: this.safeHostname(existing.hostname || device.hostname, device.ipAddress),
            model: device.model,
            manufacturer: device.manufacturer,
            serialNumber: device.serialNumber ?? existing.serialNumber,
            status: device.status,
            lastSync: recordedAt,
            deletedAt: null,
          },
        });
        await this.persistMeasurements(printer.id, device, recordedAt);
        updated += 1;
      } else {
        const printer = await this.prisma.printer.create({
          data: {
            zabbixHostId: sourceId,
            name: device.name,
            hostname: device.hostname,
            ipAddress: device.ipAddress,
            model: device.model,
            manufacturer: device.manufacturer,
            serialNumber: device.serialNumber,
            group: 'Descoberta SNMP',
            status: device.status,
            lastSync: recordedAt,
          },
        });
        await this.persistMeasurements(printer.id, device, recordedAt);
        created += 1;
      }
    }

    return {
      ...discovery,
      created,
      updated,
      syncedAt: new Date().toISOString(),
    };
  }

  private async probe(ipAddress: string, community: string): Promise<ProbeResult> {
    const session = snmp.createSession(ipAddress, community, {
      port: this.getNumberConfig('SNMP_PORT', 161),
      version: snmp.Version2c,
      timeout: this.getNumberConfig('SNMP_TIMEOUT_MS', 750),
      retries: this.getNumberConfig('SNMP_RETRIES', 1),
    });

    try {
      const values = await this.get(session, [
        OIDS.sysDescr,
        OIDS.sysName,
        OIDS.hrDeviceDescr,
        OIDS.hrDeviceStatus,
        OIDS.pageCount,
        OIDS.serialNumber,
      ]);
      const sysDescr = this.toText(values[OIDS.sysDescr]);
      const hrDeviceDescr = this.toText(values[OIDS.hrDeviceDescr]);
      const model = this.pickModel(sysDescr, hrDeviceDescr);

      if (!model || !this.isSupportedModel(`${sysDescr} ${hrDeviceDescr}`)) {
        return null;
      }

      const hostname = this.safeHostname(this.toText(values[OIDS.sysName]), ipAddress);
      const tonerLevels = await this.readTonerLevels(session);
      const rawPageCount = this.toNumber(values[OIDS.pageCount]);
      const status = this.normalizeStatus(this.toNumber(values[OIDS.hrDeviceStatus]));

      return {
        ipAddress,
        hostname,
        name: `${model} (${ipAddress})`,
        model,
        manufacturer: 'Ricoh',
        serialNumber: this.toOptionalText(values[OIDS.serialNumber]),
        status,
        pageCount: rawPageCount === null ? undefined : Math.max(0, Math.trunc(rawPageCount)),
        tonerLevels,
      };
    } catch (error: any) {
      this.logger.debug(`SNMP sem resposta em ${ipAddress}: ${error?.message || 'timeout'}`);
      return null;
    } finally {
      session.close();
    }
  }

  private get(session: snmp.Session, oids: string[]): Promise<Record<string, snmp.Varbind>> {
    return new Promise((resolve, reject) => {
      session.get(oids, (error, varbinds) => {
        if (error) {
          reject(error);
          return;
        }

        const result: Record<string, snmp.Varbind> = {};
        for (const varbind of varbinds || []) {
          if (!snmp.isVarbindError(varbind)) {
            result[varbind.oid] = varbind;
          }
        }
        resolve(result);
      });
    });
  }

  private walk(session: snmp.Session, oid: string): Promise<snmp.Varbind[]> {
    return new Promise((resolve) => {
      const result: snmp.Varbind[] = [];
      session.walk(
        oid,
        20,
        (varbinds) => {
          result.push(...varbinds.filter((varbind) => !snmp.isVarbindError(varbind)));
        },
        () => resolve(result),
      );
    });
  }

  private async readTonerLevels(session: snmp.Session): Promise<DiscoveredToner[]> {
    const [names, levels] = await Promise.all([
      this.walk(session, OIDS.tonerNames),
      this.walk(session, OIDS.tonerLevels),
    ]);
    const namesByIndex = new Map<string, string>();

    for (const varbind of names) {
      namesByIndex.set(this.tableIndex(OIDS.tonerNames, varbind.oid), this.toText(varbind));
    }

    const toners: DiscoveredToner[] = [];
    const seenColors = new Set<DiscoveredToner['color']>();
    for (const varbind of levels) {
      const level = this.toNumber(varbind);
      if (level === null || level < 0) {
        continue;
      }
      const index = this.tableIndex(OIDS.tonerLevels, varbind.oid);
      const color = this.normalizeTonerColor(namesByIndex.get(index), toners.length === 0);
      if (!color || seenColors.has(color)) {
        continue;
      }
      seenColors.add(color);
      toners.push({
        color,
        percentageLevel: Math.min(100, level),
        pageCount: 0,
      });
    }

    return toners;
  }

  private async persistMeasurements(printerId: string, device: DiscoveredPrinter, recordedAt: Date) {
    if (device.pageCount !== undefined) {
      await this.prisma.printerMetric.create({
        data: {
          printerId,
          pageCount: device.pageCount,
          recordedAt,
        },
      });
    }

    if (device.tonerLevels.length > 0) {
      await this.prisma.tonerLevel.createMany({
        data: device.tonerLevels.map((toner) => ({
          printerId,
          color: toner.color,
          percentageLevel: toner.percentageLevel,
          pageCount: toner.pageCount,
          recordedAt,
        })),
      });
    }
  }

  private isSupportedModel(value: string) {
    return SUPPORTED_MODELS.some((pattern) => pattern.test(value));
  }

  private pickModel(sysDescr: string, hrDeviceDescr: string) {
    const value = `${sysDescr} ${hrDeviceDescr}`;
    if (/p\s*311/i.test(value)) return 'Ricoh P 311';
    if (/m\s*320/i.test(value)) return 'Ricoh M 320';
    return '';
  }

  private normalizeStatus(value: number | null): 'ONLINE' | 'OFFLINE' | 'ERROR' {
    if (value === 5 || value === 6) return 'OFFLINE';
    if (value === 3 || value === 4) return 'ERROR';
    return 'ONLINE';
  }

  private normalizeTonerColor(name: string | undefined, isFirst: boolean): DiscoveredToner['color'] | null {
    const value = (name || '').toLowerCase();
    if (/black|preto|\bbk\b|\bk\b/.test(value)) return 'BLACK';
    if (/cyan|\bc\b/.test(value)) return 'CYAN';
    if (/magenta|\bm\b/.test(value)) return 'MAGENTA';
    if (/yellow|amarelo|\by\b/.test(value)) return 'YELLOW';
    if (/waste|residual|residuo/.test(value)) return 'WASTE';
    return isFirst ? 'BLACK' : null;
  }

  private tableIndex(baseOid: string, oid: string) {
    return oid.startsWith(`${baseOid}.`) ? oid.slice(baseOid.length + 1) : oid;
  }

  private toText(varbind: snmp.Varbind | undefined) {
    if (!varbind || varbind.value === undefined || varbind.value === null) return '';
    return Buffer.isBuffer(varbind.value) ? varbind.value.toString('utf8').trim() : String(varbind.value).trim();
  }

  private toOptionalText(varbind: snmp.Varbind | undefined) {
    const value = this.toText(varbind);
    return value || undefined;
  }

  private toNumber(varbind: snmp.Varbind | undefined) {
    if (!varbind || varbind.value === undefined || varbind.value === null) return null;
    const parsed = Number(Buffer.isBuffer(varbind.value) ? varbind.value.toString('utf8') : varbind.value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private safeHostname(value: string, ipAddress: string) {
    const hostname = value.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 240);
    return hostname || `ricoh-${ipAddress.replace(/\./g, '-')}`;
  }

  private sourceId(ipAddress: string) {
    return `snmp-${ipAddress.replace(/\./g, '-')}`;
  }

  private buildIpRange(startIp: string, endIp: string) {
    const start = this.ipToNumber(startIp);
    const end = this.ipToNumber(endIp);
    const startNetwork = startIp.split('.').slice(0, 3).join('.');
    const endNetwork = endIp.split('.').slice(0, 3).join('.');
    if (start === null || end === null || start > end || startNetwork !== endNetwork || end - start + 1 > 512) {
      throw new Error(`Faixa SNMP inválida ou ampla demais: ${startIp} até ${endIp}`);
    }
    return Array.from({ length: end - start + 1 }, (_, offset) => this.numberToIp(start + offset));
  }

  private ipToNumber(ip: string) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
    return parts[0] * 256 ** 3 + parts[1] * 256 ** 2 + parts[2] * 256 + parts[3];
  }

  private numberToIp(value: number) {
    return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.');
  }

  private getConfig(name: string, fallback: string) {
    return this.configService.get<string>(name) || fallback;
  }

  private getCommunity() {
    const community = this.configService.get<string>('SNMP_COMMUNITY')?.trim();
    if (!community) {
      throw new BadRequestException('SNMP_COMMUNITY não configurada no backend');
    }
    return community;
  }

  private getNumberConfig(name: string, fallback: number) {
    const value = Number(this.configService.get<string>(name));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}

export { OIDS };
export type { DiscoveredPrinter, DiscoveredToner };

// Estilo: integração operacional discreta e legível; este arquivo privilegia contratos explícitos,
// limites configuráveis e falhas isoladas por IP, preservando a linguagem visual sóbria do GATTI.
