import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Free Snow Day Calculator — Snow Day Predictor';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b0f19 0%, #0f172a 50%, #0284c7 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '48px',
          position: 'relative',
        }}
      >
        {/* Glow circle background */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            padding: '10px 24px',
            fontSize: '22px',
            fontWeight: 700,
            color: '#38bdf8',
            marginBottom: '24px',
          }}
        >
          ❄️ Real-Time Winter Prediction Engine
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '68px',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '16px',
            background: 'linear-gradient(to bottom right, #ffffff, #93c5fd)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Free Snow Day Calculator
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '34px',
            fontWeight: 700,
            color: '#38bdf8',
            marginBottom: '28px',
          }}
        >
          Will Tomorrow Be a Snow Day?
        </div>

        {/* Supporting Points */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '20px',
            color: '#94a3b8',
          }}
        >
          <span>🌨️ Snowfall Accumulation</span>
          <span>🧊 Ice & Freezing Rain</span>
          <span>🌡️ Morning Temperatures</span>
        </div>

        {/* Domain footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '20px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '0.04em',
          }}
        >
          www.snowdaycalculatorfree.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
