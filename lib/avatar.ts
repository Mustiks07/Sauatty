// Avatar gradient presets — user picks one in /profile/edit.

export type AvatarPreset =
  | 'blue-amber'
  | 'green-blue'
  | 'purple-pink'
  | 'red-orange'
  | 'cyan-purple'
  | 'graphite';

export const AVATAR_PRESETS: Record<
  AvatarPreset,
  { from: string; to: string; label: string }
> = {
  'blue-amber': { from: '#2563EB', to: '#F59E0B', label: 'Көк—Сары' },
  'green-blue': { from: '#10B981', to: '#2563EB', label: 'Жасыл—Көк' },
  'purple-pink': { from: '#8B5CF6', to: '#EC4899', label: 'Күлгін—Қызғылт' },
  'red-orange': { from: '#EF4444', to: '#F59E0B', label: 'Қызыл—Қызғылт сары' },
  'cyan-purple': { from: '#06B6D4', to: '#8B5CF6', label: 'Көгілдір—Күлгін' },
  graphite: { from: '#0F172A', to: '#64748B', label: 'Графит' },
};

export function avatarGradient(preset: string | null | undefined): string {
  const key = (preset ?? 'blue-amber') as AvatarPreset;
  const p = AVATAR_PRESETS[key] ?? AVATAR_PRESETS['blue-amber'];
  return `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`;
}
