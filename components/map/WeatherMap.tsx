'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  Thermometer,
  CloudRain,
  Snowflake,
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
import { formatTemperature, formatWindSpeed, getWindDirectionLabel, getUvCategory } from '@/lib/weather/utils';
import { LocationInfo } from '@/lib/weather/types/weather';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';

export type WeatherMapLayer = 'snow' | 'precipitation' | 'temperature' | 'wind' | 'clouds' | 'aqi';
export type MapTileStyle = 'dark' | 'light' | 'streets';

interface WeatherMapProps {
  initialLat?: number;
  initialLon?: number;
  initialZoom?: number;
  defaultLayer?: WeatherMapLayer;
  height?: string | number;
  interactive?: boolean;
}

// High-speed, globally reliable tile sources (Zero watermark, zero keys, 100% global CDN uptime)
const getMapStyleSpec = (styleType: MapTileStyle): maplibregl.StyleSpecification => {
  if (styleType === 'dark') {
    return {
      version: 8,
      sources: {
        'esri-dark-base': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '© Esri, HERE, Garmin, © OpenStreetMap contributors',
        },
        'esri-dark-labels': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
        },
      },
      layers: [
        { id: 'esri-dark-base-layer', type: 'raster', source: 'esri-dark-base', minzoom: 0, maxzoom: 19 },
        { id: 'esri-dark-labels-layer', type: 'raster', source: 'esri-dark-labels', minzoom: 0, maxzoom: 19 },
      ],
    };
  }
  if (styleType === 'streets') {
    return {
      version: 8,
      sources: {
        'esri-streets': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '© Esri, OpenStreetMap contributors',
        },
      },
      layers: [
        { id: 'esri-streets-layer', type: 'raster', source: 'esri-streets', minzoom: 0, maxzoom: 19 },
      ],
    };
  }
  // Default light: OpenStreetMap Clean Light
  return {
    version: 8,
    sources: {
      'osm-light': {
        type: 'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      { id: 'osm-light-layer', type: 'raster', source: 'osm-light', minzoom: 0, maxzoom: 19 },
    ],
  };
};

interface ClickedLocationData {
  lat: number;
  lon: number;
  name?: string;
  temp?: number;
  feelsLike?: number;
  condition?: string;
  iconCode?: string;
  precipitation?: number;
  snowfall?: number;
  pop?: number;
  windSpeed?: number;
  windDirection?: number;
  windGust?: number;
  cloudCover?: number;
  humidity?: number;
  uvIndex?: number;
  pressure?: number;
  loading: boolean;
}

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
  const [clickedLocation, setClickedLocation] = useState<ClickedLocationData | null>(null);

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
        customAttribution: '© Esri, © OpenStreetMap contributors',
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
            const cur = data.current || {};
            const d0 = data.daily?.[0] || {};
            setClickedLocation({
              lat,
              lon,
              name: data.location?.name,
              temp: cur.temp,
              feelsLike: cur.feelsLike,
              condition: cur.condition || 'Clear',
              iconCode: cur.iconCode,
              precipitation: cur.precipitation ?? d0.precip ?? 0,
              pop: d0.pop ?? (cur.precipitation > 0 ? 80 : 0),
              windSpeed: cur.windSpeed,
              windDirection: cur.windDirection,
              windGust: cur.windGust,
              cloudCover: cur.cloudCover,
              humidity: cur.humidity,
              uvIndex: cur.uvIndex,
              pressure: cur.pressure,
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
          onClick={() => setActiveLayer('snow')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: activeLayer === 'snow' ? 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)' : 'rgba(15, 23, 42, 0.85)',
            border: activeLayer === 'snow' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            boxShadow: activeLayer === 'snow' ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none',
          }}
        >
          <Snowflake size={13} />
          <span>Snow</span>
        </button>

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
            background: 'rgba(15, 23, 42, 0.96)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            zIndex: 20,
            width: '270px',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: activeLayer === 'snow' ? '#38bdf8' : activeLayer === 'temperature' ? '#f59e0b' : activeLayer === 'wind' ? '#06b6d4' : activeLayer === 'clouds' ? '#94a3b8' : activeLayer === 'aqi' ? '#10b981' : '#38bdf8' }}>
              {activeLayer === 'snow' && <Snowflake size={15} />}
              {activeLayer === 'precipitation' && <CloudRain size={15} />}
              {activeLayer === 'temperature' && <Thermometer size={15} />}
              {activeLayer === 'wind' && <Wind size={15} />}
              {activeLayer === 'clouds' && <Cloud size={15} />}
              {activeLayer === 'aqi' && <Activity size={15} />}
              <span style={{ textTransform: 'capitalize' }}>{activeLayer} Data</span>
            </div>
            <button
              type="button"
              onClick={() => setClickedLocation(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            {clickedLocation.name ? `${clickedLocation.name} • ` : ''}{clickedLocation.lat.toFixed(2)}°N, {clickedLocation.lon.toFixed(2)}°E
          </div>

          {clickedLocation.loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0', fontSize: '0.8rem', color: '#ffffff' }}>
              <Loader2 size={16} className="animate-spin" color="#38bdf8" /> Fetching live metrics...
            </div>
          ) : clickedLocation.temp !== undefined ? (
            <div>
              {/* Active Layer Highlight Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.75rem',
                  marginBottom: '0.65rem',
                }}
              >
                {activeLayer === 'snow' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                        {clickedLocation.temp !== undefined && clickedLocation.temp <= 2 && clickedLocation.precipitation
                          ? `${(clickedLocation.precipitation * 1.0).toFixed(1)} cm`
                          : '0.0 cm'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>est. snowfall</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Snow Hazard: <strong>{clickedLocation.temp !== undefined && clickedLocation.temp <= 0 ? (clickedLocation.pop && clickedLocation.pop > 40 ? 'High (Accumulating Snow)' : 'Moderate (Sub-Zero Temp)') : clickedLocation.temp !== undefined && clickedLocation.temp <= 3 ? 'Low (Near Freezing / Slush)' : 'Zero (Too Warm for Snow)'}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                      Temp: {formatTemperature(clickedLocation.temp, unit)} • Precip: {clickedLocation.precipitation ?? 0} mm
                    </div>
                  </div>
                )}

                {activeLayer === 'precipitation' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                        {clickedLocation.precipitation ?? 0} mm
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>precip</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Rain Probability: <strong>{clickedLocation.pop ?? 0}%</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                      Status: {clickedLocation.precipitation && clickedLocation.precipitation > 0 ? '🌧️ Active Rainfall' : '☀️ Dry Conditions'}
                    </div>
                  </div>
                )}

                {activeLayer === 'temperature' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                        {formatTemperature(clickedLocation.temp, unit)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>temp</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Feels Like: <strong>{formatTemperature(clickedLocation.feelsLike ?? clickedLocation.temp, unit)}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                      Condition: {clickedLocation.condition}
                    </div>
                  </div>
                )}

                {activeLayer === 'wind' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#06b6d4' }}>
                        {formatWindSpeed(clickedLocation.windSpeed ?? 0, 'kmh')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Direction: <strong>{getWindDirectionLabel(clickedLocation.windDirection ?? 0)} ({Math.round(clickedLocation.windDirection ?? 0)}°)</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                      Gusts: {clickedLocation.windGust ? formatWindSpeed(clickedLocation.windGust, 'kmh') : 'Light Breeze'}
                    </div>
                  </div>
                )}

                {activeLayer === 'clouds' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cbd5e1' }}>
                        {clickedLocation.cloudCover ?? 0}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>coverage</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Sky: <strong>{clickedLocation.condition}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                      Humidity: {clickedLocation.humidity ?? 0}%
                    </div>
                  </div>
                )}

                {activeLayer === 'aqi' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                        UV {clickedLocation.uvIndex ?? 0}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Risk: <strong>{getUvCategory(clickedLocation.uvIndex ?? 0).label} Exposure</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                      Pressure: {clickedLocation.pressure ?? 1013} hPa
                    </div>
                  </div>
                )}
              </div>

              {/* 4-Metric Summary Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.4rem',
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  marginBottom: '0.65rem',
                }}
              >
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                  🌡️ Temp: <strong style={{ color: '#fff' }}>{formatTemperature(clickedLocation.temp, unit)}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                  💧 Precip: <strong style={{ color: '#fff' }}>{clickedLocation.precipitation ?? 0}mm</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                  💨 Wind: <strong style={{ color: '#fff' }}>{formatWindSpeed(clickedLocation.windSpeed ?? 0, 'kmh')}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                  ☁️ Cloud: <strong style={{ color: '#fff' }}>{clickedLocation.cloudCover ?? 0}%</strong>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  router.push(`/weather/${clickedLocation.lat.toFixed(2)},${clickedLocation.lon.toFixed(2)}`);
                }}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  background: 'var(--accent-gradient)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
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

      {/* Layer Legend (Positioned neatly above layer pills) */}
      <div
        style={{
          position: 'absolute',
          bottom: '4.25rem',
          left: '1rem',
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '0.4rem 0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.72rem',
          color: '#cbd5e1',
          boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontWeight: 700, color: '#38bdf8', textTransform: 'capitalize' }}>
          {activeLayer} Scale:
        </span>
        {activeLayer === 'snow' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} /> 0 cm (None)
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#67e8f9' }} /> 1-5 cm (Dusting)
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} /> 5-15 cm (Moderate)
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc' }} /> 15+ cm (Blizzard)
          </div>
        )}
        {activeLayer === 'precipitation' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} /> No Rain
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} /> Light (1-5mm)
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} /> Heavy (10mm+)
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc' }} /> Snow
          </div>
        )}
        {activeLayer === 'temperature' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} /> &lt;0°C Freezing
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> 15-25°C Mild
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> 26-35°C Warm
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> 35°C+ Hot
          </div>
        )}
        {activeLayer === 'wind' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> &lt;15 km/h Calm
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} /> 15-30 km/h Breeze
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> 30-50 km/h Strong
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> 50+ km/h Gale
          </div>
        )}
        {activeLayer === 'clouds' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> 0-20% Clear
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} /> 20-70% Partly
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#475569' }} /> 70-100% Overcast
          </div>
        )}
        {activeLayer === 'aqi' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> 0-2 Low
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> 3-5 Moderate
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} /> 6-7 High
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} /> 8+ Extreme
          </div>
        )}
      </div>
    </div>
  );
};
