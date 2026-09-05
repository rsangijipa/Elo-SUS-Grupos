# Refatoração de Componentes Gigantes - P3

**Objetivo:** Quebrar componentes > 30KB em módulos menores e focados.

---

## Status Atual

| Componente | Tamanho | Status |
|-----------|---------|--------|
| PatientDetail.tsx | ~46 KB | 🔴 Crítico |
| GroupManagement.tsx | ~40 KB | 🔴 Crítico |
| ProfessionalDashboard.tsx | ~34 KB | 🔴 Crítico |

**Meta:** Todos < 8 KB (média de arquivo React)

---

## 1. PatientDetail.tsx (46 KB → 6 KB + módulos)

### Estrutura Atual (monolítico)
```
PatientDetail.tsx (46 KB)
├─ Header (avatar, nome, status)
├─ Clinical Summary (diagnósticos, meds)
├─ Mood Panel (últimos humores)
├─ Groups (grupos do paciente)
├─ Timeline (histórico)
├─ Actions (botões: edit, delete, etc)
└─ Modals (edit, delete confirmation)
```

### Estrutura Refatorada
```
pages/
└─ PatientDetail.tsx (6 KB - container)
   │
   └─ modules/patient/
       ├─ PatientHeader.tsx (5 KB)
       │  ├─ Avatar + Nome
       │  ├─ Status badge
       │  └─ Quick actions
       │
       ├─ PatientClinicalSummary.tsx (6 KB)
       │  ├─ Diagnósticos
       │  ├─ Medicações
       │  └─ Alergias
       │
       ├─ PatientMoodPanel.tsx (5 KB)
       │  ├─ Últimas entradas
       │  ├─ Gráfico mini
       │  └─ Trend indicator
       │
       ├─ PatientGroups.tsx (4 KB)
       │  ├─ Lista de grupos
       │  ├─ Status de cada
       │  └─ Add/remove grupo
       │
       ├─ PatientTimeline.tsx (7 KB)
       │  ├─ Histórico de eventos
       │  ├─ Filtros
       │  └─ Paginação
       │
       ├─ PatientActions.tsx (3 KB)
       │  ├─ Edit button
       │  ├─ Delete button
       │  └─ Export button
       │
       └─ hooks/
           ├─ usePatientData.ts (4 KB)
           ├─ useMoodHistory.ts (3 KB)
           └─ usePatientGroups.ts (3 KB)
```

### Código de Refatoração

**Antes: PatientDetail.tsx (monolítico)**
```typescript
// ❌ 46 KB - tudo junto
export function PatientDetail() {
  const [patient, setPatient] = useState(null);
  const [mood, setMood] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // ... 500+ linhas de lógica
  
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4">
        {/* avatar, nome, status */}
      </div>
      
      {/* Clinical */}
      <div className="grid">
        {/* diagnósticos, meds */}
      </div>
      
      {/* Mood */}
      <div>
        {/* histórico de humor */}
      </div>
      
      {/* Groups */}
      <div>
        {/* grupos do paciente */}
      </div>
      
      {/* ... mais 200 linhas */}
    </div>
  );
}
```

**Depois: PatientDetail.tsx (container)**
```typescript
// ✅ 6 KB - apenas container e orquestração
import { PatientHeader } from './modules/patient/PatientHeader';
import { PatientClinicalSummary } from './modules/patient/PatientClinicalSummary';
import { PatientMoodPanel } from './modules/patient/PatientMoodPanel';
import { PatientGroups } from './modules/patient/PatientGroups';
import { PatientTimeline } from './modules/patient/PatientTimeline';
import { PatientActions } from './modules/patient/PatientActions';
import { usePatientData } from './modules/patient/hooks/usePatientData';

export function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const { patient, loading, error, refetch } = usePatientData(patientId);

  if (loading) return <LoadingFallback />;
  if (error) return <ErrorBoundary error={error} />;
  if (!patient) return <EmptyState />;

  return (
    <div className="space-y-6 p-6">
      <PatientHeader patient={patient} onEdit={refetch} />
      <PatientClinicalSummary patient={patient} />
      <PatientMoodPanel patientId={patientId} />
      <PatientGroups patient={patient} onUpdate={refetch} />
      <PatientTimeline patientId={patientId} />
      <PatientActions patient={patient} onDelete={() => goBack()} />
    </div>
  );
}
```

**PatientHeader.tsx (5 KB)**
```typescript
// Isolado, testável, reutilizável
import { Avatar } from '@/components/Common/Avatar';
import { StatusBadge } from '@/components/Common/StatusBadge';
import type { Patient } from '@/types/patient';

interface PatientHeaderProps {
  patient: Patient;
  onEdit: () => void;
}

export function PatientHeader({ patient, onEdit }: PatientHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar name={patient.name} src={patient.avatar} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-gray-500">{patient.cns}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={patient.status} />
        <button onClick={onEdit} className="btn btn-primary">
          Editar
        </button>
      </div>
    </div>
  );
}
```

**usePatientData.ts (4 KB - hook customizado)**
```typescript
// Lógica de dados separada
import { useEffect, useState } from 'react';
import { getPatient } from '@/services/patientService';
import type { Patient } from '@/types/patient';

export function usePatientData(patientId: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getPatient(patientId);
      setPatient(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [patientId]);

  return { patient, loading, error, refetch };
}
```

---

## 2. GroupManagement.tsx (40 KB → 5 KB + módulos)

### Estrutura Refatorada
```
pages/
└─ GroupManagement.tsx (5 KB - container)
   │
   └─ modules/group/
       ├─ GroupHeader.tsx (4 KB)
       ├─ GroupMembers.tsx (6 KB)
       ├─ GroupSchedule.tsx (5 KB)
       ├─ GroupSettings.tsx (4 KB)
       ├─ GroupStatistics.tsx (5 KB)
       └─ hooks/
           ├─ useGroupData.ts (3 KB)
           ├─ useGroupMembers.ts (4 KB)
           └─ useGroupSchedule.ts (3 KB)
```

### Código Exemplo
```typescript
// ✅ GroupManagement.tsx (5 KB)
export function GroupManagement() {
  const { groupId } = useParams<{ groupId: string }>();
  const [tab, setTab] = useState<'overview' | 'members' | 'schedule' | 'settings'>('overview');

  const { group, loading, refetch } = useGroupData(groupId);

  if (loading) return <LoadingFallback />;

  return (
    <div className="space-y-4">
      <GroupHeader group={group} />

      <div className="border-b border-gray-200">
        <TabNavigation tab={tab} onChange={setTab} />
      </div>

      {tab === 'overview' && <GroupOverview group={group} />}
      {tab === 'members' && <GroupMembers groupId={groupId} onUpdate={refetch} />}
      {tab === 'schedule' && <GroupSchedule groupId={groupId} />}
      {tab === 'settings' && <GroupSettings group={group} onSave={refetch} />}
    </div>
  );
}
```

---

## 3. ProfessionalDashboard.tsx (34 KB → 6 KB + módulos)

### Estrutura Refatorada
```
pages/
└─ ProfessionalDashboard.tsx (6 KB - container)
   │
   └─ modules/professional/
       ├─ DashboardOverview.tsx (5 KB)
       ├─ PatientsList.tsx (6 KB)
       ├─ GroupsWidget.tsx (4 KB)
       ├─ UpcomingSessions.tsx (5 KB)
       ├─ KPICards.tsx (3 KB)
       ├─ AlertsPanel.tsx (4 KB)
       └─ hooks/
           ├─ useProfessionalStats.ts (4 KB)
           └─ useProfessionalPatients.ts (4 KB)
```

### Código Exemplo
```typescript
// ✅ ProfessionalDashboard.tsx (6 KB)
export function ProfessionalDashboard() {
  const { user } = useAuth();
  const { stats, loading } = useProfessionalStats(user.uid);

  if (loading) return <LoadingFallback />;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <KPICards stats={stats} />

      {/* Grid: Patients + Groups */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <PatientsList professionalId={user.uid} />
        </div>
        <div>
          <GroupsWidget professionalId={user.uid} />
        </div>
      </div>

      {/* Bottom: Sessions + Alerts */}
      <div className="grid grid-cols-2 gap-6">
        <UpcomingSessions professionalId={user.uid} />
        <AlertsPanel professionalId={user.uid} />
      </div>
    </div>
  );
}
```

---

## 4. Checklist de Refatoração

### Antes de Começar
- [ ] Criar ramo: `git checkout -b refactor/split-components`
- [ ] Backup do arquivo original
- [ ] Identificar limites lógicos
- [ ] Planejar estrutura de pastas

### Durante Refatoração
- [ ] Extrair componentes
- [ ] Mover lógica para hooks
- [ ] Atualizar imports
- [ ] Testar cada sub-componente
- [ ] Verificar props drilling (evitar > 3 níveis)

### Depois de Refatoração
- [ ] Todos componentes < 10 KB
- [ ] Tipos corretos (sem `any`)
- [ ] Testes passando
- [ ] Build sem warnings
- [ ] Performance mantida ou melhorada

---

## 5. Métricas de Sucesso

### Antes
```
PatientDetail.tsx:           46 KB
GroupManagement.tsx:         40 KB
ProfessionalDashboard.tsx:   34 KB
───────────────────────────────────
Total:                      120 KB (2/13 tasks)
```

### Depois (meta)
```
PatientDetail.tsx:           6 KB
├─ PatientHeader.tsx:        5 KB
├─ PatientClinicalSummary:   6 KB
├─ PatientMoodPanel.tsx:     5 KB
├─ PatientGroups.tsx:        4 KB
├─ PatientTimeline.tsx:      7 KB
└─ PatientActions.tsx:       3 KB
Subtotal:                   36 KB (83% ↓)

GroupManagement.tsx:         5 KB
├─ GroupHeader.tsx:          4 KB
├─ GroupMembers.tsx:         6 KB
├─ GroupSchedule.tsx:        5 KB
└─ GroupSettings.tsx:        4 KB
Subtotal:                   24 KB (40% ↓)

ProfessionalDashboard.tsx:   6 KB
├─ DashboardOverview.tsx:    5 KB
├─ PatientsList.tsx:         6 KB
├─ GroupsWidget.tsx:         4 KB
├─ UpcomingSessions.tsx:     5 KB
├─ KPICards.tsx:             3 KB
└─ AlertsPanel.tsx:          4 KB
Subtotal:                   33 KB (3% ↓)

───────────────────────────────────
Total:                       93 KB (22% ↓ geral)
```

---

## 6. Padrão de Refatoração

### Template: Componente Extraído
```typescript
/**
 * [NomeComponente]
 * 
 * Responsável por: [descrição]
 * Tamanho: ~5 KB
 * Props: [Interface]
 * 
 * Uso:
 * <[NomeComponente] prop1={value1} onAction={handler} />
 */

import React from 'react';
import type { [PropsInterface] } from './types';

/**
 * [PropsInterface]: Interface de props
 */
export interface [PropsInterface] {
  // Dados
  data: unknown;
  
  // Callbacks
  onAction?: () => void;
  
  // Opciones
  variant?: 'default' | 'compact';
}

/**
 * Componente funcional
 */
export function [NomeComponente](props: [PropsInterface]) {
  const { data, onAction, variant = 'default' } = props;

  // Lógica simples
  // (lógica complexa → hook customizado)

  return (
    <div className={`variant-${variant}`}>
      {/* JSX */}
    </div>
  );
}
```

---

## 7. Próximos Passos

1. **Semana 1:** Refatorar PatientDetail
2. **Semana 2:** Refatorar GroupManagement
3. **Semana 3:** Refatorar ProfessionalDashboard
4. **Semana 4:** Testar, otimizar, deploy

---

## 8. Referências

- [React Documentation - Code Splitting](https://react.dev/reference/react/lazy)
- [Component Composition Patterns](https://www.smashingmagazine.com/2021/08/react-libraries-component-composition/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)
