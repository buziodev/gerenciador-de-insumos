import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreatePrinterDto, UpdatePrinterDto, ListPrintersQueryDto } from '../dtos/printer.dto';

@Injectable()
export class PrintersService {
  constructor(private prisma: PrismaService) {}

  async create(createPrinterDto: CreatePrinterDto) {
    // Validar formato de IP
    this.validateIpAddress(createPrinterDto.ipAddress);

    // Verificar se IP já existe
    const existingIp = await this.prisma.printer.findFirst({
      where: { ipAddress: createPrinterDto.ipAddress, deletedAt: null }
    });
    if (existingIp) {
      throw new ConflictException(`IP ${createPrinterDto.ipAddress} já está cadastrado`);
    }

    // Verificar se serial number já existe
    const existingSerial = await this.prisma.printer.findFirst({
      where: { serialNumber: createPrinterDto.serialNumber, deletedAt: null }
    });
    if (existingSerial) {
      throw new ConflictException(`Serial number ${createPrinterDto.serialNumber} já está cadastrado`);
    }

    return this.prisma.printer.create({
      data: {
        ...createPrinterDto,
      },
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
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { hostname: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ];
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
    const printer = await this.prisma.printer.findUnique({
      where: { id },
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

    // Validar IP se estiver sendo atualizado
    if (updatePrinterDto.ipAddress && updatePrinterDto.ipAddress !== printer.ipAddress) {
      this.validateIpAddress(updatePrinterDto.ipAddress);
      
      const existingIp = await this.prisma.printer.findFirst({
        where: { 
          ipAddress: updatePrinterDto.ipAddress,
          id: { not: id },
          deletedAt: null
        }
      });
      if (existingIp) {
        throw new ConflictException(`IP ${updatePrinterDto.ipAddress} já está cadastrado`);
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
    const printer = await this.findOne(id);
    
    // Usar soft delete em vez de hard delete
    return this.prisma.printer.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Validar formato de endereço IP
   */
  private validateIpAddress(ip: string): void {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      throw new BadRequestException(`Formato de IP inválido: ${ip}`);
    }

    const parts = ip.split('.');
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (num < 0 || num > 255) {
        throw new BadRequestException(`IP inválido: ${ip}`);
      }
    }
  }

  async findByZabbixHostId(zabbixHostId: string) {
    return this.prisma.printer.findUnique({
      where: { zabbixHostId },
    });
  }

  async getMetrics(id: string, days: number = 30) {
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
}
