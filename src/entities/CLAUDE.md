# Entities - Entidades de Domínio

## Objetivo

Camada de entities do FSD: tipos e componentes que representam objetos de domínio do sistema.

---

## Estrutura

```
entities/
└── user/
    ├── model/
    │   └── types.ts             # Interface User
    ├── ui/
    │   └── UserAvatar.tsx       # Componente de avatar
    └── index.ts                 # Exporta UserAvatar e User
```

---

## User Entity

### Tipo (`model/types.ts`)

```typescript
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}
```

Usado em: sessão NextAuth, UserMenu, DashboardPage.

### UserAvatar (`ui/UserAvatar.tsx`)

**Props**:
```typescript
interface UserAvatarProps {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Tamanhos**:
| Size | Classes |
|------|---------|
| `sm` | w-6 h-6 (24px) |
| `md` | w-8 h-8 (32px) — padrão |
| `lg` | w-10 h-10 (40px) |

**Comportamento**:
- Se `src` existe → `<Image>` do Next.js (rounded-full)
- Sem `src` → Badge com iniciais (2 primeiras letras do nome)
- Sem `src` e sem `name` → Badge com "?"
- Fundo fallback: `bg-gray-700`, texto branco, xs, semibold

**Uso**: `UserMenu` (Header), `DashboardPage`
