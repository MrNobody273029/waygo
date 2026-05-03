import { DEPOSIT_GEL } from './constants';

export type AirportState = 'none' | 'free' | 'paid';

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  location: string;
  dailyPrice: number;
  rating: number;
  trips: number;
  type: string;
  transmission: 'Automatic' | 'Manual';
  fuelType: string;
  seats: number;
  doors: number;
  ac: boolean;
  color: string;
  description: string;
  minDays: number;
  deposit: number;
  host: string;
  verified: boolean;
  images: string[];
  features: string[];
  airportDelivery: {
    tbilisi: { state: AirportState; price: number };
    kutaisi: { state: AirportState; price: number };
    batumi:  { state: AirportState; price: number };
  };
  cityDelivery: { enabled: boolean; city: string; price: number };
  returnLocation: 'same' | 'flexible';
  steeringWheel: string;
}

export const cars: Car[] = [
  {
    id: '1',
    brand: 'Toyota', model: 'Prius', year: 2018,
    location: 'Tbilisi',
    dailyPrice: 95,
    rating: 4.92, trips: 87,
    type: 'Hybrid',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seats: 5, doors: 4, ac: true,
    color: 'Pearl White',
    description: 'Impeccably maintained hybrid sedan — perfect for city driving with exceptional fuel efficiency. Non-smoking, pet-free interior. Bluetooth, backup camera and full GPS included.',
    minDays: 1,
    deposit: 250,
    host: 'Nika',
    verified: true,
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1400&auto=format&fit=crop'],
    features: ['Hybrid Engine', 'Bluetooth', 'Backup Camera', 'GPS Navigation', 'USB Charging', 'Low Fuel Cost'],
    airportDelivery: {
      tbilisi: { state: 'free', price: 0 },
      kutaisi: { state: 'none', price: 0 },
      batumi:  { state: 'none', price: 0 },
    },
    cityDelivery: { enabled: true, city: 'Tbilisi', price: 30 },
    returnLocation: 'same',
    steeringWheel: 'left',
  },
  {
    id: '2',
    brand: 'Subaru', model: 'Forester', year: 2020,
    location: 'Kutaisi',
    dailyPrice: 145,
    rating: 4.88, trips: 43,
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5, doors: 5, ac: true,
    color: 'Crystal Black',
    description: 'Rugged AWD SUV ready for mountain roads and off-road adventures. Roof rack, all-season tyres, child seat available on request. Ideal for trips to Kazbegi or Svaneti.',
    minDays: 2,
    deposit: 300,
    host: 'Mariam',
    verified: true,
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1400&auto=format&fit=crop'],
    features: ['AWD', 'Roof Rack', 'Mountain Ready', 'Child Seat', 'All-Season Tyres', 'Heated Seats'],
    airportDelivery: {
      tbilisi: { state: 'paid', price: 80 },
      kutaisi: { state: 'free', price: 0 },
      batumi:  { state: 'none', price: 0 },
    },
    cityDelivery: { enabled: false, city: 'Kutaisi', price: 0 },
    returnLocation: 'same',
    steeringWheel: 'left',
  },
  {
    id: '3',
    brand: 'Mercedes-Benz', model: 'E-Class', year: 2017,
    location: 'Batumi',
    dailyPrice: 210,
    rating: 4.96, trips: 29,
    type: 'Premium',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 5, doors: 4, ac: true,
    color: 'Obsidian Black',
    description: 'Executive sedan with full leather interior, Burmester sound system and panoramic sunroof. Ideal for business trips or a premium holiday experience along the Black Sea coast.',
    minDays: 2,
    deposit: 500,
    host: 'Giorgi',
    verified: true,
    images: ['https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=1400&auto=format&fit=crop'],
    features: ['Full Leather', 'Premium Audio', 'Sunroof', 'Lane Assist', 'Park Sensors', 'Ambient Lighting'],
    airportDelivery: {
      tbilisi: { state: 'paid', price: 150 },
      kutaisi: { state: 'paid', price: 120 },
      batumi:  { state: 'free', price: 0 },
    },
    cityDelivery: { enabled: true, city: 'Batumi', price: 50 },
    returnLocation: 'flexible',
    steeringWheel: 'left',
  },
];

export type DbCarWithOwner = {
  id: string;
  brand: string;
  model: string;
  year: number;
  location: string;
  dailyPrice: number;
  carType: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  color: string;
  description: string | null;
  minDays: number;
  imageUrls: string[];
  features: string[];
  airportTbilisiState: string;
  airportTbilisiPrice: number;
  airportKutaisiState: string;
  airportKutaisiPrice: number;
  airportBatumiState: string;
  airportBatumiPrice: number;
  cityDeliveryEnabled: boolean;
  cityDeliveryCity: string;
  cityDeliveryPrice: number;
  returnPolicy: string;
  steeringWheel: string;
  estimatedValueUsd: number | null;
  depositGel: number;
  owner: { fullName: string; isVerified: boolean; rating: number; reviewCount: number } | null;
};

export function dbCarToUiCar(c: DbCarWithOwner): Car {
  return {
    id: c.id,
    brand: c.brand,
    model: c.model,
    year: c.year,
    location: c.location,
    dailyPrice: c.dailyPrice,
    rating: c.owner?.rating ?? 0,
    trips: c.owner?.reviewCount ?? 0,
    type: c.carType,
    transmission: c.transmission as 'Automatic' | 'Manual',
    fuelType: c.fuelType,
    seats: c.seats,
    doors: c.doors,
    ac: c.features.some(f => ['AC', 'A/C', 'Air conditioning', 'Air Conditioning', 'Conditioner'].includes(f)),
    color: c.color,
    description: c.description ?? '',
    minDays: c.minDays,
    deposit: c.depositGel ?? 250,
    host: c.owner?.fullName ?? 'Host',
    verified: c.owner?.isVerified ?? false,
    images: c.imageUrls,
    features: c.features,
    airportDelivery: {
      tbilisi: { state: c.airportTbilisiState as AirportState, price: c.airportTbilisiPrice },
      kutaisi: { state: c.airportKutaisiState as AirportState, price: c.airportKutaisiPrice },
      batumi:  { state: c.airportBatumiState as AirportState, price: c.airportBatumiPrice },
    },
    cityDelivery: { enabled: c.cityDeliveryEnabled, city: c.cityDeliveryCity, price: c.cityDeliveryPrice },
    returnLocation: c.returnPolicy as 'same' | 'flexible',
    steeringWheel: c.steeringWheel,
  };
}
