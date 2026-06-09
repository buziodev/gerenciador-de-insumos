import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateStockMovementDto, ListMovementsQueryDto } from '../dtos/stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async createMovement(createMovementDto: CreateStockMovementDto) {
    // Validar quantidade
    if (createMovementDto.quantity <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero');
    }

    // Usar transação para garantir consistência
    return await this.prisma.$transaction(async (tx) => {
      const supply = await tx.supply.findUnique({
        where: { id: createMovementDto.supplyId },
      });

      if (!supply) {
        throw new NotFoundException(`Suprimento com ID ${createMovementDto.supplyId} não encontrado`);
      }

      const stock = await tx.stock.findUnique({
        where: { supplyId: createMovementDto.supplyId },
      });

      if (!stock) {
        throw new NotFoundException(`Estoque não encontrado para o suprimento ${createMovementDto.supplyId}`);
      }

      // Validar quantidade para saída
      if (
        (createMovementDto.type === 'EXIT' || createMovementDto.type === 'TRANSFER') &&
        stock.quantity < createMovementDto.quantity
      ) {
        throw new BadRequestException(
          `Quantidade insuficiente em estoque. Disponível: ${stock.quantity}`,
        );
      }

      // Criar movimento
      const movement = await tx.stockMovement.create({
        data: createMovementDto,
      });

      // Calcular nova quantidade
      let newQuantity = stock.quantity;
      if (createMovementDto.type === 'ENTRY') {
        newQuantity += createMovementDto.quantity;
      } else if (
        createMovementDto.type === 'EXIT' ||
        createMovementDto.type === 'TRANSFER' ||
        createMovementDto.type === 'LOSS'
      ) {
        newQuantity -= createMovementDto.quantity;
      } else if (createMovementDto.type === 'ADJUSTMENT') {
        newQuantity = createMovementDto.quantity;
      }

      // Atualizar estoque
      await tx.stock.update({
        where: { supplyId: createMovementDto.supplyId },
        data: { quantity: newQuantity },
      });

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
      include: { supply: true },
      orderBy: { lastUpdated: 'desc' },
    });
  }
}
