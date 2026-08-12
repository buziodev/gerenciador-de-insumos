import { Module } from '@nestjs/common';
import { SectorsService } from './services/sectors.service';
import { SectorsController } from './controllers/sectors.controller';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SectorsController],
  providers: [SectorsService],
  exports: [SectorsService],
})
export class SectorsModule {}
