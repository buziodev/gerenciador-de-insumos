import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateSectorDto, UpdateSectorDto, ListSectorsQueryDto } from '../dtos/sector.dto';

@Injectable()
export class SectorsService {
  constructor(private prisma: PrismaService) {}

  async create(createSectorDto: CreateSectorDto) {
    // Verificar se nome já existe
    const existingSector = await this.prisma.sector.findFirst({
      where: { name: createSectorDto.name, deletedAt: null }
    });

    if (existingSector) {
      throw new ConflictException(`Setor ${createSectorDto.name} já está cadastrado`);
    }

    return this.prisma.sector.create({
      data: createSectorDto,
    });
  }

  async findAll(query: ListSectorsQueryDto) {
    const { skip = 0, take = 10, search } = query;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { costCenter: { contains: search, mode: 'insensitive' } },
        { manager: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.sector.findMany({
        where,
        skip,
        take,
        include: { printers: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sector.count({ where }),
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
    const sector = await this.prisma.sector.findFirst({
      where: { id, deletedAt: null },
      include: {
        printers: { select: { id: true, name: true, model: true } },
      },
    });

    if (!sector) {
      throw new NotFoundException(`Setor com ID ${id} não encontrado`);
    }

    return sector;
  }

  async update(id: string, updateSectorDto: UpdateSectorDto) {
    const sector = await this.findOne(id);

    // Se nome está sendo atualizado, verificar duplicação
    if (updateSectorDto.name && updateSectorDto.name !== sector.name) {
      const existingName = await this.prisma.sector.findFirst({
        where: {
          name: updateSectorDto.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existingName) {
        throw new ConflictException(`Setor ${updateSectorDto.name} já está cadastrado`);
      }
    }

    return this.prisma.sector.update({
      where: { id },
      data: updateSectorDto,
      include: { printers: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    const sector = await this.findOne(id);

    // Soft delete
    return this.prisma.sector.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
