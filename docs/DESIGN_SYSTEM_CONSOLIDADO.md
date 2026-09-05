# Design System Consolidado - P4

**Objetivo:** Criar design system coeso com 3 níveis visuais e acessibilidade real.

---

## 1. Problemas Atuais

### Inconsistências Visuais
- Muitos gradientes + glassmorphism
- Cores diferentes por card
- Algumas partes parecem "app wellness" outras "institucional"
- Alto contraste é apenas `filter: contrast(1.2)` (insuficiente)
- Muitas animações sem `prefers-reduced-motion`

### Solução: 3 Níveis Visuais Claros

```
┌─────────────────────────────────────────────────────┐
│ 🏛️ NÍVEL 1: INSTITUCIONAL (Azul SUS)               │
│ ├─ Admin dashboard, listas, gestão                 │
│ ├─ Cor: #0054A6 (Azul SUS)                         │
│ ├─ Estilo: Limpo, sem decoração                    │
│ └─ Foco: Informação clara, eficiência             │
├─────────────────────────────────────────────────────┤
│ 🏥 NÍVEL 2: CLÍNICO (Neutro + Semântica)           │
│ ├─ Dashboard profissional, pacientes, grupos      │
│ ├─ Cores: Cinzas + status semantic (verde/red)   │
│ ├─ Estilo: Formal, dados-centric                  │
│ └─ Foco: Dados clínicos, decisão informada       │
├─────────────────────────────────────────────────────┤
│ 💜 NÍVEL 3: BEM-ESTAR (Roxo + Emoção)             │
│ ├─ Dashboard paciente, gamificação, journey       │
│ ├─ Cor: #7C3AED (Roxo)                            │
│ ├─ Estilo: Caloroso, acessível, emocional        │
│ └─ Foco: Engajamento, bem-estar, comunidade     │
└─────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens

### 2.1 Cores Base

```css
:root {
  /* ===== NÍVEL 1: INSTITUCIONAL ===== */
  --sus-blue: #0054A6;
  --sus-blue-dark: #003D7A;
  --sus-blue-light: #E8F1FF;

  /* ===== NÍVEL 2: CLÍNICO ===== */
  --clinical-gray-50: #F9FAFB;
  --clinical-gray-100: #F3F4F6;
  --clinical-gray-200: #E5E7EB;
  --clinical-gray-600: #4B5563;
  --clinical-gray-900: #111827;

  /* Status Semântico */
  --status-success: #10B981;
  --status-warning: #F59E0B;
  --status-error: #EF4444;
  --status-info: #3B82F6;

  /* ===== NÍVEL 3: BEM-ESTAR ===== */
  --wellness-purple: #7C3AED;
  --wellness-purple-light: #EDE9FE;
  --wellness-pink: #EC4899;
  --wellness-amber: #F59E0B;

  /* ===== NEUTROS ===== */
  --white: #FFFFFF;
  --black: #000000;
  --border: #E5E7EB;
}

/* ===== ALTO CONTRASTE (Accessibilidade) ===== */
@media (prefers-contrast: more) {
  :root {
    --clinical-gray-900: #000000;
    --border: #000000;
    --sus-blue: #002147;
  }
}
```

### 2.2 Tipografia

```css
:root {
  /* Fontes */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Monaco', 'Menlo', monospace;

  /* Tamanhos */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}

/* ===== AUMENTAR FONTE (Acessibilidade) ===== */
@media (prefers-reduced-motion: reduce) {
  body {
    font-size: 18px;
  }
}
```

### 2.3 Espaçamento

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

### 2.4 Sombras

```css
:root {
  /* Institucional: Sutil */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Clínico: Focado */
  --shadow-clinical: 0 2px 8px 0 rgba(0, 84, 166, 0.08);

  /* Bem-estar: Leve */
  --shadow-wellness: 0 4px 12px 0 rgba(124, 58, 237, 0.12);
}
```

### 2.5 Bordas

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;
}
```

---

## 3. Componentes por Nível

### NÍVEL 1: Institucional (Admin)

```tsx
// ✅ Limpo, sem decoração
<Card className="bg-white border border-clinical-gray-200 rounded-lg shadow-sm">
  <CardHeader className="border-b border-clinical-gray-200 px-6 py-4">
    <h2 className="text-lg font-semibold text-clinical-gray-900">
      Unidades de Saúde
    </h2>
  </CardHeader>
  <CardBody className="p-6">
    <Table>
      <thead>
        <tr className="border-b border-clinical-gray-200">
          <th className="text-sm font-semibold text-clinical-gray-600">Nome</th>
          <th className="text-sm font-semibold text-clinical-gray-600">Status</th>
        </tr>
      </thead>
      <tbody>
        {/* rows */}
      </tbody>
    </Table>
  </CardBody>
</Card>
```

### NÍVEL 2: Clínico (Profissional)

```tsx
// ✅ Dados primeiro, status semântico claro
<Card className="bg-clinical-gray-50 border border-clinical-gray-200 rounded-lg shadow-clinical">
  <CardHeader className="bg-white border-b border-clinical-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-clinical-gray-900">
        Paciente: João Silva
      </h3>
      <StatusBadge status="active" />
    </div>
  </CardHeader>
  <CardBody className="p-6 space-y-4">
    {/* Dados clínicos com status semântico */}
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-clinical-gray-600">Humor:</span>
      <span className="px-3 py-1 bg-status-success text-white rounded-full text-sm">
        Estável
      </span>
    </div>
  </CardBody>
</Card>
```

### NÍVEL 3: Bem-Estar (Paciente)

```tsx
// ✅ Caloroso, emocional, engajamento
<Card className="bg-gradient-to-br from-wellness-purple-light to-white border border-wellness-purple rounded-xl shadow-wellness">
  <CardHeader className="px-6 py-4">
    <h3 className="text-lg font-bold text-wellness-purple">
      🎉 Bem-vindo, {patient.name}!
    </h3>
  </CardHeader>
  <CardBody className="p-6">
    <p className="text-sm text-clinical-gray-700 mb-4">
      Você completou 7 dias seguidos de check-in. Parabéns!
    </p>
    <button className="w-full bg-gradient-to-r from-wellness-purple to-wellness-pink text-white font-semibold py-3 rounded-lg hover:shadow-lg transition">
      Fazer check-in de hoje
    </button>
  </CardBody>
</Card>
```

---

## 4. Alto Contraste Real

### Problema Atual
```css
/* ❌ Insuficiente */
.high-contrast {
  filter: contrast(1.2) saturate(0.8);
}
```

### Solução
```css
/* ✅ Proper high contrast variant */
@media (prefers-contrast: more) {
  :root {
    /* Cores extremas */
    --text-color: #000000;
    --background-color: #FFFFFF;
    --border-color: #000000;
  }

  /* Components */
  .card {
    background: var(--background-color);
    border: 2px solid var(--border-color);
    color: var(--text-color);
  }

  .button {
    border: 2px solid var(--border-color);
    background: var(--background-color);
    color: var(--text-color);
    font-weight: bold;
  }

  /* Remove subtle shadows and gradients */
  .shadow-sm,
  .shadow-md,
  .shadow-lg {
    box-shadow: none !important;
  }

  .gradient {
    background: var(--background-color) !important;
  }
}
```

---

## 5. Animações Acessíveis

### Problema Atual
```tsx
// ❌ Anima tudo, ignora preferência
<div className="animate-fade-in animate-slide-up">
  Conteúdo
</div>
```

### Solução
```css
/* ✅ Respeita prefers-reduced-motion */
@media (prefers-reduced-motion: no-preference) {
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
}

/* Em reduceMotion, sem animação */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Implementação em Tailwind

### tailwind.config.js
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'sus-blue': '#0054A6',
        'sus-blue-dark': '#003D7A',
        'clinical': {
          50: '#F9FAFB',
          600: '#4B5563',
          900: '#111827',
        },
        'wellness': {
          purple: '#7C3AED',
          'purple-light': '#EDE9FE',
          pink: '#EC4899',
        },
        'status': {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        clinical: '0 2px 8px 0 rgba(0, 84, 166, 0.08)',
        wellness: '0 4px 12px 0 rgba(124, 58, 237, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```

---

## 7. Checklist de Implementação

### Fase 1: Tokens (2 dias)
- [ ] Definir CSS custom properties
- [ ] Atualizar Tailwind config
- [ ] Testar em navegador

### Fase 2: Componentes (5 dias)
- [ ] Refatorar cards
- [ ] Refatorar buttons
- [ ] Refatorar forms
- [ ] Refatorar modals
- [ ] Testar cada um

### Fase 3: Páginas (7 dias)
- [ ] Admin pages (nível 1)
- [ ] Professional pages (nível 2)
- [ ] Patient pages (nível 3)

### Fase 4: Acessibilidade (3 dias)
- [ ] Alto contraste
- [ ] Prefers reduced motion
- [ ] Aumentar fonte
- [ ] Testar com leitores

### Fase 5: QA (2 dias)
- [ ] Validar consistency
- [ ] Testar cross-browser
- [ ] Performance

---

## 8. Exemplo: Refatoração de Componente

### Antes
```tsx
<div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-2xl shadow-2xl hover:shadow-xl transition">
  <h1 className="text-white text-3xl font-bold mb-2">
    Bem-vindo
  </h1>
  <p className="text-purple-100">
    Seu espaço de bem-estar
  </p>
</div>
```

### Depois
```tsx
<Card className="bg-gradient-to-br from-wellness-purple-light to-white border border-wellness-purple rounded-xl shadow-wellness">
  <CardBody className="p-6">
    <h1 className="text-lg font-bold text-wellness-purple">
      Bem-vindo
    </h1>
    <p className="text-sm text-clinical-gray-700 mt-2">
      Seu espaço de bem-estar
    </p>
  </CardBody>
</Card>
```

---

## 9. Recursos

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Prefers Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Design Systems for Health](https://www.smashingmagazine.com/2020/11/healthcare-design-systems/)
