import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { GenerateReportDto, ListReportsQueryDto } from '../dtos/report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(generateReportDto: GenerateReportDto) {
    // Aqui será implementada a lógica de geração de relatórios
    // Por enquanto, apenas registramos a solicitação
    const report = await this.prisma.report.create({
      data: {
        type: generateReportDto.type,
        title: generateReportDto.title,
        description: generateReportDto.description,
        generatedBy: generateReportDto.generatedBy,
        filters: generateReportDto.filters || {},
      },
    });

    return report;
  }

  async findAll(query: ListReportsQueryDto) {
    const { skip = 0, take = 10, type } = query;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take,
        orderBy: { generatedAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
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
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }

    return report;
  }

  async getConsumptionReport(startDate: Date, endDate: Date) {
    // Implementar lógica de consumo
    return {
      type: 'MONTHLY_CONSUMPTION',
      period: { startDate, endDate },
      data: [],
    };
  }

  async getCostsReport(startDate: Date, endDate: Date) {
    // Implementar lógica de custos
    return {
      type: 'COSTS',
      period: { startDate, endDate },
      data: [],
    };
  }

  async getTonerChangesReport(startDate: Date, endDate: Date) {
    const changes = await this.prisma.tonerChange.findMany({
      where: {
        detectedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        printer: true,
      },
      orderBy: { detectedAt: 'desc' },
    });

    return {
      type: 'TONER_CHANGES',
      period: { startDate, endDate },
      total: changes.length,
      data: changes,
    };
  }

  async getStockInventoryReport() {
    const stock = await this.prisma.stock.findMany({
      include: { supply: true },
      orderBy: { supply: { name: 'asc' } },
    });

    return {
      type: 'STOCK_INVENTORY',
      generatedAt: new Date(),
      data: stock,
    };
  }
}
