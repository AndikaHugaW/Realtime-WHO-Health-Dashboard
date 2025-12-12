import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WHO_API } from '@/lib/who-api';

// POST seed WHO health data
export async function POST() {
  try {
    // Fetch data from WHO API (or use mock data)
    const healthData = await WHO_API.getHealthIndicators();
    
    if (!healthData || healthData.length === 0) {
      return NextResponse.json(
        { error: 'No data available from WHO API' },
        { status: 500 }
      );
    }

    // Store in database
    const created = await Promise.all(
      healthData.map(async (data) => {
        // Check if exists
        const existing = await prisma.healthIndicator.findFirst({
          where: {
            country: data.country,
            indicator: data.indicator,
          },
        });

        if (existing) {
          return prisma.healthIndicator.update({
            where: { id: existing.id },
            data: {
              value: data.value,
              category: data.category,
              date: new Date(data.date),
              isAlert: data.isAlert,
            },
          });
        } else {
          return prisma.healthIndicator.create({
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
      })
    );

    // Also seed outbreaks
    const outbreaks = await WHO_API.getOutbreaks();
    const createdOutbreaks = await Promise.all(
      outbreaks.map(async (outbreak) => {
        const existing = await prisma.outbreakAlert.findFirst({
          where: {
            disease: outbreak.disease,
            country: outbreak.country,
            status: 'active',
          },
        });

        if (existing) {
          return prisma.outbreakAlert.update({
            where: { id: existing.id },
            data: {
              severity: outbreak.severity,
              cases: outbreak.cases,
              status: outbreak.status,
            },
          });
        } else {
          return prisma.outbreakAlert.create({
            data: {
              disease: outbreak.disease,
              country: outbreak.country,
              severity: outbreak.severity,
              cases: outbreak.cases,
              status: outbreak.status,
              reportedAt: new Date(),
            },
          });
        }
      })
    );

    return NextResponse.json({
      message: 'WHO health data seeded successfully',
      healthIndicators: created.length,
      outbreaks: createdOutbreaks.length,
      total: created.length + createdOutbreaks.length,
    });
  } catch (error: any) {
    console.error('Error seeding WHO data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed WHO data' },
      { status: 500 }
    );
  }
}

