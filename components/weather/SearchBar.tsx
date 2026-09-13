'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X, Loader2, Navigation, History, Star } from 'lucide-react';
import { LocationInfo } from '@/lib/weather/types/weather';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search city, town or location...',
  autoFocus = false,
  className = '',
}) => {
  const router = useRouter();
  const { addRecentSearch, recentSearches, clearRecentSearches, favorites } = useWeatherPreferences();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}&count=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: LocationInfo) => {
    addRecentSearch(loc);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);

    if (loc.slug) {
      router.push(`/weather/${loc.slug}`);
    } else {
      router.push(`/weather/${loc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data.location) {
              handleSelectLocation(data.location);
              return;
            }
          }
          // Fallback coordinate routing
          router.push(`/weather/${lat.toFixed(2)},${lon.toFixed(2)}`);
          setIsOpen(false);
        } catch {
          router.push(`/weather/${lat.toFixed(2)},${lon.toFixed(2)}`);
          setIsOpen(false);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        alert(err.message || 'Unable to retrieve your location.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = query.trim().length >= 2 ? results : recentSearches;
    if (!isOpen || list.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < list.length) {
        handleSelectLocation(list[selectedIndex]);
      } else if (results.length > 0) {
        handleSelectLocation(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`search-container ${className}`} style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '0.6rem 1rem',
          backdropFilter: 'blur(10px)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        }}
      >
        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.6rem', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}

        {isLoading ? (
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem' }} />
        ) : (
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            title="Use my current location"
            aria-label="Use current location"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              padding: '0.3rem 0.65rem',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            <Navigation size={13} style={{ color: '#38bdf8' }} />
            <span className="location-btn-text">Near me</span>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          className="glass-panel custom-scrollbar"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            maxHeight: '340px',
            overflowY: 'auto',
            zIndex: 100,
            padding: '0.5rem',
          }}
        >
          {results.length > 0 ? (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.4rem 0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Search Results
              </div>
              {results.map((loc, idx) => (
                <button
                  key={`${loc.lat}-${loc.lon}-${idx}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectLocation(loc);
                  }}
                  onClick={() => handleSelectLocation(loc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedIndex === idx ? 'var(--bg-glass)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{loc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {[loc.region, loc.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                    {loc.countryCode}
                  </span>
                </button>
              ))}
            </div>
          ) : query.trim().length >= 2 && !isLoading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No matching locations found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div>
              {/* Favorites Quick List */}
              {favorites.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.4rem 0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Star size={12} style={{ color: '#f59e0b' }} /> Favorites
                  </div>
                  {favorites.slice(0, 4).map((fav, idx) => (
                    <button
                      key={`fav-${fav.name}-${idx}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectLocation(fav);
                      }}
                      onClick={() => handleSelectLocation(fav)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <MapPin size={14} style={{ color: '#f59e0b', marginRight: '0.5rem' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{fav.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({fav.countryCode})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <History size={12} /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        clearRecentSearches();
                      }}
                      onClick={clearRecentSearches}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((rec, idx) => (
                    <button
                      key={`rec-${rec.name}-${idx}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectLocation(rec);
                      }}
                      onClick={() => handleSelectLocation(rec)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.85rem' }}>{rec.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.country}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '0.75rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Type a city name (e.g., Kolkata, London, New York, Tokyo)...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
