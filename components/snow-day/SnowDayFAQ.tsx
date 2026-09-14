'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const SNOW_DAY_FAQS = [
  {
    q: 'How does the Snow Day Calculator work?',
    a: 'The calculator runs our deterministic meteorological scoring engine (SnowDayPredictionEngine) to analyze multiple forecast parameters: total expected snowfall, overnight accumulation, morning commute precipitation timing, pavement temperatures, ice glaze/freezing rain hazards, and peak wind gusts. These are weighted together to estimate the probability that road conditions may prompt winter weather schedule adjustments.',
  },
  {
    q: 'How accurate is the Snow Day Calculator?',
    a: 'The calculator provides a weather-risk estimate based on real-time meteorological models. While forecast algorithms accurately capture severe winter travel threats, actual school closures are independent human administrative decisions made by local district superintendents, taking into account municipal plow readiness, rural bus route safety, and regional heating infrastructure.',
  },
  {
    q: 'How much snow usually causes a snow day?',
    a: 'There is no universal snowfall threshold. In northern and mountainous regions (such as Buffalo, Minneapolis, or Montreal), schools are equipped with heavy fleets and rarely close for under 15 cm (6 inches) of snow. In contrast, southern regions or urban areas with limited plow infrastructure may close for 2 to 5 cm (1 to 2 inches) or light ice glazes.',
  },
  {
    q: 'Does freezing rain increase the snow day probability?',
    a: 'Yes, significantly. Freezing rain coats roads, tree branches, and power lines in a layer of invisible, frictionless black ice. Even a fraction of a millimeter of freezing rain poses an immediate hazard to school buses, resulting in a high snow day probability even when zero snowfall is recorded.',
  },
  {
    q: 'What is the difference between a 2-hour delay and a full snow day?',
    a: 'A 2-hour delay allows municipal snowplow crews extra daylight time to salt and clear arterial roads after overnight snow, while giving school bus engines time to warm up. If heavy snow continues past 7:00 AM or freezing rain persists, districts typically upgrade a 2-hour delay into a full cancellation.',
  },
  {
    q: 'At what time do school districts typically announce snow days?',
    a: 'Superintendents usually communicate closure decisions between 5:00 AM and 6:30 AM on the day of the storm following 4:30 AM road scouting reports from local police and road departments. For massive blizzards with advance National Weather Service warnings, announcements may occur the night before by 9:00 PM – 10:00 PM.',
  },
  {
    q: 'Does extreme cold or wind chill cause school closures without snow?',
    a: 'Yes. Wind chill temperatures plunging below -20°F to -30°F (-29°C to -34°C) trigger district closures in many states due to the risk of frostbite within 10 to 15 minutes of exposure at school bus stops, as well as diesel bus fuel gelling.',
  },
  {
    q: 'Can I calculate snow day chances by ZIP code or postal code?',
    a: 'Yes! Simply enter any 5-digit US ZIP code, 6-character Canadian Postal Code, UK postcode, or city name in the search bar above to fetch localized hyper-accurate winter weather models.',
  },
  {
    q: 'Can I use the calculator outside the United States?',
    a: 'Yes. The Snow Day Calculator works globally across Canada, the UK, Europe, Asia, and worldwide wherever numeric weather forecasts are supported by our multi-provider routing network.',
  },
];


export const SnowDayFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SNOW_DAY_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <HelpCircle size={20} style={{ color: 'var(--accent-primary)' }} />
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Frequently Asked Questions</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {SNOW_DAY_FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.1rem 1.25rem',
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
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 1.25rem 1.1rem 1.25rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.85rem',
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
