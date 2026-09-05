# 🛠️ RECOMENDAÇÕES PRÁTICAS: UI/UX & Frontend
## EloSUS Grupos - Implementação e Melhorias

---

## 1️⃣ CRIAR COMPONENT LIBRARY CENTRALIZADA

### Objetivo
Consolidar componentes em `src/components/ui/` para reutilização e documentação

### Estrutura Proposta

```
src/components/ui/
├── Button.tsx          # Botão com variações
├── Input.tsx           # Input text com validação
├── Select.tsx          # Select com search
├── Card.tsx            # Card base
├── Modal.tsx           # Modal com focus trap
├── Tabs.tsx            # Abas acessíveis
├── Table.tsx           # Table responsivo
├── Pagination.tsx      # Paginação
├── Badge.tsx           # Badge semântico
├── Toast.tsx           # Toast notifications
├── Skeleton.tsx        # Skeleton loading
└── Dialog.tsx          # Dialog genérico
```

### Exemplo: Button.tsx

```tsx
import React from 'react';
import clsx from 'clsx';

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    children,
    className,
    ...props
  }, ref) => {
    // Estilos por variante
    const variantStyles = {
      primary: 'bg-[#0054A6] text-white hover:bg-[#004080] active:scale-95',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      ghost: 'text-slate-700 hover:bg-slate-100'
    };

    // Estilos por tamanho
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          // Base
          'rounded-lg font-bold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'inline-flex items-center justify-center gap-2',
          
          // Variante e tamanho
          variantStyles[variant],
          sizeStyles[size],
          
          // Width
          fullWidth && 'w-full',
          
          // Custom
          className
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className={clsx(loading && 'animate-spin')}>
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Uso

```tsx
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';

export default function MyForm() {
  return (
    <Button 
      variant="primary" 
      size="lg" 
      icon={<Save size={20} />}
      loading={isSubmitting}
      onClick={handleSubmit}
    >
      Salvar
    </Button>
  );
}
```

---

## 2️⃣ IMPLEMENTAR ACESSIBILIDADE KEYBOARD

### Problema
Usuários keyboard não conseguem navigar em dropdowns, modals

### Solução: useKeyboardNavigation Hook

```tsx
// src/hooks/useKeyboardNavigation.tsx

import { useEffect, useRef } from 'react';

interface UseKeyboardNavigationProps {
  items: HTMLElement[];
  vertical?: boolean;
  loop?: boolean;
  onEnter?: (index: number) => void;
}

export function useKeyboardNavigation({
  items,
  vertical = true,
  loop = true,
  onEnter
}: UseKeyboardNavigationProps) {
  const indexRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = vertical 
        ? ['ArrowUp', 'ArrowDown'] 
        : ['ArrowLeft', 'ArrowRight'];

      if (!keys.includes(e.key) && e.key !== 'Enter') return;

      e.preventDefault();

      if (e.key === 'ArrowUp' || (e.key === 'ArrowLeft')) {
        indexRef.current = loop 
          ? (indexRef.current - 1 + items.length) % items.length
          : Math.max(indexRef.current - 1, 0);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        indexRef.current = loop 
          ? (indexRef.current + 1) % items.length
          : Math.min(indexRef.current + 1, items.length - 1);
      } else if (e.key === 'Enter') {
        onEnter?.(indexRef.current);
        return;
      }

      items[indexRef.current]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, vertical, loop, onEnter]);

  return { currentIndex: indexRef.current };
}
```

### Uso em Dropdown

```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

export function Dropdown({ items }) {
  const itemsRef = useRef<HTMLButtonElement[]>([]);
  const { currentIndex } = useKeyboardNavigation({
    items: itemsRef.current,
    vertical: true,
    onEnter: (index) => {
      handleSelect(items[index]);
    }
  });

  return (
    <div className="absolute top-full left-0 bg-white rounded-lg shadow-lg border">
      {items.map((item, idx) => (
        <button
          key={idx}
          ref={(el) => { if (el) itemsRef.current[idx] = el; }}
          tabIndex={idx === currentIndex ? 0 : -1}
          onClick={() => handleSelect(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 3️⃣ MELHORAR RESPONSIVIDADE DE TABELAS

### Problema
Tables não funcionam bem em mobile (overflow horizontal confuso)

### Solução: Converter em Cards em Mobile

```tsx
// src/components/ui/ResponsiveTable.tsx

export function ResponsiveTable({ columns, data, onRowClick }) {
  return (
    <>
      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left p-4 font-bold text-sm">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr 
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className="hover:bg-slate-50 cursor-pointer"
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-4">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className="bg-white p-4 rounded-lg border border-slate-100 cursor-pointer hover:shadow-md"
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between py-1.5">
                <span className="font-semibold text-sm text-slate-600">
                  {col.label}
                </span>
                <span className="text-slate-800">
                  {row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
```

### Uso

```tsx
<ResponsiveTable
  columns={[
    { key: 'name', label: 'Nome' },
    { key: 'status', label: 'Status' },
    { key: 'sessions', label: 'Sessões' }
  ]}
  data={patients}
  onRowClick={(patient) => navigate(`/patients/${patient.id}`)}
/>
```

---

## 4️⃣ ADICIONAR FOCUS STATES VISÍVEIS

### Problema
Keyboard users não veem onde estão focados

### Solução: Custom Focus Styles

```css
/* src/index.css */

@layer components {
  /* Focus ring padrão */
  .focus-ring:focus {
    @apply outline-none ring-2 ring-offset-2 ring-[#0054A6];
  }

  /* Focus para inputs */
  input:focus,
  select:focus,
  textarea:focus {
    @apply ring-2 ring-[#0054A6] ring-offset-2 border-transparent;
  }

  /* Focus para buttons */
  button:focus {
    @apply ring-2 ring-offset-2;
  }

  button[variant="primary"]:focus {
    @apply ring-blue-600;
  }

  button[variant="danger"]:focus {
    @apply ring-red-600;
  }

  /* Focus para links */
  a:focus {
    @apply ring-2 ring-offset-2 ring-[#0054A6] rounded;
  }
}
```

### Aplicação em Componentes

```tsx
<input
  type="text"
  placeholder="Nome..."
  className="focus-ring rounded-lg border-2 border-slate-200"
/>
```

---

## 5️⃣ IMPLEMENTAR DARK MODE / HIGH CONTRAST

### Arquivo: src/contexts/ThemeContext.tsx

```tsx
import { createContext, useContext, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Check localStorage
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) return saved;

    // 2. Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // 3. Check high contrast
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      return 'high-contrast';
    }

    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be inside ThemeProvider');
  return context;
};
```

### Estilos: src/index.css

```css
/* Light Mode (default) */
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}

/* Dark Mode */
:root[data-theme="dark"] {
  --bg-primary: #1e293b;
  --bg-secondary: #0f172a;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --border-color: #334155;
}

/* High Contrast */
:root[data-theme="high-contrast"] {
  --bg-primary: #000000;
  --bg-secondary: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: #000000;
  --border-color: #000000;
}

/* Aplicar em componentes */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.bg-surface {
  background-color: var(--bg-secondary);
}

.border-light {
  border-color: var(--border-color);
}
```

### Selector no Header

```tsx
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <select 
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      className="p-2 rounded-lg border"
    >
      <option value="light">☀️ Claro</option>
      <option value="dark">🌙 Escuro</option>
      <option value="high-contrast">⚫ Alto Contraste</option>
    </select>
  );
}
```

---

## 6️⃣ ADICIONAR SKELETON LOADING SCREENS

### Componente: src/components/ui/Skeleton.tsx

```tsx
export interface SkeletonProps 
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'h-6 rounded',
    circular: 'h-10 w-10 rounded-full',
    rectangular: 'h-12 rounded-lg'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'bg-slate-200 animate-pulse',
            variants[variant],
            className
          )}
          style={style}
        />
      ))}
    </div>
  );
}
```

### Uso

```tsx
import { Skeleton } from '@/components/ui/Skeleton';

export function PatientListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-lg">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 7️⃣ OTIMIZAR PERFORMANCE DE CHARTS

### Problema
Recharts é pesado (45KB gzip) para muitas instâncias

### Solução: Lazy Load Charts

```tsx
// src/components/Dashboard/LazyChart.tsx

import { Suspense, lazy } from 'react';

const HealthRadar = lazy(() => import('./HealthRadar'));
const TerritoryMap = lazy(() => import('./TerritoryMap'));

function ChartFallback() {
  return <Skeleton variant="rectangular" height={300} />;
}

export function LazyHealthRadar(props) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <HealthRadar {...props} />
    </Suspense>
  );
}

export function LazyTerritoryMap(props) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <TerritoryMap {...props} />
    </Suspense>
  );
}
```

### Uso

```tsx
export function Dashboard() {
  return (
    <div className="space-y-8">
      <LazyHealthRadar patients={patients} />
      <LazyTerritoryMap patients={patients} />
    </div>
  );
}
```

---

## 8️⃣ CRIAR COMMAND PALETTE (Cmd+K)

### Componente: src/components/CommandPalette.tsx

```tsx
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  category: string;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      category: 'Navigation',
      action: () => navigate('/dashboard'),
      shortcut: 'D'
    },
    {
      id: 'patients',
      label: 'Pacientes',
      category: 'Navigation',
      action: () => navigate('/patients'),
      shortcut: 'P'
    },
    // ... mais comandos
  ];

  // Cmd+K ou Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} className="text-slate-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar comando..."
            className="flex-1 outline-none"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filtered.map(cmd => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.action();
                setOpen(false);
              }}
              className="w-full text-left p-3 hover:bg-slate-100 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{cmd.label}</div>
                <div className="text-xs text-slate-500">{cmd.category}</div>
              </div>
              {cmd.shortcut && (
                <kbd className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 9️⃣ ADICIONAR SKELETON COM MÚLTIPLOS ESTILOS

### Variações

```tsx
// Card skeleton
<div className="p-6 bg-white rounded-lg">
  <Skeleton variant="text" />
  <Skeleton variant="text" width="80%" />
  <Skeleton variant="rectangular" height={200} className="mt-4" />
</div>

// Table skeleton
<table>
  <thead>
    <tr>
      <td><Skeleton variant="text" width="100px" /></td>
      <td><Skeleton variant="text" width="150px" /></td>
    </tr>
  </thead>
  <tbody>
    {[1, 2, 3].map(i => (
      <tr key={i}>
        <td><Skeleton variant="circular" /></td>
        <td><Skeleton variant="text" /></td>
      </tr>
    ))}
  </tbody>
</table>

// Avatar skeleton
<Skeleton variant="circular" width={40} height={40} />
```

---

## 🔟 ADICIONAR FEEDBACK VISUAL EM AÇÕES

### Toast Notifications

```tsx
import toast from 'react-hot-toast';

// Sucesso
toast.success('Salvo com sucesso!');

// Erro
toast.error('Ocorreu um erro');

// Info
toast.loading('Carregando...');

// Custom
const id = toast.loading('Processando...');
setTimeout(() => {
  toast.success('Pronto!', { id });
}, 2000);
```

### Button Loading State

```tsx
<Button 
  loading={isSubmitting}
  disabled={isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? 'Salvando...' : 'Salvar'}
</Button>
```

### Form Validation

```tsx
<div className="space-y-1">
  <input
    {...field}
    className={clsx(
      'border rounded-lg p-3',
      error && 'border-red-500 bg-red-50'
    )}
  />
  {error && (
    <p className="text-red-600 text-sm flex items-center gap-1">
      <AlertCircle size={16} />
      {error}
    </p>
  )}
</div>
```

---

## 🎓 PRÓXIMOS PASSOS

1. **Implementar Component Library** (~3 sprints)
   - Criar Storybook
   - Documentar todos componentes
   - Adicionar exemplos e casos de uso

2. **Melhorar Acessibilidade** (~2 sprints)
   - Focus states
   - Keyboard navigation
   - ARIA labels

3. **Otimizar Performance** (~2 sprints)
   - Lazy load charts
   - Reduzir bundle size
   - Implementar PWA

4. **Adicionar Recursos UX** (~4 sprints)
   - Dark mode
   - Command palette
   - Customizable dashboards
   - Offline support

---

**Status:** Pronto para implementação  
**Estimativa:** 11 sprints para todas as melhorias  
**Priority:** Acessibilidade > Performance > Novos Recursos
