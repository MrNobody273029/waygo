import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.profile.findUnique({ where: { email: 'admin@waygo.ge' }, select: { id: true } });
  if (!admin) { console.error('Admin not found'); return; }

  const cars = [
    {
      ownerId: admin.id,
      brand: 'BMW',
      model: '3 Series',
      year: 2022,
      plateNumber: 'AA-123-BB',
      dailyPrice: 250,
      location: 'Tbilisi',
      carType: 'Sedan',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      color: 'Black',
      seats: 5,
      doors: 4,
      description: 'Premium BMW 3 Series in excellent condition. Full leather interior, panoramic roof, heated seats. Perfect for business trips or comfortable city driving.',
      features: ['Panoramic roof', 'Heated seats', 'Leather interior', 'Bluetooth', 'Parking sensors', 'Cruise control'],
      imageUrls: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        'https://images.unsplash.com/photo-1617531653332-bd46c16f3adf?w=800&q=80',
      ],
      isActive: true,
      airportTbilisiState: 'free',
      airportTbilisiPrice: 0,
      airportKutaisiState: 'paid',
      airportKutaisiPrice: 60,
      airportBatumiState: 'paid',
      airportBatumiPrice: 80,
      cityDeliveryEnabled: true,
      cityDeliveryCity: 'Tbilisi',
      cityDeliveryPrice: 30,
      returnPolicy: 'same',
      minDays: 1,
      advanceNotice: 2,
    },
    {
      ownerId: admin.id,
      brand: 'Toyota',
      model: 'RAV4',
      year: 2023,
      plateNumber: 'CC-456-DD',
      dailyPrice: 190,
      location: 'Batumi',
      carType: 'SUV',
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      color: 'White',
      seats: 5,
      doors: 5,
      description: 'Brand new Toyota RAV4 Hybrid. Spacious, fuel-efficient SUV ideal for mountain roads and long trips across Georgia. Great ground clearance.',
      features: ['Hybrid engine', 'All-wheel drive', 'Apple CarPlay', 'Android Auto', 'Rear camera', 'Lane assist', 'Adaptive cruise'],
      imageUrls: [
        'https://images.unsplash.com/photo-1625231337065-430fb7b1db86?w=800&q=80',
        'https://images.unsplash.com/photo-1638618164682-12b986ec2a75?w=800&q=80',
      ],
      isActive: true,
      airportTbilisiState: 'free',
      airportTbilisiPrice: 0,
      airportKutaisiState: 'free',
      airportKutaisiPrice: 0,
      airportBatumiState: 'free',
      airportBatumiPrice: 0,
      cityDeliveryEnabled: true,
      cityDeliveryCity: 'Batumi',
      cityDeliveryPrice: 25,
      returnPolicy: 'flexible',
      minDays: 2,
      advanceNotice: 4,
    },
    {
      ownerId: admin.id,
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2021,
      plateNumber: 'EE-789-FF',
      dailyPrice: 115,
      location: 'Tbilisi',
      carType: 'Hatchback',
      transmission: 'Manual',
      fuelType: 'Petrol',
      color: 'Silver',
      seats: 5,
      doors: 5,
      description: 'Reliable Volkswagen Golf in great condition. Perfect city car — easy to park, fuel-efficient, and comfortable. Good option for budget-conscious travellers.',
      features: ['Bluetooth', 'USB charging', 'Air conditioning', 'Electric windows', 'ABS', 'Parking sensors'],
      imageUrls: [
        'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800&q=80',
        'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80',
      ],
      isActive: true,
      airportTbilisiState: 'paid',
      airportTbilisiPrice: 40,
      airportKutaisiState: 'none',
      airportKutaisiPrice: 0,
      airportBatumiState: 'none',
      airportBatumiPrice: 0,
      cityDeliveryEnabled: false,
      cityDeliveryCity: '',
      cityDeliveryPrice: 0,
      returnPolicy: 'same',
      minDays: 1,
      advanceNotice: 2,
    },
  ];

  for (const car of cars) {
    const created = await prisma.car.create({ data: car });
    console.log(`✅ Created: ${created.brand} ${created.model} ${created.year} — ${created.dailyPrice} ₾/day — ${created.location}`);
  }

  console.log('\n✅ 3 cars added to admin@waygo.ge');
}

main().catch(console.error).finally(() => prisma.$disconnect());
