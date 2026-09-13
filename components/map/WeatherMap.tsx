'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  Cloud,
  Activity,
  Maximize,
  Minimize,
  Navigation,
  Loader2,
  X,
  Search,
  Map as MapIcon,
} from 'lucide-react';
import { POPULAR_CITIES } from '@/lib/location/cities';
import { formatTemperature } from '@/lib/weather/utils';
import { LocationInfo } from '@/lib/weather/types/weather';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';

export type WeatherMapLayer = 'precipitation' | 'temperature' | 'wind' | 'clouds' | 'aqi';
export type MapTileStyle = 'dark' | 'light' | 'streets';

interface WeatherMapProps {
  initialLat?: number;
  initialLon?: number;
  initialZoom?: number;
  defaultLayer?: WeatherMapLayer;
  height?: string | number;
  interactive?: boolean;
}

// Built-in standalone style specifications with 100% global reliability & ZERO watermarks
const getMapStyleSpec = (styleType: MapTileStyle): maplibregl.StyleSpecification => {
  if (styleType === 'dark') {
    return {
      version: 8,
      sources: {
        'esri-dark-base': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '© <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, © OpenStreetMap contributors',
        },
        'esri-dark-labels': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'esri-dark-base-layer',
          type: 'raster',
          source: 'esri-dark-base',
          minzoom: 0,
          maxzoom: 20,
        },
        {
          id: 'esri-dark-labels-layer',
          type: 'raster',
          source: 'esri-dark-labels',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    };
  }

  if (styleType === 'streets') {
    return {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }

  // Default: OpenStreetMap clean light
  return {
    version: 8,
    sources: {
      'osm-light-tiles': {
        type: 'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: 'osm-light-layer',
        type: 'raster',
        source: 'osm-light-tiles',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
};

export const WeatherMap: React.FC<WeatherMapProps> = ({
  initialLat = 22.5726,
  initialLon = 88.3639,
  initialZoom = 5,
  defaultLayer = 'precipitation',
  height = '580px',
  interactive = true,
}) => {
  const router = useRouter();
  const { unit, theme } = useWeatherPreferences();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [activeLayer, setActiveLayer] = useState<WeatherMapLayer>(defaultLayer);
  const [tileStyle, setTileStyle] = useState<MapTileStyle>(theme === 'dark' ? 'dark' : 'light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number;
    lon: number;
    temp?: number;
    condition?: string;
    loading: boolean;
  } | null>(null);

  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync default style with theme switch
  useEffect(() => {
    setTileStyle(theme === 'dark' ? 'dark' : 'light');
  }, [theme]);

  const renderWeatherMarkers = useCallback(
    (map: maplibregl.Map, layer: WeatherMapLayer) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add city markers with smooth client navigation
      POPULAR_CITIES.forEach((city) => {
        const el = document.createElement('div');
        el.className = 'weather-map-marker';
        el.style.padding = '5px 9px';
        el.style.borderRadius = '9999px';
        el.style.fontSize = '12px';
        el.style.fontWeight = '700';
        el.style.color = '#ffffff';
        el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.45)';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '5px';
        el.style.backdropFilter = 'blur(8px)';
        el.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

        let markerContent = '';
        let bgColor = 'rgba(15, 23, 42, 0.9)';

        if (layer === 'precipitation') {
          bgColor = '#0284c7';
          markerContent = `💧 ${city.name}`;
        } else if (layer === 'temperature') {
          bgColor = city.lat > 30 ? '#3b82f6' : '#f59e0b';
          markerContent = `🌡️ ${city.name}`;
        } else if (layer === 'wind') {
          bgColor = '#06b6d4';
          markerContent = `💨 ${city.name}`;
        } else if (layer === 'clouds') {
          bgColor = '#64748b';
          markerContent = `☁️ ${city.name}`;
        } else if (layer === 'aqi') {
          bgColor = '#10b981';
          markerContent = `🍃 ${city.name}`;
        }

        el.style.backgroundColor = bgColor;
        el.innerHTML = markerContent;

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.1)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          router.push(`/weather/${city.slug}`);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([city.lon, city.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    },
    [router]
  );

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyleSpec(tileStyle),
      center: [initialLon, initialLat],
      zoom: initialZoom,
      attributionControl: false,
      interactive,
    });

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: '© Weather Hub, © CARTO, © OpenStreetMap contributors',
      }),
      'bottom-right'
    );

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    }

    const onReady = () => {
      setIsLoading(false);
      map.resize();
      renderWeatherMarkers(map, activeLayer);
    };

    map.on('load', onReady);
    map.on('style.load', onReady);
    map.on('error', (err) => {
      console.warn('MapLibre event notice:', err);
      setIsLoading(false);
    });

    // Safety fallback timer so loading never hangs
    const readyTimer = setTimeout(() => {
      onReady();
    }, 800);

    // Initial and periodic resize for flex containers
    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 250);

    // Click on map to inspect point weather
    if (interactive) {
      map.on('click', async (e) => {
        const lat = Number(e.lngLat.lat.toFixed(4));
        const lon = Number(e.lngLat.lng.toFixed(4));

        setClickedLocation({ lat, lon, loading: true });

        try {
          const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            setClickedLocation({
              lat,
              lon,
              temp: data.current?.temp,
              condition: data.current?.condition || 'Clear',
              loading: false,
            });
          } else {
            setClickedLocation({ lat, lon, loading: false });
          }
        } catch {
          setClickedLocation({ lat, lon, loading: false });
        }
      });
    }

    // Resize on window resize
    const handleResize = () => {
      map.resize();
    };
    window.addEventListener('resize', handleResize);

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update style dynamically when tileStyle changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setStyle(getMapStyleSpec(tileStyle));
    }
  }, [tileStyle]);

  // Update weather markers whenever active layer or unit changes
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      renderWeatherMarkers(mapInstanceRef.current, activeLayer);
    }
  }, [activeLayer, unit, isLoading, renderWeatherMarkers]);

  // Resize when fullscreen state toggles
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.resize();
      }, 150);
    }
  }, [isFullscreen]);

  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapInstanceRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 9,
        essential: true,
      });
    });
  };

  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFullscreen(!isFullscreen);
  };

  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(mapSearchQuery.trim())}&count=4`);
      if (res.ok) {
        const data = await res.json();
        setMapSearchResults(data.results || []);
      }
    } catch {
      setMapSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchLocation = (loc: LocationInfo) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: [loc.lon, loc.lat],
      zoom: 8,
      essential: true,
    });
    setMapSearchResults([]);
    setMapSearchQuery('');
  };

  return (
    <div
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        minHeight: '350px',
        zIndex: isFullscreen ? 9999 : 1,
        borderRadius: isFullscreen ? 0 : 'var(--radius-lg)',
        overflow: 'hidden',
        border: isFullscreen ? 'none' : '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-glass)',
        backgroundColor: '#0f172a',
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            gap: '0.6rem',
            fontSize: '0.9rem',
          }}
        >
          <Loader2 size={24} className="animate-spin" color="#38bdf8" />
          <span>Rendering high-resolution map tiles...</span>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Floating Search & Tools Bar */}
      {interactive && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '4.5rem',
            maxWidth: '360px',
            zIndex: 10,
          }}
        >
          <form onSubmit={handleMapSearch} style={{ position: 'relative' }}>
            <div
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Search size={15} style={{ color: 'var(--text-muted)', marginRight: '0.5rem', flexShrink: 0 }} />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                placeholder="Search location on map..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  flex: 1,
                  minWidth: 0,
                }}
              />
              {isSearching && <Loader2 size={14} className="animate-spin" color="#38bdf8" />}
            </div>

            {mapSearchResults.length > 0 && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'rgba(15, 23, 42, 0.95)',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                {mapSearchResults.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSearchLocation(r);
                    }}
                    onClick={() => handleSelectSearchLocation(r)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {[r.region, r.country].filter(Boolean).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Layer Switcher Pill Bar (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '1rem',
          zIndex: 10,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          maxWidth: 'calc(100% - 2rem)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveLayer('precipitation')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: activeLayer === 'precipitation' ? '#0284c7' : 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          <CloudRain size={13} />
          <span>Precipitation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer('temperature')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: activeLayer === 'temperature' ? '#f59e0b' : 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Thermometer size={13} />
          <span>Temperature</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer('wind')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: activeLayer === 'wind' ? '#06b6d4' : 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Wind size={13} />
          <span>Wind</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer('clouds')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: activeLayer === 'clouds' ? '#64748b' : 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Cloud size={13} />
          <span>Clouds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer('aqi')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: activeLayer === 'aqi' ? '#10b981' : 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Activity size={13} />
          <span>Air Quality</span>
        </button>
      </div>

      {/* Floating Action Controls (Locate & Fullscreen & Theme) */}
      {interactive && (
        <div
          style={{
            position: 'absolute',
            top: '5.5rem',
            right: '0.75rem',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={handleLocateMe}
            title="Center on my location"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Navigation size={16} color="#38bdf8" />
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setTileStyle((prev) => (prev === 'dark' ? 'light' : prev === 'light' ? 'streets' : 'dark'))}
            title={`Current basemap: ${tileStyle}. Click to switch.`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MapIcon size={16} />
          </button>
        </div>
      )}

      {/* Click Inspector Popup */}
      {clickedLocation && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(15, 23, 42, 0.95)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            zIndex: 20,
            maxWidth: '240px',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8' }}>Point Weather</span>
            <button
              type="button"
              onClick={() => setClickedLocation(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {clickedLocation.lat.toFixed(2)}°N, {clickedLocation.lon.toFixed(2)}°E
          </div>

          {clickedLocation.loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#ffffff' }}>
              <Loader2 size={14} className="animate-spin" color="#38bdf8" /> Loading data...
            </div>
          ) : clickedLocation.temp !== undefined ? (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {formatTemperature(clickedLocation.temp, unit)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                {clickedLocation.condition}
              </div>
              <button
                type="button"
                onClick={() => {
                  router.push(`/weather/${clickedLocation.lat.toFixed(2)},${clickedLocation.lon.toFixed(2)}`);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#38bdf8',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                View Full Forecast →
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
              Coordinates selected.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
