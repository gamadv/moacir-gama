# Views - Componentes de Página

## Objetivo

Camada de views do FSD: componentes que representam páginas completas, importados diretamente pelas rotas do App Router.

---

## Estrutura

```
views/
├── home/
│   ├── ui/HomePage.tsx          # Hero section com engrenagens animadas
│   └── index.ts
├── tools/
│   ├── ui/ToolsPage.tsx         # Interface de tabs (DailyKalk, PrintLooker, Jardani)
│   ├── config/tool-tabs.tsx     # Configuração das tabs
│   └── index.ts
├── about/
│   ├── ui/AboutPage.tsx         # Placeholder "em construção"
│   └── index.ts
├── resume/
│   ├── ui/ResumePage.tsx        # Placeholder "em construção"
│   └── index.ts
├── login/
│   ├── ui/LoginPage.tsx         # Formulário Google OAuth
│   └── index.ts
└── dashboard/
    ├── ui/DashboardPage.tsx     # Info do usuário logado
    └── index.ts
```

---

## Mapa de Rotas → Views

| Rota | View | Rendering | Protegida | Status |
|------|------|-----------|-----------|--------|
| `/` | `HomePage` | Server Component | Não | Ativa |
| `/tools` | `ToolsPage` | Client Component | Não | Ativa |
| `/about` | `AboutPage` | Server Component | Não | Em construção |
| `/resume` | `ResumePage` | Server Component | Não | Em construção |
| `/login` | `LoginPage` | Client (Suspense) | Não | Ativa |
| `/dashboard` | `DashboardPage` | Async Server | Sim | Ativa |

---

## Padrão de Conexão Page → View

Toda rota segue o mesmo padrão:

```tsx
// src/app/<rota>/page.tsx
import { ViewComponent } from '@/views/<feature>';

export default function Page() {
  return <ViewComponent />;
}
```

Exceção: `/login` usa `<Suspense>` wrapper com fallback "Carregando...".

---

## Detalhes por View

### HomePage

- Hero com "Moacir Gama" e 3 `GearIcon` animados (spin-slow, reverse-spin)
- Sem estado, server component
- Classes customizadas: `text-glow`, `animate-spin-slow`, `animate-reverse-spin`

### ToolsPage (`'use client'`)

- Título "Tools" com glow
- Componente `Tabs` do shared/ui
- Config em `config/tool-tabs.tsx`:
  - `dailykalk` → `<DailyKalk />`
  - `printlooker` → `<PrintLooker />`
  - `jardani` → Placeholder "em construção"

### AboutPage / ResumePage

- Ambas usam `<UnderConstruction>` com mensagens customizadas
- Server components, sem estado

### LoginPage (`'use client'`)

- Lê `callbackUrl` e `error` dos searchParams
- Trata erros OAuth (ex: `OAuthAccountNotLinked`)
- Botão Google com `signIn('google', { callbackUrl })`
- Texto de disclaimer de termos

### DashboardPage (async server)

- `await auth()` para obter sessão
- Exibe: nome, email, ID do usuário
- Cards placeholder para features futuras ("Em breve", "Suas preferências")

---

## Layouts

### RootLayout (`app/layout.tsx`)

Aplica a todas as páginas:
- `<AuthProvider>` → habilita `useSession()`
- `<Header />` → navegação global fixa
- Fonts: Inter + Courier Prime
- Lang: `pt-BR`
- Metadata: título template `%s | Moacir Gama`, PWA manifest, OpenGraph

### ProtectedLayout (`app/(protected)/layout.tsx`)

Aplica apenas a rotas protegidas:
```typescript
const session = await auth();
if (!session) redirect('/login');
return <>{children}</>;
```

---

## Navegação (Header)

Links fixos: Tools (`/tools`), Resume (`/resume`), Sobre Mim (`/about`)
Condicional: Dashboard (`/dashboard`) — só aparece se autenticado
Auth: `LoginButton` ou `UserMenu` baseado no status da sessão
