import { prisma } from './prisma';
import { addDays, isBefore, differenceInDays } from 'date-fns';

// Check and create reorder request if stock is low
export async function checkAndCreateReorder(medicineId: string) {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { medicineId },
    });

    if (!medicine) return;

    // Check if stock is below minimum
    if (medicine.stock > medicine.minStock) return;

    // Check if there's already a pending reorder
    const existingReorder = await prisma.reorderRequest.findFirst({
      where: {
        medicineId,
        status: 'pending',
      },
    });

    if (existingReorder) return;

    // Calculate reorder quantity (bring stock to max)
    const reorderQuantity = medicine.maxStock - medicine.stock;

    // Create reorder request
    await prisma.reorderRequest.create({
      data: {
        medicineId,
        quantity: reorderQuantity,
        status: 'pending',
      },
    });

    console.log(`Reorder request created for ${medicine.name}: ${reorderQuantity} units`);
  } catch (error) {
    console.error('Error creating reorder request:', error);
  }
}

// Check for medicines that will expire soon (within 30 days)
export async function checkExpiringMedicines() {
  try {
    const thirtyDaysFromNow = addDays(new Date(), 30);

    const expiringMedicines = await prisma.medicine.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow,
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    return expiringMedicines;
  } catch (error) {
    console.error('Error checking expiring medicines:', error);
    return [];
  }
}

// Get expiration status
export function getExpirationStatus(expiryDate: Date): {
  status: 'expired' | 'expiring_soon' | 'ok';
  daysLeft: number;
} {
  const now = new Date();
  const daysLeft = differenceInDays(expiryDate, now);

  if (isBefore(expiryDate, now)) {
    return { status: 'expired', daysLeft: 0 };
  }

  if (daysLeft <= 30) {
    return { status: 'expiring_soon', daysLeft };
  }

  return { status: 'ok', daysLeft };
}

