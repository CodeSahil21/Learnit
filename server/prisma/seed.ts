import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Admin
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: {},
    create: {
      email: 'admin@lms.com',
      password_hash: adminHash,
      role: 'ADMIN',
      is_verified: true
    }
  });

  console.log('Seeded Admin:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });