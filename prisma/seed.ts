import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Waygo2026@', 12);

  await prisma.profile.upsert({
    where: { email: 'admin@waygo.ge' },
    update: {
      fullName: 'WayGo Admin',
      passwordHash: hash,
      role: 'ADMIN',          // always enforced — must not be changed
      emailVerified: true,
      isVerified: true,
      hostVerified: true,
      verificationStatus: 'APPROVED',
      hostVerificationStatus: 'APPROVED',
    },
    create: {
      email: 'admin@waygo.ge',
      fullName: 'WayGo Admin',
      phone: '+995599000000',
      country: 'GE',
      passwordHash: hash,
      role: 'ADMIN',
      emailVerified: true,
      isVerified: true,
      hostVerified: true,
      verificationStatus: 'APPROVED',
      hostVerificationStatus: 'APPROVED',
    },
  });

  console.log('✅ Seed complete — admin@waygo.ge / Waygo2026@');
}

main().finally(() => prisma.$disconnect());
