import { ImageResponse } from 'next/og';

export const alt = 'Sauatty — ҰБТ-ға қазақша дайындық';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* corner orbs */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #DBEAFE 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            left: -120,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #FEF3C7 0%, transparent 70%)',
          }}
        />

        {/* brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 60,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: '#2563EB',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="52" height="52" viewBox="0 0 40 40">
              <path
                d="M27 13 c-1.5-2-4-3-7-3 -4 0-7 2-7 5.5 0 3 2.5 4.5 6 5.5 3.5 1 5 2 5 3.8 0 1.8-2 3-4.5 3 -3 0-5-1.2-6.5-3.2"
                stroke="#fff"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="29" cy="27" r="4.5" fill="#F59E0B" />
              <path
                d="M27 27 l1.5 1.5 L31 25.5"
                stroke="#fff"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            sauatt
            <div style={{ position: 'relative', display: 'flex' }}>
              <span>y</span>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: -8,
                  height: 8,
                  background: '#F59E0B',
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        </div>

        {/* headline */}
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div>ҰБТ-ға дайындал.</div>
          <div>
            <span style={{ color: '#2563EB' }}>Бастан-аяқ </span>
            <span style={{ color: '#F59E0B' }}>қазақша.</span>
          </div>
        </div>

        {/* subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#64748B',
            marginTop: 30,
            maxWidth: 920,
            lineHeight: 1.4,
          }}
        >
          Нақты формат, таймер, калькулятор және қаралама — бір жерде.
        </div>
      </div>
    ),
    size,
  );
}
