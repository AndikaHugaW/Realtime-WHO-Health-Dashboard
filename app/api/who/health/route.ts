import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WHO_API } from '@/lib/who-api';

// GET all health indicators
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');

    // ALWAYS get data from WHO API (with mock fallback)
    // This ensures data is always available even if database is not migrated
    const healthData = await WHO_API.getHealthIndicators(country || undefined);
    
    // Try to store in database (but don't fail if database error)
    if (healthData && healthData.length > 0) {
      try {
        await Promise.all(
          healthData.slice(0, 50).map(async (data) => {
            try {
              const existing = await prisma.healthIndicator.findFirst({
                where: {
                  country: data.country,
                  indicator: data.indicator,
                },
              });

              if (existing) {
                await prisma.healthIndicator.update({
                  where: { id: existing.id },
                  data: {
                    value: data.value,
                    category: data.category,
                    date: new Date(data.date),
                    isAlert: data.isAlert,
                  },
                });
              } else {
                await prisma.healthIndicator.create({
                  data: {
                    country: data.country,
                    indicator: data.indicator,
                    value: data.value,
                    category: data.category,
                    date: new Date(data.date),
                    isAlert: data.isAlert,
                  },
                });
              }
            } catch (dbError: any) {
              // Ignore database errors - data will still be returned
              // Table might not exist yet (database not migrated)
            }
          })
        );
      } catch (dbError: any) {
        // Database might not be migrated yet - that's OK, we still return data
        console.log('Database operation failed (may need migration):', dbError.message);
      }
    }
    
    // ALWAYS return data (mock data if WHO API fails, which shouldn't happen)
    return NextResponse.json(healthData || []);
  } catch (error: any) {
    console.error('Error in GET /api/who/health:', error);
    // Final fallback: return mock data
    try {
      const mockData = await WHO_API.getHealthIndicators();
      return NextResponse.json(mockData || []);
    } catch (mockError) {
      return NextResponse.json([]);
    }
  }
}

// POST create/update health indicator
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, indicator, value, category, isAlert } = body;

    const healthIndicator = await prisma.healthIndicator.create({
      data: {
        country,
        indicator,
        value,
        category: category || 'disease',
        date: new Date(),
        isAlert: isAlert || false,
      },
    });

    return NextResponse.json(healthIndicator, { status: 201 });
  } catch (error: any) {
    console.error('Error creating health indicator:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create health indicator' },
      { status: 500 }
    );
  }
}
