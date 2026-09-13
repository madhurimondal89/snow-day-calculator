'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { WeatherData } from '@/lib/weather/types/weather';
import { formatTemperature, formatWindSpeed } from '@/lib/weather/utils';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';

interface LocationFAQProps {
  data: WeatherData;
}

export const LocationFAQ: React.FC<LocationFAQProps> = ({ data }) => {
  const { unit } = useWeatherPreferences();
  const { location, current, daily, airQuality } = data;
  const today = daily?.[0];

  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleAccordion = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqs = [
    {
      question: `What is the current weather and temperature in ${location.name}?`,
      answer: `Currently, ${location.name} is experiencing ${current.condition.toLowerCase()} with an ambient temperature of ${formatTemperature(
        current.temp,
        unit
      )} (feels like ${formatTemperature(current.feelsLike, unit)}). The relative humidity is ${current.humidity}%, with winds blowing at ${formatWindSpeed(current.windSpeed)}.`,
    },
    {
      question: `Is it going to rain in ${location.name} today?`,
      answer: today
        ? today.pop >= 40
          ? `Yes, there is an elevated ${today.pop}% chance of precipitation in ${location.name} today with an estimated accumulation of ${today.precip.toFixed(1)} mm.`
          : `There is a low chance of precipitation today (${today.pop}% probability). Mainly ${today.condition.toLowerCase()} conditions are anticipated.`
        : `Check our hourly forecast graph above for detailed precipitation probabilities throughout the day in ${location.name}.`,
    },
    {
      question: `What are the sunrise and sunset times in ${location.name} today?`,
      answer: `Sunrise in ${location.name} is at ${current.sunrise ? new Date(current.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'approx 06:00 AM'}, and sunset is at ${current.sunset ? new Date(current.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'approx 06:30 PM'} local time (${location.timezone}).`,
    },
    {
      question: `What is the air quality (AQI) in ${location.name} right now?`,
      answer: airQuality
        ? `The current Air Quality Index in ${location.name} is ${airQuality.aqi} (${airQuality.label}), adhering to the ${airQuality.aqiStandard} standard. ${airQuality.advisory}`
        : `Air quality metrics for ${location.name} are continuously monitored through regional atmospheric sensors.`,
    },
    {
      question: `What is the 7-day weather outlook for ${location.name}?`,
      answer: daily && daily.length > 0
        ? `Over the next 7 days, temperatures in ${location.name} are projected to range between a low of ${formatTemperature(
            Math.min(...daily.map((d) => d.low)),
            unit
          )} and a high of ${formatTemperature(Math.max(...daily.map((d) => d.high)), unit)}.`
        : `View our 7-day forecast table above for detailed daily meteorological projections.`,
    },
  ];

  // FAQ Schema JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <HelpCircle size={20} style={{ color: 'var(--accent-primary)' }} /> Frequently Asked Questions about {location.name} Weather
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndexes.includes(idx);
          return (
            <div
              key={`faq-${idx}`}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-glass)',
              }}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
              >
                <span>{faq.question}</span>
                {isOpen ? <ChevronUp size={18} color="var(--accent-primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 1.25rem 1.25rem 1.25rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.75rem',
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
