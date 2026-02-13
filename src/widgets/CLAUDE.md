# Widgets - Componentes Complexos Reutilizáveis

## Objetivo

Camada de widgets do FSD: componentes compostos que combinam features, entities e shared UI.

---

## Estrutura

```
widgets/
└── header/
    ├── ui/
    │   └── Header.tsx           # Navegação global (client)
    └── index.ts                 # Exporta Header
```

---

## Header (`Header.tsx`)

**Tipo**: Client component (`'use client'`)
**Hooks**: `usePathname()` (Next.js), `useSession()` (NextAuth)

### Layout

- **Posição**: Fixed top-0, z-50, backdrop-blur, bg-[#111]/80
- **Container**: max-w-6xl mx-auto px-6 py-4
- **Borda**: border-b border-gray-800

### Seções

| Área | Conteúdo |
|------|----------|
| **Logo** (esquerda) | "Moacir G" → link para `/` |
| **Navegação** (centro) | Links fixos + Dashboard condicional |
| **Auth** (direita) | LoginButton / UserMenu / loading indicator |

### Links de Navegação

| Label | Rota | Condicional |
|-------|------|-------------|
| Tools | `/tools` | Não |
| Resume | `/resume` | Não |
| Sobre Mim | `/about` | Não |
| Dashboard | `/dashboard` | Sim (apenas se `session` existe) |

### Estado de Autenticação (direita)

| Status | Renderiza |
|--------|-----------|
| `loading` | Círculo azul pulsante animado |
| `authenticated` | `<UserMenu />` (de `@/features/auth`) |
| `unauthenticated` | `<LoginButton />` (de `@/features/auth`) |

### Active Link

Rota atual → `text-white`, demais → `text-gray-400 hover:text-white`
Detectado via `usePathname()`.

---

## Dependências

- `next/link`, `next/navigation` (usePathname)
- `next-auth/react` (useSession)
- `@/features/auth` (LoginButton, UserMenu)
