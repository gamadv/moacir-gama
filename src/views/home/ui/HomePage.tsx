import { GearIcon } from '@/shared/ui/icons';

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-1">
      <h1 className="font-thin shadow-2xl text-glow mb-14 text-4xl sm:text-6xl">Moacir Gama</h1>
      <div className="w-full flex flex-col justify-center items-center">
        <GearIcon
          className="animate-spin-slow mb-[-30px] ml-[80px]"
          width={80}
          height={80}
          fill="#ffffff"
        />
        <GearIcon className="animate-reverse-spin" width={100} height={100} fill="#ffffff" />
        <GearIcon
          className="animate-spin-slow mt-[-30px] mr-[80px]"
          width={80}
          height={80}
          fill="#ffffff"
        />
      </div>
    </main>
  );
}
