import type { Session } from 'next-auth';

export type AuthSession = Session | null;

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Session['user'] | null;
}
