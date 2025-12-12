import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { realtimeEmitter } from '@/lib/realtime';
import { checkAndCreateReorder, checkExpiringMedicines } from '@/lib/inventory-utils';

// GET single medicine
export async function GET(
  request: NextRequest,
  { params }: { params: { medicineId: string } }
) {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { medicineId: params.medicineId },
      include: {
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    if (!medicine) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(medicine);
  } catch (error) {
    console.error('Error fetching medicine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medicine' },
      { status: 500 }
    );
  }
}

// PATCH update stock
export async function PATCH(
  request: NextRequest,
  { params }: { params: { medicineId: string } }
) {
  try {
    const body = await request.json();
    const { event, quantity } = body;

    if (!event || !quantity || (event !== 'sold' && event !== 'added')) {
      return NextResponse.json(
        { error: 'Invalid event or quantity' },
        { status: 400 }
      );
    }

    const medicine = await prisma.medicine.findUnique({
      where: { medicineId: params.medicineId },
    });

    if (!medicine) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    const newStock = event === 'sold' 
      ? medicine.stock - quantity 
      : medicine.stock + quantity;

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Update stock
    const updatedMedicine = await prisma.medicine.update({
      where: { medicineId: params.medicineId },
      data: { stock: newStock },
    });

    // Create transaction record
    const timestamp = Math.floor(Date.now() / 1000);
    await prisma.transaction.create({
      data: {
        medicineId: params.medicineId,
        event,
        quantity,
        timestamp,
      },
    });

    // Emit real-time update
    const stockUpdate = {
      medicine_id: updatedMedicine.medicineId,
      name: updatedMedicine.name,
      stock: updatedMedicine.stock,
      event: event as 'sold' | 'added',
      quantity,
      timestamp,
    };

    realtimeEmitter.emitStockUpdate(stockUpdate);

    // Check if reorder is needed
    if (updatedMedicine.stock <= updatedMedicine.minStock) {
      await checkAndCreateReorder(updatedMedicine.medicineId);
    }

    // Check for expiring medicines
    await checkExpiringMedicines();

    return NextResponse.json({
      ...updatedMedicine,
      lastUpdate: stockUpdate,
    });
  } catch (error: any) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update stock' },
      { status: 500 }
    );
  }
}

