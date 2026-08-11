import { Controller, Get, Post, Body, Patch, Delete, Param, Query, UseGuards, ParseEnumPipe } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, ListUsersQueryDto } from '../dtos/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  async findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um usuário' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar usuário (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  async changePassword(@Param('id') id: string, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Alterar papel do usuário' })
  async updateRole(@Param('id') id: string, @Body('role', new ParseEnumPipe(UserRole)) role: UserRole) {
    return this.usersService.updateRole(id, role);
  }
}
