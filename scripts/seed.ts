// Seed script to populate sample data
// Run with: npx tsx scripts/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample medicines...');

  const sampleMedicines = [
    {
      medicineId: 'OBT-001',
      name: 'Paracetamol 500mg',
      stock: 50,
      minStock: 20,
      maxStock: 100,
      price: 5000,
      expiryDate: new Date('2025-12-31'),
    },
    {
      medicineId: 'OBT-002',
      name: 'Amoxicillin 500mg',
      stock: 15,
      minStock: 20,
      maxStock: 100,
      price: 15000,
      expiryDate: new Date('2025-06-30'),
    },
    {
      medicineId: 'OBT-003',
      name: 'Ibuprofen 400mg',
      stock: 30,
      minStock: 20,
      maxStock: 100,
      price: 8000,
      expiryDate: new Date('2025-08-15'),
    },
    {
      medicineId: 'OBT-004',
      name: 'Cetirizine 10mg',
      stock: 8,
      minStock: 10,
      maxStock: 50,
      price: 12000,
      expiryDate: new Date('2024-05-20'), // Expiring soon
    },
    {
      medicineId: 'OBT-005',
      name: 'Omeprazole 20mg',
      stock: 25,
      minStock: 15,
      maxStock: 80,
      price: 25000,
      expiryDate: new Date('2025-10-10'),
    },
  ];

  for (const medicine of sampleMedicines) {
    await prisma.medicine.upsert({
      where: { medicineId: medicine.medicineId },
      update: {},
      create: medicine,
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

