'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Map } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Import Highcharts at top level to avoid chunk loading issues
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Initialize Map module at module level (only once)
if (typeof window !== 'undefined' && typeof Highcharts === 'object') {
  try {
    // Use dynamic require to load map module
    const HighchartsMap = require('highcharts/modules/map');
    if (HighchartsMap && typeof HighchartsMap.default === 'function') {
      HighchartsMap.default(Highcharts);
    } else if (typeof HighchartsMap === 'function') {
      HighchartsMap(Highcharts);
    }
  } catch (error) {
    console.warn('[WorldMap] Could not initialize map module at module level:', error);
  }
}

// Cache untuk topology
let topologyCache: any = null;

interface HealthIndicator {
  id?: string;
  country: string;
  indicator: string;
  value: number;
  category?: string;
  date?: string;
}

interface WorldMapProps {
  indicators?: HealthIndicator[];
}

// Country name to Highcharts hc-key mapping
const COUNTRY_TO_HCKEY: Record<string, string> = {
  'Indonesia': 'id',
  'Malaysia': 'my',
  'Singapore': 'sg',
  'Thailand': 'th',
  'Philippines': 'ph',
  'Vietnam': 'vn',
  'India': 'in',
  'China': 'cn',
  'Japan': 'jp',
  'South Korea': 'kr',
  'Australia': 'au',
  'New Zealand': 'nz',
  'United States': 'us',
  'United Kingdom': 'gb',
  'France': 'fr',
  'Germany': 'de',
  'Brazil': 'br',
  'Mexico': 'mx',
  'Canada': 'ca',
  'Russia': 'ru',
};

// Get color based on value range (neon colors)
const getColorByValue = (value: number, maxValue: number): string => {
  if (value === 0) return '#1a1a1a'; // Dark for no data
  
  const ratio = value / maxValue;
  
  if (ratio >= 0.8) return 'hsl(326, 78%, 68%)'; // Neon Pink - High
  if (ratio >= 0.6) return 'hsl(182, 91%, 60%)'; // Neon Cyan - Medium-High
  if (ratio >= 0.4) return 'hsl(48, 96%, 63%)'; // Neon Yellow - Medium
  if (ratio >= 0.2) return 'hsl(142, 76%, 55%)'; // Neon Green - Low-Medium
  return 'hsl(25, 95%, 63%)'; // Neon Orange - Low
};

export default function WorldMap({ indicators = [] }: WorldMapProps) {
  const [mapOptions, setMapOptions] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartComponentRef = useRef<any>(null);
  const chartInstanceRef = useRef<any>(null);

  // Memoize data processing
  const processedData = useMemo(() => {
    const safeIndicators = Array.isArray(indicators) ? indicators : [];
    
    // Get total cases per country
    const countryData = safeIndicators
      .filter(i => i && i.indicator === 'Total Cases')
      .reduce((acc, curr) => {
        if (!acc[curr.country]) {
          acc[curr.country] = 0;
        }
        acc[curr.country] += curr.value || 0;
        return acc;
      }, {} as Record<string, number>);

    const maxValue = Math.max(...Object.values(countryData), 1);

    // Create map data array
    const mapData = Object.entries(countryData).map(([country, value]) => {
      const hcKey = COUNTRY_TO_HCKEY[country] || country.toLowerCase().substring(0, 2);
      const totalCases = Math.floor(value / 1000);
      
      // Get additional info
      const countryIndicators = safeIndicators.filter(i => i.country === country);
      const deaths = countryIndicators.find(i => i.indicator === 'Deaths')?.value || 0;
      const recovered = countryIndicators.find(i => i.indicator === 'Recovered')?.value || 0;
      
      return {
        'hc-key': hcKey,
        value: totalCases,
        color: getColorByValue(value, maxValue),
        info: `
          <b>${country}</b><br/>
          Total Cases: ${totalCases.toLocaleString('id-ID')}K<br/>
          Deaths: ${Math.floor(deaths / 100).toLocaleString('id-ID')}00<br/>
          Recovered: ${Math.floor(recovered / 1000).toLocaleString('id-ID')}K
        `,
      };
    });

    return { mapData, maxValue };
  }, [indicators]);

  // Load topology and create initial map options (only once)
  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      if (isReady) return; // Already initialized

      try {
        console.log('[WorldMap] Initializing map...');
        
        // Load topology
        let topology;
        if (topologyCache) {
          topology = topologyCache;
          console.log('[WorldMap] Using cached topology');
        } else {
          console.log('[WorldMap] Loading topology...');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          try {
            const response = await fetch(
              'https://code.highcharts.com/mapdata/custom/world-lowres.topo.json',
              { cache: 'force-cache', signal: controller.signal }
            );
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            topology = await response.json();
            topologyCache = topology;
            console.log('[WorldMap] Topology loaded');
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              throw new Error('Topology fetch timeout');
            }
            throw fetchError;
          }
        }

        if (!mounted) return;

        // Create initial map options with empty data first
        const { mapData } = processedData;
        
        const options = {
          chart: {
            map: topology,
            backgroundColor: 'transparent',
            height: 500,
            animation: false,
          },
          title: {
            text: '',
          },
          mapNavigation: {
            enabled: true,
            buttonOptions: {
              verticalAlign: 'bottom',
            },
          },
          colorAxis: {
            min: 0,
            stops: [
              [0, 'hsl(25, 95%, 63%)'],
              [0.2, 'hsl(142, 76%, 55%)'],
              [0.4, 'hsl(48, 96%, 63%)'],
              [0.6, 'hsl(182, 91%, 60%)'],
              [0.8, 'hsl(326, 78%, 68%)'],
            ],
          },
          legend: {
            enabled: false,
          },
          plotOptions: {
            map: {
              animation: false,
              nullColor: '#2a2a2a',
              borderColor: '#404040',
              borderWidth: 0.5,
              states: {
                hover: {
                  brightness: 0.2,
                  borderColor: '#fff',
                  borderWidth: 2,
                  animation: false,
                },
              },
            },
            series: {
              animation: false,
            },
          },
          tooltip: {
            useHTML: true,
            formatter: function(this: any) {
              const point = this.point;
              if (point && point.info) {
                return point.info;
              }
              return `<b>${point.name || 'Unknown'}</b><br/>Value: ${point.value || 0}`;
            },
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            style: {
              color: '#fff',
            },
          },
          mapView: {
            fitToGeometry: {
              type: 'MultiPoint',
              coordinates: [
                [-164, 54],
                [-35, 84],
                [179, -38],
                [-68, -55],
              ],
            },
          },
          series: [
            {
              type: 'map',
              name: 'Health Data',
              data: mapData,
              keys: ['hc-key', 'value', 'color', 'info'],
              joinBy: 'hc-key',
              animation: false,
              enableMouseTracking: true,
              states: {
                hover: {
                  brightness: 0.2,
                  animation: false,
                },
              },
            },
          ],
        };

        if (!mounted) return;

        setMapOptions(options);
        setIsReady(true);
        console.log('[WorldMap] Map ready!');
      } catch (err: any) {
        console.error('[WorldMap] Error:', err);
        if (mounted) {
          setError(err.message || 'Failed to load map');
          setIsReady(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Update data separately without recreating chart
  useEffect(() => {
    if (!isReady) return;

    // Use setTimeout to ensure chart is fully rendered
    const timeoutId = setTimeout(() => {
      if (!chartInstanceRef.current) return;

      const chart = chartInstanceRef.current.chart;
      if (!chart || !chart.series || !chart.series[0]) return;

      const { mapData } = processedData;
      
      try {
        // Disable animations globally before update
        chart.series[0].update({
          animation: false
        }, false);

        // Update data directly using setData without animation and without redraw
        chart.series[0].setData(mapData, false, false, false);
        
        // Update colors manually for each point
        if (chart.series[0].points) {
          chart.series[0].points.forEach((point: any) => {
            const dataPoint = mapData.find((d: any) => d['hc-key'] === point.options?.['hc-key']);
            if (dataPoint && point.graphic) {
              // Update color directly on SVG element to avoid redraw
              point.color = dataPoint.color;
              if (point.graphic.element) {
                point.graphic.element.setAttribute('fill', dataPoint.color);
              }
            }
          });
        }
        
        // Single redraw without animation
        chart.redraw(false);
      } catch (err) {
        console.error('[WorldMap] Error updating data:', err);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [processedData, isReady]);

  const hasData = processedData.mapData && processedData.mapData.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>World Health Map</CardTitle>
            <CardDescription>Distribusi data kesehatan global berdasarkan negara</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Map className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-lg font-semibold mb-1 text-red-400">Error Loading Map</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : !isReady || !mapOptions ? (
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <Map className="w-8 h-8 animate-pulse" />
              </div>
              <p className="text-lg font-semibold mb-1">Memuat Peta Dunia</p>
              <p className="text-sm">Loading world map data...</p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <HighchartsReact
              ref={(ref) => {
                chartComponentRef.current = ref;
                if (ref) {
                  chartInstanceRef.current = ref;
                }
              }}
              highcharts={Highcharts}
              constructorType={'mapChart'}
              options={mapOptions}
              allowChartUpdate={false}
              immutable={true}
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[hsl(25,95%,63%)]" />
                <span className="text-muted-foreground">Rendah</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[hsl(142,76%,55%)]" />
                <span className="text-muted-foreground">Sedang Rendah</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[hsl(48,96%,63%)]" />
                <span className="text-muted-foreground">Sedang</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[hsl(182,91%,60%)]" />
                <span className="text-muted-foreground">Sedang Tinggi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[hsl(326,78%,68%)]" />
                <span className="text-muted-foreground">Tinggi</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
