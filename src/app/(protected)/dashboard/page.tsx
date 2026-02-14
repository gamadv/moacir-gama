import { DashboardPage } from '@/views/dashboard';

export const metadata = {
  title: 'Dashboard',
  description: 'Área exclusiva para usuários autenticados.',
};

export default function Dashboard() {
  return <DashboardPage />;
}
