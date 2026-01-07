'use client';

import { GearIcon } from '@/shared/ui/icons';

interface UnderConstructionProps {
  title?: string;
  message?: string;
}

export function UnderConstruction({
  title = 'Em Construção',
  message = 'Esta página está sendo desenvolvida...',
}: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex flex-col items-center justify-center mb-8">
        <GearIcon
          className="animate-spin-slow mb-[-30px] ml-[80px]"
          width={60}
          height={60}
          fill="#ffffff"
        />
        <GearIcon className="animate-reverse-spin" width={80} height={80} fill="#ffffff" />
        <GearIcon
          className="animate-spin-slow mt-[-30px] mr-[80px]"
          width={60}
          height={60}
          fill="#ffffff"
        />
      </div>
      <h2 className="text-2xl font-thin text-glow mb-4">{title}</h2>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}
