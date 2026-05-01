export interface CarMake {
  name: string;
  models: string[];
}

export const CAR_MAKES: CarMake[] = [
  {
    name: 'Toyota',
    models: ['Camry', 'Corolla', 'Prius', 'RAV4', 'Highlander', 'Land Cruiser', 'Land Cruiser Prado', 'Hilux', 'Yaris', 'Auris', 'Avensis', 'Venza', 'Fortuner', 'Rush', 'C-HR', 'bZ4X', 'Sequoia', 'Tundra', 'Tacoma', '4Runner', 'FJ Cruiser', 'Sienna', 'Alphard', 'Vellfire'],
  },
  {
    name: 'BMW',
    models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX', 'i3', 'i4', 'i5', 'i7', 'M2', 'M3', 'M4', 'M5', 'M8', 'Z4'],
  },
  {
    name: 'Mercedes-Benz',
    models: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'AMG GT', 'SL', 'V-Class', 'Vito', 'Sprinter'],
  },
  {
    name: 'Audi',
    models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron', 'S3', 'S4', 'S5', 'S6', 'RS3', 'RS4', 'RS6', 'RS7'],
  },
  {
    name: 'Volkswagen',
    models: ['Golf', 'Polo', 'Passat', 'Tiguan', 'Touareg', 'T-Cross', 'T-Roc', 'ID.3', 'ID.4', 'ID.6', 'Arteon', 'Scirocco', 'CC', 'Jetta', 'Beetle', 'Phaeton', 'Multivan', 'Caravelle', 'Transporter'],
  },
  {
    name: 'Hyundai',
    models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Nexo', 'Accent', 'Veloster', 'i10', 'i20', 'i30', 'Creta', 'Venue', 'NEXO'],
  },
  {
    name: 'Kia',
    models: ['Rio', 'Cerato', 'K5', 'K8', 'Sportage', 'Sorento', 'Telluride', 'Stinger', 'Soul', 'Seltos', 'Niro', 'EV6', 'EV9', 'Carnival', 'Stonic', 'Picanto', 'Ceed', 'ProCeed', 'Xceed'],
  },
  {
    name: 'Lexus',
    models: ['IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'GX', 'LX', 'RC', 'LC', 'CT', 'RZ'],
  },
  {
    name: 'Honda',
    models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Passport', 'Ridgeline', 'Odyssey', 'Fit', 'Jazz', 'Insight', 'e:Ny1', 'ZR-V'],
  },
  {
    name: 'Nissan',
    models: ['Altima', 'Maxima', 'Sentra', 'Versa', 'Qashqai', 'X-Trail', 'Rogue', 'Pathfinder', 'Murano', 'Armada', 'Patrol', 'Juke', 'Kicks', 'GT-R', 'Leaf', '370Z', '400Z'],
  },
  {
    name: 'Mazda',
    models: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-9', 'MX-5', 'MX-30'],
  },
  {
    name: 'Subaru',
    models: ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'WRX', 'BRZ', 'Solterra'],
  },
  {
    name: 'Mitsubishi',
    models: ['Lancer', 'Galant', 'Outlander', 'Eclipse Cross', 'ASX', 'Pajero', 'L200', 'Mirage', 'Eclipse', 'Outlander PHEV'],
  },
  {
    name: 'Ford',
    models: ['Fiesta', 'Focus', 'Mondeo', 'Fusion', 'Mustang', 'Explorer', 'Expedition', 'F-150', 'Ranger', 'Edge', 'Escape', 'EcoSport', 'Bronco', 'Maverick', 'Puma', 'Kuga'],
  },
  {
    name: 'Chevrolet',
    models: ['Spark', 'Aveo', 'Cruze', 'Malibu', 'Impala', 'Camaro', 'Corvette', 'Captiva', 'Equinox', 'Trax', 'Blazer', 'Traverse', 'Tahoe', 'Suburban', 'Silverado', 'Colorado'],
  },
  {
    name: 'Opel',
    models: ['Corsa', 'Astra', 'Insignia', 'Zafira', 'Mokka', 'Grandland', 'Crossland', 'Vectra', 'Omega', 'Combo'],
  },
  {
    name: 'Peugeot',
    models: ['208', '308', '508', '2008', '3008', '5008', 'Rifter', 'Traveller', 'e-208', 'e-2008'],
  },
  {
    name: 'Renault',
    models: ['Clio', 'Megane', 'Laguna', 'Talisman', 'Captur', 'Kadjar', 'Koleos', 'Duster', 'Arkana', 'Austral', 'Zoe', 'Kangoo', 'Trafic', 'Master'],
  },
  {
    name: 'Skoda',
    models: ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
  },
  {
    name: 'Seat',
    models: ['Ibiza', 'Leon', 'Ateca', 'Arona', 'Tarraco', 'Alhambra'],
  },
  {
    name: 'Volvo',
    models: ['S40', 'S60', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40 Recharge', 'EX30', 'EX90'],
  },
  {
    name: 'Land Rover',
    models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Freelander'],
  },
  {
    name: 'Jaguar',
    models: ['XE', 'XF', 'XJ', 'E-Pace', 'F-Pace', 'I-Pace', 'F-Type'],
  },
  {
    name: 'Porsche',
    models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'],
  },
  {
    name: 'Tesla',
    models: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  },
  {
    name: 'Jeep',
    models: ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Commander'],
  },
  {
    name: 'Dodge',
    models: ['Charger', 'Challenger', 'Durango', 'Journey'],
  },
  {
    name: 'Chrysler',
    models: ['300', 'Pacifica', 'Voyager'],
  },
  {
    name: 'Cadillac',
    models: ['CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq'],
  },
  {
    name: 'Buick',
    models: ['Encore', 'Envision', 'Enclave', 'LaCrosse'],
  },
  {
    name: 'Alfa Romeo',
    models: ['Giulia', 'Stelvio', 'Tonale', 'Giulietta', '159', 'MiTo'],
  },
  {
    name: 'Fiat',
    models: ['Punto', '500', 'Tipo', 'Bravo', 'Doblo', 'Panda', '500X', '500L'],
  },
  {
    name: 'Lancia',
    models: ['Ypsilon', 'Delta', 'Thema'],
  },
  {
    name: 'Maserati',
    models: ['Ghibli', 'Quattroporte', 'Levante', 'Grecale', 'GranTurismo'],
  },
  {
    name: 'Ferrari',
    models: ['Roma', 'Portofino', 'SF90', 'F8', '296', '812', 'Purosangue'],
  },
  {
    name: 'Lamborghini',
    models: ['Urus', 'Huracan', 'Revuelto'],
  },
  {
    name: 'MINI',
    models: ['Cooper', 'Countryman', 'Clubman', 'Paceman', 'Convertible', 'Clubman'],
  },
  {
    name: 'Infiniti',
    models: ['Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX55', 'QX60', 'QX80'],
  },
  {
    name: 'Acura',
    models: ['ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX'],
  },
  {
    name: 'Genesis',
    models: ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  },
  {
    name: 'Lada',
    models: ['Vesta', 'Granta', 'Largus', 'XRAY', 'Niva', 'Niva Legend', 'Priora', '4x4', 'Kalina', 'Samara'],
  },
  {
    name: 'UAZ',
    models: ['Patriot', 'Hunter', 'Pickup', 'Profi'],
  },
  {
    name: 'GAZ',
    models: ['Gazelle', 'Sobol'],
  },
  {
    name: 'Daewoo',
    models: ['Nexia', 'Matiz', 'Lacetti', 'Espero', 'Nubira', 'Gentra'],
  },
  {
    name: 'Geely',
    models: ['Atlas', 'Coolray', 'Tugella', 'Emgrand', 'Monjaro', 'Okavango'],
  },
  {
    name: 'Haval',
    models: ['H2', 'H6', 'H9', 'Jolion', 'Dargo', 'F7'],
  },
  {
    name: 'Chery',
    models: ['Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5', 'Arrizo 6'],
  },
  {
    name: 'BYD',
    models: ['Han', 'Tang', 'Song', 'Seal', 'Atto 3', 'Dolphin'],
  },
  {
    name: 'Changan',
    models: ['CS35', 'CS55', 'CS75', 'CS95', 'Uni-K', 'Uni-T'],
  },
  {
    name: 'Isuzu',
    models: ['D-Max', 'MU-X', 'Trooper'],
  },
  {
    name: 'SsangYong',
    models: ['Tivoli', 'Korando', 'Rexton', 'Musso', 'Actyon'],
  },
  {
    name: 'Dacia',
    models: ['Sandero', 'Logan', 'Duster', 'Jogger', 'Bigster'],
  },
  {
    name: 'Citroën',
    models: ['C1', 'C3', 'C4', 'C5', 'C5 X', 'Berlingo', 'Jumpy', 'C3 Aircross', 'C5 Aircross'],
  },
  {
    name: 'Suzuki',
    models: ['Swift', 'Baleno', 'Vitara', 'S-Cross', 'Jimny', 'Ignis', 'Grand Vitara', 'Ertiga'],
  },
  {
    name: 'Daihatsu',
    models: ['Terios', 'Move', 'Sirion', 'YRV'],
  },
];

export const MAKE_NAMES = CAR_MAKES.map(m => m.name).sort();

export const BRAND_LOGOS: Record<string, string> = {
  'Toyota': 'https://logo.clearbit.com/toyota.com',
  'BMW': 'https://logo.clearbit.com/bmw.com',
  'Mercedes-Benz': 'https://logo.clearbit.com/mercedes-benz.com',
  'Audi': 'https://logo.clearbit.com/audi.com',
  'Volkswagen': 'https://logo.clearbit.com/vw.com',
  'Hyundai': 'https://logo.clearbit.com/hyundai.com',
  'Kia': 'https://logo.clearbit.com/kia.com',
  'Lexus': 'https://logo.clearbit.com/lexus.com',
  'Honda': 'https://logo.clearbit.com/honda.com',
  'Nissan': 'https://logo.clearbit.com/nissan.com',
  'Mazda': 'https://logo.clearbit.com/mazda.com',
  'Subaru': 'https://logo.clearbit.com/subaru.com',
  'Mitsubishi': 'https://logo.clearbit.com/mitsubishi.com',
  'Ford': 'https://logo.clearbit.com/ford.com',
  'Chevrolet': 'https://logo.clearbit.com/chevrolet.com',
  'Tesla': 'https://logo.clearbit.com/tesla.com',
  'Opel': 'https://logo.clearbit.com/opel.com',
  'Peugeot': 'https://logo.clearbit.com/peugeot.com',
  'Renault': 'https://logo.clearbit.com/renault.com',
  'Skoda': 'https://logo.clearbit.com/skoda-auto.com',
  'Seat': 'https://logo.clearbit.com/seat.com',
  'Volvo': 'https://logo.clearbit.com/volvocars.com',
  'Land Rover': 'https://logo.clearbit.com/landrover.com',
  'Jaguar': 'https://logo.clearbit.com/jaguar.com',
  'Porsche': 'https://logo.clearbit.com/porsche.com',
  'Ferrari': 'https://logo.clearbit.com/ferrari.com',
  'Lamborghini': 'https://logo.clearbit.com/lamborghini.com',
  'MINI': 'https://logo.clearbit.com/mini.com',
  'Infiniti': 'https://logo.clearbit.com/infiniti.com',
  'Genesis': 'https://logo.clearbit.com/genesis.com',
  'Jeep': 'https://logo.clearbit.com/jeep.com',
  'Alfa Romeo': 'https://logo.clearbit.com/alfaromeo.com',
  'Fiat': 'https://logo.clearbit.com/fiat.com',
  'Suzuki': 'https://logo.clearbit.com/suzuki.com',
  'Dodge': 'https://logo.clearbit.com/dodge.com',
  'Cadillac': 'https://logo.clearbit.com/cadillac.com',
  'Buick': 'https://logo.clearbit.com/buick.com',
  'Acura': 'https://logo.clearbit.com/acura.com',
  'Chrysler': 'https://logo.clearbit.com/chrysler.com',
  'BYD': 'https://logo.clearbit.com/byd.com',
  'Geely': 'https://logo.clearbit.com/geely.com',
  'Haval': 'https://logo.clearbit.com/haval.com',
  'Dacia': 'https://logo.clearbit.com/dacia.com',
  'Citroën': 'https://logo.clearbit.com/citroen.com',
  'Isuzu': 'https://logo.clearbit.com/isuzu.com',
  'SsangYong': 'https://logo.clearbit.com/ssangyong.com',
  'Maserati': 'https://logo.clearbit.com/maserati.com',
};

export const POPULAR_BRANDS = [
  'Toyota', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
  'Hyundai', 'Kia', 'Lexus', 'Honda', 'Nissan',
  'Subaru', 'Ford', 'Tesla', 'Porsche', 'Land Rover',
  'Mitsubishi', 'Mazda', 'Opel', 'Renault', 'Chevrolet',
];

export function getModelsForMake(makeName: string): string[] {
  return CAR_MAKES.find(m => m.name === makeName)?.models ?? [];
}

export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = Array.from(
  { length: CURRENT_YEAR - 1994 },
  (_, i) => CURRENT_YEAR - i,
);
