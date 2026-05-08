import { prisma } from './db';

export function buildBaseSlug(brand: string, model: string, year: number, city: string): string {
  return `rent-${brand}-${model}-${year}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createUniqueSlug(
  brand: string,
  model: string,
  year: number,
  city: string,
): Promise<string> {
  const base = buildBaseSlug(brand, model, year, city);
  const existing = await prisma.car.findUnique({ where: { slug: base } });
  if (!existing) return base;
  let i = 2;
  while (true) {
    const candidate = `${base}-${i}`;
    const taken = await prisma.car.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
    i++;
  }
}
