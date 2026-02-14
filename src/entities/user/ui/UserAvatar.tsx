import Image from 'next/image';

import { cn } from '@/shared/lib/utils';

interface UserAvatarProps {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { class: 'w-6 h-6', pixels: 24 },
  md: { class: 'w-8 h-8', pixels: 32 },
  lg: { class: 'w-10 h-10', pixels: 40 },
};

export function UserAvatar({ src, name, size = 'md', className }: UserAvatarProps) {
  const { class: sizeClass, pixels } = sizeConfig[size];
  const initials =
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  if (!src) {
    return (
      <div
        className={cn(
          sizeClass,
          'rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium',
          className
        )}>
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name || 'User avatar'}
      width={pixels}
      height={pixels}
      className={cn(sizeClass, 'rounded-full', className)}
    />
  );
}
