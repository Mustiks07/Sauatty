import { cn } from '@/lib/utils';
import { avatarGradient } from '@/lib/avatar';

export function UserAvatar({
  name,
  preset,
  size = 40,
  className,
}: {
  name: string;
  preset: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        'rounded-full text-white flex items-center justify-center font-bold font-display flex-shrink-0',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: avatarGradient(preset),
        lineHeight: 1,
      }}
    >
      {initial}
    </div>
  );
}
