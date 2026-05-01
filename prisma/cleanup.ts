import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const KEEP_EMAILS = ['admin@waygo.ge', 'ggulordava4@gmail.com'];

async function main() {
  console.log('🧹 Starting database cleanup...\n');

  // Delete all profiles not in the keep list
  // Cascade deletes handle: Cars, Bookings, ConditionReports, Transactions, InsurancePolicies
  const deleted = await prisma.profile.deleteMany({
    where: { email: { notIn: KEEP_EMAILS } },
  });
  console.log(`✅ Deleted ${deleted.count} profile(s) (+ cascaded data)`);

  // Ensure admin has correct credentials and role
  const adminHash = await bcrypt.hash('Waygo2026@', 12);
  await prisma.profile.upsert({
    where: { email: 'admin@waygo.ge' },
    update: {
      fullName: 'WayGo Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
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
      passwordHash: adminHash,
      role: 'ADMIN',
      isVerified: true,
      hostVerified: true,
      verificationStatus: 'APPROVED',
      hostVerificationStatus: 'APPROVED',
    },
  });
  console.log('✅ Admin account verified: admin@waygo.ge / Waygo2026@');

  const remaining = await prisma.profile.findMany({ select: { email: true, role: true } });
  console.log('\n📋 Remaining profiles:');
  remaining.forEach(p => console.log(`   ${p.role.padEnd(6)} – ${p.email}`));

  console.log('\n✅ Cleanup complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
