import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#2563EB',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="130" height="130" viewBox="0 0 40 40" fill="none">
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
    ),
    size,
  );
}
