# Auth - Sistema de Autenticação

## Objetivo

Autenticação com Google OAuth via NextAuth.js v5, com sessões persistentes em SQLite e proteção de rotas.

---

## Estrutura

```
features/auth/
├── model/
│   └── types.ts                  # AuthSession, AuthState
├── ui/
│   ├── LoginButton.tsx           # Botão de login Google (client)
│   ├── LogoutButton.tsx          # Botão de logout (client)
│   ├── UserMenu.tsx              # Menu do usuário logado (client)
│   └── GoogleIcon.tsx            # SVG do ícone Google
├── lib/
│   └── guards.ts                 # Hooks: useAuth, useRequireAuth
└── index.ts                      # Exportações públicas

# Arquivos relacionados fora da feature:
shared/config/auth.config.ts      # Configuração NextAuth (adapter, providers, callbacks)
shared/lib/auth/session.ts        # Exports: handlers, auth, signIn, signOut
shared/lib/auth/AuthProvider.tsx   # SessionProvider wrapper (client)
app/api/auth/[...nextauth]/route.ts  # API route (GET/POST)
app/login/page.tsx                # Página de login
app/(protected)/layout.tsx        # Layout com verificação de sessão
proxy.ts                          # Middleware de proteção de rotas
prisma/schema.prisma              # Schema do banco
```

---

## Fluxo de Autenticação

### Login
1. Usuário clica `LoginButton` → `signIn('google', { callbackUrl })`
2. NextAuth redireciona para Google OAuth
3. Google retorna → `/api/auth/callback/google`
4. PrismaAdapter cria/atualiza User no SQLite
5. Session criada no banco + cookie definido
6. Redirect para `callbackUrl` (padrão: `/`)

### Sessão
- `AuthProvider` (no RootLayout) habilita `useSession()` em toda app
- Server components usam `await auth()` para obter sessão
- Client components usam `useSession()` do NextAuth

### Logout
- `signOut({ callbackUrl: '/' })` → limpa sessão do banco e cookie

---

## Proteção de Rotas (3 camadas)

| Camada | Arquivo | Tipo | Descrição |
|--------|---------|------|-----------|
| Middleware | `proxy.ts` | Server | Intercepta requests para `/dashboard`. Redireciona para `/login?callbackUrl=...` |
| Layout | `app/(protected)/layout.tsx` | Server | `await auth()` + `redirect('/login')` se sem sessão |
| Hook | `guards.ts` → `useRequireAuth` | Client | Redirect automático via `useRouter` |

### proxy.ts — Rotas Protegidas

```typescript
const protectedRoutes = ['/dashboard'];
// Exclui: /api/*, /_next/*, /favicon.ico, /icons/*, *.png
```

---

## Componentes

### LoginButton
- **Props**: `callbackUrl?`, `showIcon?`, `variant?`
- Chama `signIn('google', { callbackUrl })`
- Exibe GoogleIcon + texto "Entrar com Google"

### LogoutButton
- **Props**: `callbackUrl?`
- Chama `signOut({ callbackUrl })`

### UserMenu
- Usa `useSession()` para obter dados do usuário
- Exibe `UserAvatar` + nome + botão logout
- Renderiza condicionalmente baseado no status da sessão

### Guards (Hooks)
```typescript
useAuth()
// Retorna: { session, user, isAuthenticated, isLoading }
// NÃO redireciona

useRequireAuth(redirectTo = '/login')
// Retorna: { session, status, isAuthenticated }
// REDIRECIONA automaticamente se não autenticado
```

---

## Configuração NextAuth (`auth.config.ts`)

- **Adapter**: PrismaAdapter (Prisma + SQLite)
- **Provider**: Google OAuth (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`)
- **Custom Pages**: `{ signIn: '/login' }`
- **Session Callback**: Injeta `user.id` no objeto de sessão
- **trustHost**: `true`

---

## Schema Prisma (SQLite)

| Model | Campos Chave | Descrição |
|-------|-------------|-----------|
| `User` | id, name, email, image, createdAt | Usuário do sistema |
| `Account` | provider, providerAccountId, tokens | Dados OAuth (Google) |
| `Session` | sessionToken, userId, expires | Sessões ativas |
| `VerificationToken` | identifier, token, expires | Verificação email (não usado) |

**Constraints**: `Account` → unique([provider, providerAccountId]), `User.email` unique

---

## Variáveis de Ambiente

```env
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=<Google Client ID>
AUTH_GOOGLE_SECRET=<Google Client Secret>
DATABASE_URL="file:./dev.db"
```

---

## Login Page (`views/login/ui/LoginPage.tsx`)

- Lê `callbackUrl` dos searchParams (padrão `/`)
- Lê `error` dos searchParams para exibir mensagens de erro
- Trata `OAuthAccountNotLinked` com mensagem específica
- Botão Google via `signIn('google', { callbackUrl })`
- Wrapped em `<Suspense>` no page.tsx
