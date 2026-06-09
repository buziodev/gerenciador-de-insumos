import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { SuppliesService } from './services/supplies.service';
import { SuppliesController } from './controllers/supplies.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SuppliesController],
  providers: [SuppliesService],
  exports: [SuppliesService],
})
export class SuppliesModule {}
