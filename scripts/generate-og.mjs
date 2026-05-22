// Generates /public/og.png — the static Open Graph image for WhatsApp/Telegram/etc.
// Run with:  npm run gen:og
// Commit the resulting public/og.png to git.

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const OUT = path.join(ROOT, 'public', 'og.png');

async function loadFont(name, weight) {
  // Pull the variable Inter font as TTF from Google Fonts CDN (no auth needed).
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  const css = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  }).then((r) => r.text());
  const match = css.match(/url\((https:\/\/[^)]+\.ttf)\)/);
  if (!match) throw new Error('Could not find TTF URL in Google Fonts CSS for ' + name);
  const buf = await fetch(match[1]).then((r) => r.arrayBuffer());
  return { name, data: buf, weight, style: 'normal' };
}

console.log('Loading fonts…');
const [inter400, inter700] = await Promise.all([loadFont('Inter', 400), loadFont('Inter', 700)]);

const tree = {
  type: 'div',
  props: {
    style: {
      width: '100%',
      height: '100%',
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      padding: 80,
      position: 'relative',
      fontFamily: 'Inter',
    },
    children: [
      // background orbs
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: -160,
            right: -160,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: '#DBEAFE',
            opacity: 0.6,
            display: 'flex',
          },
        },
      },
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            bottom: -160,
            left: -120,
            width: 380,
            height: 380,
            borderRadius: 9999,
            background: '#FEF3C7',
            opacity: 0.6,
            display: 'flex',
          },
        },
      },
      // brand row
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', marginBottom: 56, zIndex: 1 },
          children: [
            {
              type: 'div',
              props: {
                style: {
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
                },
                children: 'S',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: 64,
                  fontWeight: 700,
                  color: '#0F172A',
                  letterSpacing: '-0.025em',
                  display: 'flex',
                },
                children: 'sauatty',
              },
            },
          ],
        },
      },
      // headline lines
      {
        type: 'div',
        props: {
          style: {
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            display: 'flex',
            zIndex: 1,
          },
          children: 'ҰБТ-ға дайындал.',
        },
      },
      {
        type: 'div',
        props: {
          style: {
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            display: 'flex',
            zIndex: 1,
            marginTop: 4,
          },
          children: [
            {
              type: 'span',
              props: { style: { color: '#2563EB' }, children: 'Бастан-аяқ ' },
            },
            {
              type: 'span',
              props: { style: { color: '#F59E0B' }, children: 'қазақша.' },
            },
          ],
        },
      },
      // subtitle
      {
        type: 'div',
        props: {
          style: {
            fontSize: 32,
            fontWeight: 400,
            color: '#64748B',
            marginTop: 32,
            maxWidth: 960,
            lineHeight: 1.4,
            display: 'flex',
            zIndex: 1,
          },
          children: 'Нақты формат, таймер, калькулятор және қаралама — бір жерде.',
        },
      },
      // footer chip
      {
        type: 'div',
        props: {
          style: {
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
          },
          children: 'www.sauatty.kz',
        },
      },
    ],
  },
};

console.log('Rendering SVG via Satori…');
const svg = await satori(tree, {
  width: 1200,
  height: 630,
  fonts: [inter400, inter700],
});

console.log('Rasterizing to PNG via resvg…');
const png = new Resvg(svg, { background: 'white' }).render().asPng();

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, png);

console.log('✓ Saved', path.relative(ROOT, OUT), `(${(png.length / 1024).toFixed(1)} KB)`);
