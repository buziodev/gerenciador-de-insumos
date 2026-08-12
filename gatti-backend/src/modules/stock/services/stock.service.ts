import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateStockMovementDto, ListMovementsQueryDto } from '../dtos/stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async createMovement(createMovementDto: CreateStockMovementDto & { createdBy: string }) {
    // Validar quantidade
    if (createMovementDto.quantity <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero');
    }

    // Usar transação para garantir consistência
    return await this.prisma.$transaction(async (tx: any) => {
      const supply = await tx.supply.findFirst({
        where: { id: createMovementDto.supplyId, deletedAt: null },
      });

      if (!supply) {
        throw new NotFoundException(`Suprimento com ID ${createMovementDto.supplyId} não encontrado`);
      }

      const stock = await tx.stock.findFirst({
        where: { supplyId: createMovementDto.supplyId, deletedAt: null },
      });

      if (!stock) {
        throw new NotFoundException(`Estoque não encontrado para o suprimento ${createMovementDto.supplyId}`);
      }

      const decrementTypes = ['EXIT', 'TRANSFER', 'LOSS'];
      if (decrementTypes.includes(createMovementDto.type)) {
        const update = await tx.stock.updateMany({
          where: {
            supplyId: createMovementDto.supplyId,
            deletedAt: null,
            quantity: { gte: createMovementDto.quantity },
          },
          data: { quantity: { decrement: createMovementDto.quantity } },
        });
        if (update.count !== 1) {
          throw new BadRequestException('Quantidade insuficiente em estoque');
        }
      } else if (createMovementDto.type === 'ENTRY') {
        await tx.stock.update({
          where: { supplyId: createMovementDto.supplyId },
          data: { quantity: { increment: createMovementDto.quantity } },
        });
      } else if (createMovementDto.type === 'ADJUSTMENT') {
        await tx.stock.update({
          where: { supplyId: createMovementDto.supplyId },
          data: { quantity: createMovementDto.quantity },
        });
      }

      const movement = await tx.stockMovement.create({ data: createMovementDto });

      return movement;
    });
  }

  async listMovements(query: ListMovementsQueryDto) {
    const { skip = 0, take = 10, supplyId, type } = query;

    const where: any = {};

    if (supplyId) {
      where.supplyId = supplyId;
    }

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take,
        include: { supply: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
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

  async getStockLevels() {
    return this.prisma.stock.findMany({
      where: { deletedAt: null },
      include: { supply: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCriticalStock() {
    const levels = await this.prisma.stock.findMany({
      where: { deletedAt: null },
      include: { supply: true },
      orderBy: { quantity: 'asc' },
    });

    return levels.filter((stock) => stock.quantity <= stock.minimumLevel);
  }

  async updateStockLevels(supplyId: string, minimumLevel: number, maximumLevel: number) {
    if (minimumLevel < 0 || maximumLevel < minimumLevel) {
      throw new BadRequestException('Os níveis de estoque são inválidos');
    }

    const stock = await this.prisma.stock.findFirst({
      where: { supplyId, deletedAt: null },
    });
    if (!stock) {
      throw new NotFoundException(`Estoque não encontrado para o suprimento ${supplyId}`);
    }

    return this.prisma.stock.update({
      where: { supplyId },
      data: { minimumLevel, maximumLevel },
      include: { supply: true },
    });
  }
}
