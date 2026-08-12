import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const requiredVariables = [
  'INITIAL_ADMIN_EMAIL',
  'INITIAL_ADMIN_PASSWORD',
  'INITIAL_ADMIN_FIRST_NAME',
  'INITIAL_ADMIN_LAST_NAME',
];

const missingVariables = requiredVariables.filter((name) => !process.env[name]);
if (missingVariables.length > 0) {
  throw new Error(`Variáveis obrigatórias ausentes: ${missingVariables.join(', ')}`);
}

const prisma = new PrismaClient();

try {
  const password = await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: process.env.INITIAL_ADMIN_EMAIL },
    create: {
      email: process.env.INITIAL_ADMIN_EMAIL,
      password,
      firstName: process.env.INITIAL_ADMIN_FIRST_NAME,
      lastName: process.env.INITIAL_ADMIN_LAST_NAME,
      role: UserRole.ADMIN,
      isActive: true,
    },
    update: {
      password,
      firstName: process.env.INITIAL_ADMIN_FIRST_NAME,
      lastName: process.env.INITIAL_ADMIN_LAST_NAME,
      role: UserRole.ADMIN,
      isActive: true,
      deletedAt: null,
    },
  });

  console.log(`Administrador inicial preparado: ${user.email}`);
} finally {
  await prisma.$disconnect();
}
