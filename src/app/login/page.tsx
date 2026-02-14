import { Suspense } from 'react';

import { LoginPage } from '@/views/login';

export const metadata = {
  title: 'Login',
  description: 'Faça login para acessar recursos exclusivos.',
};

export default function Login() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <LoginPage />
    </Suspense>
  );
}
