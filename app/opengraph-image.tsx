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
            borderRadius: 9999,
            background: '#DBEAFE',
            opacity: 0.6,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            left: -120,
            width: 380,
            height: 380,
            borderRadius: 9999,
            background: '#FEF3C7',
            opacity: 0.6,
            display: 'flex',
          }}
        />

        {/* brand row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 60,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: '#2563EB',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
              color: '#fff',
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              display: 'flex',
            }}
          >
            sauatty
          </div>
        </div>

        {/* headline */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            display: 'flex',
            zIndex: 1,
          }}
        >
          ҰБТ-ға дайындал.
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            display: 'flex',
            zIndex: 1,
            marginTop: 4,
          }}
        >
          <span style={{ color: '#2563EB' }}>Бастан-аяқ&nbsp;</span>
          <span style={{ color: '#F59E0B' }}>қазақша.</span>
        </div>

        {/* subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#64748B',
            marginTop: 32,
            maxWidth: 960,
            lineHeight: 1.4,
            display: 'flex',
            zIndex: 1,
          }}
        >
          Нақты формат, таймер, калькулятор және қаралама — бір жерде.
        </div>

        {/* footer chip */}
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            background: '#0F172A',
            color: '#fff',
            padding: '14px 24px',
            borderRadius: 9999,
            fontSize: 24,
            fontWeight: 600,
            zIndex: 1,
          }}
        >
          www.sauatty.kz
        </div>
      </div>
    ),
    size,
  );
}
