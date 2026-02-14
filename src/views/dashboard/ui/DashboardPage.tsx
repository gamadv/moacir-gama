import { LogoutButton } from '@/features/auth';
import { auth } from '@/shared/lib/auth/session';

export async function DashboardPage() {
  const session = await auth();

  return (
    <main className="min-h-screen pt-24 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-thin text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Área exclusiva para usuários logados</p>
          </div>
          <LogoutButton />
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl text-white mb-4">Bem-vindo, {session?.user?.name}!</h2>
          <p className="text-gray-400 mb-4">
            Você está logado com <span className="text-white">{session?.user?.email}</span>
          </p>
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">
              <p>
                <span className="text-gray-500">ID:</span>{' '}
                <code className="text-gray-300">{session?.user?.id}</code>
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg text-white mb-2">Em breve</h3>
            <p className="text-gray-400 text-sm">
              Novas funcionalidades serão adicionadas aqui para usuários autenticados.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg text-white mb-2">Suas preferências</h3>
            <p className="text-gray-400 text-sm">
              Configure suas preferências pessoais e personalize sua experiência.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
