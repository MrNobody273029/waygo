import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  idNumber: z.string().min(7).max(20).optional(),
  country: z.string().default('GE'),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const input = schema.safeParse(body);
  if (!input.success) {
    return NextResponse.json({ error: 'Invalid data', details: input.error.issues }, { status: 400 });
  }

  const { fullName, email, phone, idNumber, country, password } = input.data;

  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.profile.create({
    data: { fullName, email, phone, idNumber: idNumber || null, country, passwordHash },
    select: { id: true, email: true, fullName: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
