import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateSupplyDto, UpdateSupplyDto, ListSuppliesQueryDto } from '../dtos/supply.dto';

@Injectable()
export class SuppliesService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplyDto: CreateSupplyDto) {
    return this.prisma.$transaction(async (tx: any) => {
      const supply = await tx.supply.create({ data: createSupplyDto });
      await tx.stock.create({
        data: {
          supplyId: supply.id,
          quantity: 0,
          minimumLevel: 5,
          maximumLevel: 100,
        },
      });
      return supply;
    });
  }

  async findAll(query: ListSuppliesQueryDto) {
    const { skip = 0, take = 10, type, search } = query;

    const where: any = { deletedAt: null };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.supply.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supply.count({ where }),
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
    const supply = await this.prisma.supply.findFirst({
      where: { id, deletedAt: null },
    });

    if (!supply) {
      throw new NotFoundException(`Suprimento com ID ${id} não encontrado`);
    }

    return supply;
  }

  async update(id: string, updateSupplyDto: UpdateSupplyDto) {
    await this.findOne(id);

    return this.prisma.supply.update({
      where: { id },
      data: updateSupplyDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx: any) => {
      const deletedAt = new Date();
      const supply = await tx.supply.update({
        where: { id },
        data: { deletedAt },
      });
      await tx.stock.updateMany({
        where: { supplyId: id, deletedAt: null },
        data: { deletedAt },
      });
      return supply;
    });
  }

  async getStock(id: string) {
    const supply = await this.findOne(id);

    return this.prisma.stock.findFirst({
      where: { supplyId: id, deletedAt: null },
    });
  }
}
