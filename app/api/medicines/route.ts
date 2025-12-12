import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { realtimeEmitter } from '@/lib/realtime';

// GET all medicines
export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medicines' },
      { status: 500 }
    );
  }
}

// POST create new medicine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicineId, name, stock, minStock, maxStock, price, expiryDate } = body;

    const initialStock = stock || 0;
    const medicine = await prisma.medicine.create({
      data: {
        medicineId,
        name,
        stock: initialStock,
        minStock: minStock || 10,
        maxStock: maxStock || 100,
        price,
        expiryDate: new Date(expiryDate),
      },
    });

    // Jika ada stok awal, emit real-time update untuk penambahan stok
    if (initialStock > 0) {
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Create transaction record untuk stok awal
      await prisma.transaction.create({
        data: {
          medicineId: medicine.medicineId,
          event: 'added',
          quantity: initialStock,
          timestamp,
        },
      });

      // Emit real-time update
      const stockUpdate = {
        medicine_id: medicine.medicineId,
        name: medicine.name,
        stock: medicine.stock,
        event: 'added' as const,
        quantity: initialStock,
        timestamp,
      };

      realtimeEmitter.emitStockUpdate(stockUpdate);
    }

    return NextResponse.json(medicine, { status: 201 });
  } catch (error: any) {
    console.error('Error creating medicine:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create medicine' },
      { status: 500 }
    );
  }
}

