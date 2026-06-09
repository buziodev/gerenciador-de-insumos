import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { PrintersService } from './services/printers.service';
import { PrintersController } from './controllers/printers.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PrintersController],
  providers: [PrintersService],
  exports: [PrintersService],
})
export class PrintersModule {}
