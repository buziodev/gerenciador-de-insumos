import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateAlertDto, ListAlertsQueryDto, AcknowledgeAlertDto } from '../dtos/alert.dto';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async create(createAlertDto: CreateAlertDto) {
    return this.prisma.alert.create({
      data: createAlertDto,
    });
  }

  async findAll(query: ListAlertsQueryDto) {
    const { skip = 0, take = 10, type, severity, isActive } = query;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (severity) {
      where.severity = severity;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.alert.count({ where }),
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
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException(`Alerta com ID ${id} não encontrado`);
    }

    return alert;
  }

  async acknowledge(id: string, acknowledgeDto: AcknowledgeAlertDto) {
    const alert = await this.findOne(id);

    return this.prisma.alert.update({
      where: { id },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedBy: acknowledgeDto.acknowledgedBy,
      },
    });
  }

  async resolve(id: string) {
    const alert = await this.findOne(id);

    return this.prisma.alert.update({
      where: { id },
      data: {
        isActive: false,
        resolvedAt: new Date(),
      },
    });
  }

  async getActiveAlerts() {
    return this.prisma.alert.findMany({
      where: { isActive: true },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getCriticalAlerts() {
    return this.prisma.alert.findMany({
      where: {
        isActive: true,
        severity: 'CRITICAL',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAlertsByPrinter(printerId: string) {
    return this.prisma.alert.findMany({
      where: {
        printerId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
