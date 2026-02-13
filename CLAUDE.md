# CLAUDE.md - Guia do Projeto

## Visão Geral

Portfolio pessoal com ferramentas utilitárias desenvolvido em **Next.js 16** com **React 19**. O projeto segue a arquitetura **Feature-Sliced Design (FSD)**.

**URL**: https://moacirgama.com
**Idioma**: Português (pt-BR)

---

## Comandos Essenciais

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # Verificar linting
npm run fixlint      # Corrigir linting automaticamente
npm run test         # Testes em modo watch
npm run test:run     # Executar testes uma vez
npm run format       # Formatar código com Prettier
```

---

## Stack Tecnológica

| Categoria | Tecnologias |
|-----------|-------------|
| **Framework** | Next.js 16.1.1, React 19, TypeScript 5 |
| **Estilização** | Tailwind CSS 4, class-variance-authority (CVA) |
| **Componentes UI** | @radix-ui (dialog, select, label), @base-ui/react (tabs) |
| **Ícones** | lucide-react |
| **Testes** | Vitest, @testing-library/react, jsdom |
| **Qualidade** | ESLint, Prettier, Husky (pre-commit) |
| **Autenticação** | NextAuth.js v5 (Auth.js), Google OAuth |
| **Banco de Dados** | Prisma 6, SQLite |

---

## Arquitetura (Feature-Sliced Design)

```
src/
├── app/              # Rotas Next.js (App Router)
│   ├── (protected)/  # Rotas protegidas (requerem login)
│   ├── api/auth/     # API routes do NextAuth
│   └── login/        # Página de login customizada
├── features/         # Features de negócio (model + ui)
│   ├── auth/         # Autenticação (LoginButton, UserMenu, guards)
│   ├── daily-kalk/   # Calculadora de horas trabalhadas
│   └── print-looker/ # Calculadora de preços de impressão
├── views/            # Componentes de página
├── widgets/          # Componentes complexos reutilizáveis (Header)
├── shared/           # Componentes e utilitários compartilhados
│   ├── config/       # Configurações (auth.config.ts)
│   ├── lib/          # Utilitários (prisma.ts, auth/, utils.ts)
│   └── ui/           # Biblioteca de componentes
├── entities/         # Entidades de domínio
│   └── user/         # Entidade usuário (UserAvatar)
├── proxy.ts     # Proteção de rotas
prisma/
└── schema.prisma     # Schema do banco de dados
```

### Path Aliases (tsconfig.json)

```typescript
@/*           → src/*
@/shared/*    → src/shared/*
@/features/*  → src/features/*
@/widgets/*   → src/widgets/*
@/views/*     → src/views/*
@/entities/*  → src/entities/*
```

---

## Features Implementadas

### 1. DailyKalk (`src/features/daily-kalk/`)

Calculadora de horas de trabalho diárias.

**Funcionalidades:**
- Entrada de horários em dois períodos (manhã/tarde)
- Cálculo automático do total trabalhado
- Comparação com meta de 8h diárias
- Previsão de horário de saída
- Suporte a cálculos parciais

**Arquivos principais:**
- `model/calculate-hours.ts` - Lógica de cálculo
- `ui/DailyKalk.tsx` - Componente principal
- `ui/TimeInput.tsx` - Input de horário formatado

### 2. PrintLooker (`src/features/print-looker/`)

Calculadora de preços de impressão com descontos por volume.

**Funcionalidades:**
- 9 tipos de impressão (sulfite, cópias, fotos, etiquetas)
- Preços com desconto por quantidade
- Gerenciamento de múltiplos itens
- Modal com tabela de preços

**Arquivos principais:**
- `model/calculate-price.ts` - Lógica de preços e descontos
- `ui/PrintLooker.tsx` - Componente principal

### 3. Auth (`src/features/auth/`)

Sistema de autenticação com Google OAuth.

**Funcionalidades:**
- Login social com Google
- Sessões persistentes no SQLite
- Proteção de rotas com proxy
- UI adaptativa (LoginButton / UserMenu)

**Arquivos principais:**
- `ui/LoginButton.tsx` - Botão de login
- `ui/UserMenu.tsx` - Menu do usuário logado
- `lib/guards.ts` - Hooks useAuth, useRequireAuth

---

## Autenticação

### Configuração
- **Provider**: Google OAuth via NextAuth.js v5
- **Banco**: Prisma + SQLite (`prisma/dev.db`)
- **Sessão**: Database sessions (persistentes)

### Arquivos de Auth
| Arquivo | Descrição |
|---------|-----------|
| `src/shared/config/auth.config.ts` | Config do NextAuth |
| `src/shared/lib/auth/session.ts` | Handlers e funções auth |
| `src/shared/lib/auth/AuthProvider.tsx` | Provider para client components |
| `src/app/api/auth/[...nextauth]/route.ts` | API route |
| `src/proxy.ts` | Proxy para proteção de rotas (Next.js 16) |

### Variáveis de Ambiente
```env
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=<Google Client ID>
AUTH_GOOGLE_SECRET=<Google Client Secret>
DATABASE_URL="file:./dev.db"
```

### Rotas Protegidas
Rotas em `src/app/(protected)/` requerem autenticação.
O proxy redireciona para `/login` se não autenticado.

---

## Componentes UI (`src/shared/ui/`)

| Componente | Arquivo | Base |
|------------|---------|------|
| Button | `button.tsx` | CVA com variantes |
| Input | `input.tsx` | Radix primitives |
| Select | `select.tsx` | @radix-ui/react-select |
| Dialog | `dialog.tsx` | @radix-ui/react-dialog |
| Badge | `badge.tsx` | CVA com variantes |
| Tabs | `tabs/Tabs.tsx` | @base-ui/react |

---

## Testes

**Framework**: Vitest + Testing Library

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # Com cobertura
```

**Arquivos de teste existentes:**
- `src/features/daily-kalk/model/calculate-hours.test.ts`
- `src/features/daily-kalk/ui/TimeInput.test.tsx`

**Configuração**: `vitest.config.mts` com jsdom e suporte a path aliases.

---

## Padrões de Código

### Estilização
- Tailwind CSS com utilitários
- `cn()` de `@/shared/lib/utils` para merge de classes
- CVA para variantes de componentes

### Componentes
- Componentes funcionais com TypeScript
- Props tipadas com interfaces
- useMemo para cálculos pesados
- useState para estado local

### Formatação
- 2 espaços de indentação
- Linha máxima: 100 caracteres
- Single quotes
- Ponto e vírgula obrigatório

---

## Rotas da Aplicação

| Rota | Página | Status | Protegida |
|------|--------|--------|-----------|
| `/` | Home | Ativa | Não |
| `/tools` | Ferramentas (DailyKalk, PrintLooker) | Ativa | Não |
| `/login` | Login com Google | Ativa | Não |
| `/dashboard` | Dashboard do usuário | Ativa | Sim |
| `/about` | Sobre | Em construção | Não |
| `/resume` | Currículo | Em construção | Não |

---

## PWA & SEO

- `public/manifest.json` - Configuração PWA
- `public/icons/` - Ícones em múltiplos tamanhos
- `src/app/sitemap.ts` - Sitemap dinâmico
- `public/robots.txt` - Configuração de crawlers

---

## Documentação por Área (CLAUDE.md locais)

Cada camada/feature possui um CLAUDE.md com contexto detalhado:

| Área | Arquivo | Conteúdo |
|------|---------|----------|
| **DailyKalk** | `src/features/daily-kalk/CLAUDE.md` | Funções, tipos, regras de negócio, testes, UI |
| **PrintLooker** | `src/features/print-looker/CLAUDE.md` | Tabela de preços, algoritmo de desconto, UI |
| **Auth** | `src/features/auth/CLAUDE.md` | Fluxo OAuth, proteção de rotas, componentes, schema |
| **Shared** | `src/shared/CLAUDE.md` | Componentes UI (variantes, props), utilitários |
| **Views** | `src/views/CLAUDE.md` | Mapa de rotas, padrão page→view, layouts |
| **Widgets** | `src/widgets/CLAUDE.md` | Header (navegação, auth state, active links) |
| **Entities** | `src/entities/CLAUDE.md` | User type, UserAvatar (props, sizes, fallback) |

Consulte o CLAUDE.md local da área relevante antes de fazer alterações.

---

## Notas para Desenvolvimento

1. **Nova feature**: Criar em `src/features/<nome>/` com pastas `model/` e `ui/`, adicionar CLAUDE.md
2. **Novo componente compartilhado**: Adicionar em `src/shared/ui/`
3. **Nova rota**: Criar em `src/app/<rota>/page.tsx` e view em `src/views/<rota>/`
4. **Testes**: Colocar junto ao arquivo testado com sufixo `.test.ts(x)`
5. **Pre-commit**: Husky executa `fixlint` + `build` antes de commits
