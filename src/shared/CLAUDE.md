# Shared - Componentes e Utilitários Compartilhados

## Objetivo

Camada de infraestrutura do FSD: componentes UI reutilizáveis, utilitários e configurações usados por todas as features.

---

## Estrutura

```
shared/
├── ui/
│   ├── button.tsx               # Button com CVA (6 variantes, 4 tamanhos)
│   ├── input.tsx                # Input HTML estilizado
│   ├── badge.tsx                # Badge com CVA (4 variantes)
│   ├── select.tsx               # Select composto (Radix UI)
│   ├── dialog.tsx               # Dialog/Modal composto (Radix UI)
│   ├── tabs/
│   │   └── Tabs.tsx             # Tabs baseado em @base-ui/react
│   ├── icons/
│   │   └── GearIcon.tsx         # Ícone SVG de engrenagem
│   ├── under-construction/
│   │   └── UnderConstruction.tsx # Placeholder "em construção"
│   └── index.ts                 # Barrel export de todos os UI
├── lib/
│   ├── utils.ts                 # cn() — merge de classes Tailwind
│   ├── prisma.ts                # PrismaClient singleton
│   └── auth/
│       ├── session.ts           # NextAuth handlers, auth(), signIn, signOut
│       └── AuthProvider.tsx     # SessionProvider wrapper (client)
├── config/
│   └── auth.config.ts           # Configuração NextAuth
└── index.ts                     # Re-exporta shared/ui
```

---

## Componentes UI

### Button (`button.tsx`)

ForwardRef com CVA. Suporta `asChild` via Radix Slot.

| Variant | Visual |
|---------|--------|
| `default` | Primário |
| `destructive` | Vermelho |
| `outline` | Borda, fundo transparente |
| `secondary` | Secundário |
| `ghost` | Transparente, hover subtle |
| `link` | Estilo link |

| Size | Dimensões |
|------|-----------|
| `default` | h-10 px-4 py-2 |
| `sm` | h-9 px-3 |
| `lg` | h-11 px-8 |
| `icon` | h-10 w-10 |

**Exports**: `Button`, `buttonVariants`

### Input (`input.tsx`)

ForwardRef input HTML com estilização Tailwind. Suporte a `type="file"`.

**Export**: `Input`

### Badge (`badge.tsx`)

CVA com 4 variantes: `default`, `secondary`, `destructive`, `outline`.

**Exports**: `Badge`, `badgeVariants`

### Select (`select.tsx`) — Radix UI

Compound component com portal. `'use client'`.

**Exports**: `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`

### Dialog (`dialog.tsx`) — Radix UI

Modal com overlay, animações zoom/fade. `'use client'`.

**Exports**: `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogClose`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`

### Tabs (`tabs/Tabs.tsx`) — @base-ui/react

Tabs array-driven. `'use client'`.

```typescript
interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}
```

**Exports**: `Tabs`, `TabsTrigger`, `TabsContent`

### GearIcon (`icons/GearIcon.tsx`)

SVG de engrenagem, aceita `SVGProps`. Usado no Home e UnderConstruction.

### UnderConstruction (`under-construction/UnderConstruction.tsx`)

Placeholder com 3 engrenagens animadas. `'use client'`.

```typescript
interface UnderConstructionProps {
  title?: string;    // Default: "Em Construção"
  message?: string;  // Default: "Esta página está sendo desenvolvida..."
}
```

---

## Utilitários (`lib/`)

### cn() (`utils.ts`)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Usado em todos os componentes para merge seguro de classes Tailwind.

### Prisma (`prisma.ts`)

Singleton `PrismaClient` com proteção contra múltiplas instâncias em dev (HMR). Armazena em `globalThis`.

### Auth Session (`auth/session.ts`)

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

### AuthProvider (`auth/AuthProvider.tsx`)

Client component que wrapa com `SessionProvider` do NextAuth. Aplicado no RootLayout.

---

## Import Paths

```typescript
import { Button, Input, Badge, Dialog, ... } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { prisma } from '@/shared/lib/prisma';
import { auth } from '@/shared/lib/auth/session';
```

---

## Padrões

- **CVA** para componentes com variantes (Button, Badge)
- **Radix UI** para componentes compostos acessíveis (Select, Dialog)
- **ForwardRef** em componentes que expõem ref (Button, Input)
- **Barrel exports** via index.ts para imports limpos
- **'use client'** explícito onde necessário (Select, Dialog, Tabs, AuthProvider)
