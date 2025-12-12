import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all reorder requests
export async function GET() {
  try {
    const requests = await prisma.reorderRequest.findMany({
      include: {
        medicine: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching reorder requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reorder requests' },
      { status: 500 }
    );
  }
}

// POST mark reorder as sent/completed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      );
    }

    const reorderRequest = await prisma.reorderRequest.update({
      where: { id },
      data: { status },
      include: {
        medicine: true,
      },
    });

    // If status is completed, update stock
    if (status === 'completed') {
      await prisma.medicine.update({
        where: { medicineId: reorderRequest.medicineId },
        data: {
          stock: {
            increment: reorderRequest.quantity,
          },
        },
      });
    }

    return NextResponse.json(reorderRequest);
  } catch (error: any) {
    console.error('Error updating reorder request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reorder request' },
      { status: 500 }
    );
  }
}

