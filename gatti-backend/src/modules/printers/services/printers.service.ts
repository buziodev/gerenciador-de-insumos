import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreatePrinterDto, UpdatePrinterDto, ListPrintersQueryDto } from '../dtos/printer.dto';

@Injectable()
export class PrintersService {
  constructor(private prisma: PrismaService) {}

  async create(createPrinterDto: CreatePrinterDto) {
    this.validateIpAddress(createPrinterDto.ipAddress);

    const existingIp = await this.prisma.printer.findFirst({
      where: { ipAddress: createPrinterDto.ipAddress, deletedAt: null },
    });
    if (existingIp) {
      throw new ConflictException(`IP ${createPrinterDto.ipAddress} já está cadastrado`);
    }

    if (createPrinterDto.serialNumber) {
      const existingSerial = await this.prisma.printer.findFirst({
        where: { serialNumber: createPrinterDto.serialNumber, deletedAt: null },
      });
      if (existingSerial) {
        throw new ConflictException(`Serial number ${createPrinterDto.serialNumber} já está cadastrado`);
      }
    }

    return this.prisma.printer.create({
      data: createPrinterDto,
      include: {
        sector: true,
        metrics: { take: 10, orderBy: { recordedAt: 'desc' } },
        tonerLevels: { orderBy: { recordedAt: 'desc' } },
      },
    });
  }

  async findAll(query: ListPrintersQueryDto) {
    const { skip = 0, take = 10, status, sectorId, search } = query;
    const where: any = { deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (sectorId) {
      where.sectorId = sectorId;
    }

    if (search) {
      const searchableFields: any[] = [
        { name: { contains: search, mode: 'insensitive' } },
        { hostname: { contains: search, mode: 'insensitive' } },
      ];
      if (this.isValidIpAddress(search)) {
        searchableFields.push({ ipAddress: search });
      }
      where.OR = searchableFields;
    }

    const [data, total] = await Promise.all([
      this.prisma.printer.findMany({
        where,
        skip,
        take,
        include: {
          sector: true,
          metrics: { take: 1, orderBy: { recordedAt: 'desc' } },
          tonerLevels: { orderBy: { recordedAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.printer.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const printer = await this.prisma.printer.findFirst({
      where: { id, deletedAt: null },
      include: {
        sector: true,
        metrics: { orderBy: { recordedAt: 'desc' } },
        tonerLevels: { orderBy: { recordedAt: 'desc' } },
        consumptionHistory: { orderBy: { recordedAt: 'desc' }, take: 30 },
        tonerChanges: { orderBy: { detectedAt: 'desc' }, take: 10 },
        maintenanceHistory: { orderBy: { startDate: 'desc' } },
      },
    });

    if (!printer) {
      throw new NotFoundException(`Impressora com ID ${id} não encontrada`);
    }

    return printer;
  }

  async update(id: string, updatePrinterDto: UpdatePrinterDto) {
    const printer = await this.findOne(id);

    if (updatePrinterDto.ipAddress && updatePrinterDto.ipAddress !== printer.ipAddress) {
      this.validateIpAddress(updatePrinterDto.ipAddress);
      const existingIp = await this.prisma.printer.findFirst({
        where: {
          ipAddress: updatePrinterDto.ipAddress,
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existingIp) {
        throw new ConflictException(`IP ${updatePrinterDto.ipAddress} já está cadastrado`);
      }
    }

    if (updatePrinterDto.serialNumber && updatePrinterDto.serialNumber !== printer.serialNumber) {
      const existingSerial = await this.prisma.printer.findFirst({
        where: {
          serialNumber: updatePrinterDto.serialNumber,
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existingSerial) {
        throw new ConflictException(`Serial number ${updatePrinterDto.serialNumber} já está cadastrado`);
      }
    }

    return this.prisma.printer.update({
      where: { id },
      data: updatePrinterDto,
      include: {
        sector: true,
        metrics: { take: 10, orderBy: { recordedAt: 'desc' } },
        tonerLevels: { orderBy: { recordedAt: 'desc' } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.printer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByZabbixHostId(zabbixHostId: string) {
    return this.prisma.printer.findFirst({
      where: { zabbixHostId, deletedAt: null },
    });
  }

  async getMetrics(id: string, days: number = 30) {
    await this.findOne(id);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.printerMetric.findMany({
      where: {
        printerId: id,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
    });
  }

  private validateIpAddress(ip: string): void {
    if (!this.isValidIpAddress(ip)) {
      throw new BadRequestException(`Formato de IP inválido: ${ip}`);
    }
  }

  private isValidIpAddress(ip: string): boolean {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return false;
    }
    return ip.split('.').every((part) => {
      const value = Number(part);
      return Number.isInteger(value) && value >= 0 && value <= 255;
    });
  }
}
