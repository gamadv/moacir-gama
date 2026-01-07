import { UnderConstruction } from '@/shared/ui';

export function ResumePage() {
  return (
    <main className="min-h-screen pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-thin text-glow mb-8">Resume</h1>
        <UnderConstruction
          title="Resume em Construção"
          message="Meu currículo estará disponível em breve..."
        />
      </div>
    </main>
  );
}
