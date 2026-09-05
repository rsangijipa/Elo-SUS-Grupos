# Guia de Componentes UI - EloSUS Grupos

## Visão Geral

Esta é a biblioteca centralizada de componentes reutilizáveis para EloSUS Grupos. Todos os componentes seguem as melhores práticas de acessibilidade (WCAG 2.1 AA) e design responsivo (mobile-first).

## Localizações

- **UI Components**: `src/components/ui/`
- **Common Components**: `src/components/Common/`
- **Form Hooks**: `src/hooks/`
- **Contexts**: `src/contexts/`

## Como Usar

### Import de Componentes

```typescript
import {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
  AccessibleModal,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Grid,
  GridItem,
  ResponsiveTable,
  Tabs,
  Badge,
  BadgeGroup,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  useFocusTrap
} from '@/components/ui';
```

## Componentes Disponíveis

### Form Components

#### AccessibleButton
Botão com focus states e loading state.

```typescript
<AccessibleButton
  variant="primary" // 'primary' | 'secondary' | 'danger' | 'ghost'
  size="md" // 'sm' | 'md' | 'lg'
  isLoading={false}
  icon={<Plus />}
  iconPosition="left" // 'left' | 'right'
  onClick={() => {}}
>
  Clique aqui
</AccessibleButton>
```

#### AccessibleInput
Input com validação e error messages integrados.

```typescript
<AccessibleInput
  label="E-mail"
  type="email"
  required
  error={errors.email}
  hint="Seu email principal será usado para login"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

#### AccessibleSelect
Select dropdown acessível.

```typescript
<AccessibleSelect
  label="Selecione uma opção"
  options={[
    { value: '1', label: 'Opção 1' },
    { value: '2', label: 'Opção 2', disabled: true }
  ]}
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
/>
```

#### AccessibleModal
Modal com focus trap e keyboard navigation.

```typescript
<AccessibleModal
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  title="Editar Perfil"
  maxWidth="md"
  closeButton
>
  {/* Conteúdo do modal */}
</AccessibleModal>
```

### Layout Components

#### Card
Componente base para cards.

```typescript
<Card hover onClick={() => {}}>
  <CardHeader>
    <h3>Título</h3>
  </CardHeader>
  <CardBody>
    Conteúdo principal
  </CardBody>
  <CardFooter>
    <AccessibleButton>Ação</AccessibleButton>
  </CardFooter>
</Card>
```

#### Grid & GridItem
Layout responsivo em grid.

```typescript
<Grid cols={3} gap="md">
  <GridItem colSpan={2}>
    Item que ocupa 2 colunas
  </GridItem>
  <GridItem>
    Item normal
  </GridItem>
</Grid>
```

#### ResponsiveTable
Tabela que se adapta para cards em mobile.

```typescript
<ResponsiveTable
  columns={[
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail', render: (val) => <a href={`mailto:${val}`}>{val}</a> },
    { key: 'status', header: 'Status' }
  ]}
  data={patients}
  rowKey="patientId"
  onRowClick={(row) => navigate(`/patient/${row.patientId}`)}
/>
```

#### Tabs
Navegação por abas com keyboard support.

```typescript
<Tabs
  tabs={[
    { id: 'tab1', label: 'Aba 1', icon: <Home />, content: <div>Conteúdo 1</div> },
    { id: 'tab2', label: 'Aba 2', content: <div>Conteúdo 2</div> }
  ]}
  defaultTab="tab1"
  onChange={(tabId) => console.log('Selected:', tabId)}
/>
```

### Data Display

#### Badge
Indicadores e labels.

```typescript
<Badge variant="success" size="md">
  Ativo
</Badge>

<BadgeGroup>
  <Badge variant="primary">Tag 1</Badge>
  <Badge variant="warning">Tag 2</Badge>
</BadgeGroup>
```

### Loading States

#### Skeleton Components
Placeholders para loading.

```typescript
<SkeletonCard />
<SkeletonText lines={3} />
<SkeletonTable rows={5} cols={4} />
<SkeletonAvatar size="md" />
```

## Hooks

### useFocusTrap
Gerencia focus trap em modals.

```typescript
const containerRef = useRef<HTMLDivElement>(null);
useFocusTrap(containerRef, { enabled: isOpen });
```

### useLazyLoad
Lazy loading de componentes com IntersectionObserver.

```typescript
const { Component, isLoading, error, ref } = useLazyLoad(
  () => import('./HeavyComponent'),
  { threshold: 0.1, preload: false }
);

return (
  <div ref={ref}>
    {isLoading && <Skeleton />}
    {Component && <Component />}
  </div>
);
```

## Contextos

### ThemeContext
Gerencia dark mode, light mode e high contrast.

```typescript
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// No App.tsx
<ThemeProvider>
  <YourApp />
</ThemeProvider>

// Em componentes
const { theme, setTheme, isDark, isHighContrast } = useTheme();

<ThemeSwitcher />
```

## Acessibilidade

Todos os componentes incluem:
- ✅ Focus states com ring-2 ring-[#0054A6]
- ✅ ARIA labels e descriptions
- ✅ Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- ✅ Screen reader support (sr-only classes)
- ✅ High contrast mode support
- ✅ Reduced motion support

## Responsividade

Todos os componentes são mobile-first:
- Mobile (default): 1 coluna, full width
- Tablet (md:): 2-3 colunas, adjusted padding
- Desktop (lg:): 4+ colunas, optimized layout

## CSS Classes

### Focus States
```css
.focus-ring:focus /* Ring azul padrão */
.focus-ring-danger:focus /* Ring vermelho */
.focus-ring-sm:focus /* Ring pequeno */
```

### Accessibility
```css
.sr-only /* Screen reader only */
.sr-only-focusable:focus /* Visible apenas ao receber foco */
```

## Build & Performance

- ✅ Tree-shakeable exports
- ✅ Lazy loadable components
- ✅ CSS-in-JS optimization
- ✅ Bundle size tracking

## Checklist para Novo Componente

- [ ] Implementar com TypeScript
- [ ] Adicionar ARIA attributes
- [ ] Implementar keyboard navigation
- [ ] Testar focus states
- [ ] Adicionar Tailwind classes
- [ ] Criar export em `ui/index.ts`
- [ ] Documentar no guia
- [ ] Adicionar stories se usando Storybook

## Problemas Comuns

**Q: Como fazer um input obrigatório?**
```typescript
<AccessibleInput required label="Nome" ... />
```

**Q: Como mostrar erro em um input?**
```typescript
<AccessibleInput error="Campo obrigatório" ... />
```

**Q: Como fazer uma tabela responsiva?**
```typescript
Use ResponsiveTable - funciona automaticamente com mobile/desktop
```

**Q: Como adicionar dark mode a um componente?**
```typescript
const { isDark } = useTheme();
return <div className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-black'} />
```

## Roadmap

- [ ] Storybook integration
- [ ] Component testing suite
- [ ] Theme customization API
- [ ] Internationalization (i18n)
- [ ] Animation library
- [ ] Data table advanced features
