import { UnderConstruction } from '@/shared/ui';

export function AboutPage() {
  return (
    <main className="min-h-screen pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-thin text-glow mb-8">Sobre Mim</h1>
        <UnderConstruction
          title="Página em Construção"
          message="Em breve você saberá mais sobre mim..."
        />
      </div>
    </main>
  );
}
