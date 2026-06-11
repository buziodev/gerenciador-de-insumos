import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Nome completo do usuário',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Sobrenome do usuário',
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Senha do usuário',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    enum: UserRoleEnum,
    example: UserRoleEnum.OPERATOR,
    description: 'Papel do usuário',
  })
  @IsEnum(UserRoleEnum)
  role!: UserRoleEnum;

  @ApiProperty({
    example: 'sector-1',
    description: 'ID do setor',
    required: false,
  })
  @IsOptional()
  @IsString()
  sectorId?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Senha atual',
  })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    example: 'newPassword456',
    description: 'Nova senha',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class ListUsersQueryDto {
  @ApiProperty({
    example: 0,
    description: 'Número de registros a pular',
    required: false,
  })
  @IsOptional()
  skip?: number;

  @ApiProperty({
    example: 10,
    description: 'Número de registros a retornar',
    required: false,
  })
  @IsOptional()
  take?: number;

  @ApiProperty({
    enum: UserRoleEnum,
    description: 'Filtrar por papel',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @ApiProperty({
    example: 'john',
    description: 'Buscar por nome ou email',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
