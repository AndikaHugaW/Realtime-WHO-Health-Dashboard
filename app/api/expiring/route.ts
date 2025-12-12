import { NextResponse } from 'next/server';
import { checkExpiringMedicines } from '@/lib/inventory-utils';

export async function GET() {
  try {
    const expiringMedicines = await checkExpiringMedicines();
    return NextResponse.json(expiringMedicines);
  } catch (error) {
    console.error('Error fetching expiring medicines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expiring medicines' },
      { status: 500 }
    );
  }
}

