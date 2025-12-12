import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WHO_API } from '@/lib/who-api';

// GET all outbreak alerts
export async function GET() {
  try {
    // Always fetch fresh data from WHO API first
    const mockOutbreaks = await WHO_API.getOutbreaks();
    
    // Try to store in database (but don't fail if database error)
    if (mockOutbreaks && mockOutbreaks.length > 0) {
      try {
        await Promise.all(
          mockOutbreaks.map(async (outbreak) => {
            try {
              const existing = await prisma.outbreakAlert.findFirst({
                where: {
                  disease: outbreak.disease,
                  country: outbreak.country,
                  status: 'active',
                },
              });

              if (existing) {
                await prisma.outbreakAlert.update({
                  where: { id: existing.id },
                  data: {
                    severity: outbreak.severity,
                    cases: outbreak.cases,
                    status: outbreak.status,
                  },
                });
              } else {
                await prisma.outbreakAlert.create({
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
            } catch (dbError) {
              // Ignore individual errors
              console.log('Could not store outbreak in DB:', dbError);
            }
          })
        );
      } catch (dbError) {
        // Database might not be migrated yet - that's OK
        console.log('Database operation failed (may need migration):', dbError);
      }
    }

    // Try to get from database
    try {
      const dbOutbreaks = await prisma.outbreakAlert.findMany({
        where: { status: 'active' },
        orderBy: { reportedAt: 'desc' },
      });
      
      if (dbOutbreaks.length > 0) {
        return NextResponse.json(dbOutbreaks);
      }
    } catch (dbError) {
      // Database error - use mock data
      console.log('Database query failed, using mock outbreaks:', dbError);
    }

    // ALWAYS return data (mock data if database fails)
    return NextResponse.json(mockOutbreaks || []);
  } catch (error) {
    console.error('Error fetching outbreaks:', error);
    // Return empty array instead of error to prevent crashes
    return NextResponse.json([]);
  }
}

