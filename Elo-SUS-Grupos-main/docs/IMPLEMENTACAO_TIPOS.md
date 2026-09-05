# Consolidação de Tipos - Guia de Implementação

**Objetivo:** Eliminar duplicidade de tipos, `any`, e inconsistências de nomenclatura.

## Status: P3 em andamento

---

## 1. Tipos Consolidados Criados

### `src/types/common.ts` ✅
- `UserRole` = `'patient' | 'professional' | 'admin'`
- `ProfessionalStatus` = `'pending_approval' | 'approved' | 'suspended' | 'inactive'`
- `PatientStatus` = `'active' | 'waiting' | 'inactive' | 'discharged' | 'dropout' | 'shared_care'`
- `Gender` = `'M' | 'F' | 'O' | 'N'`
- `GroupStatus` = `'planning' | 'active' | 'paused' | 'closed' | 'completed'`
- `AppointmentStatus` = `'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'`
- `UrgencyLevel` = `'none' | 'low' | 'high' | 'critical' | 'unknown'`

### `src/types/patient.ts` ✅
- `Patient` interface completa com `userId` (vínculo com `users/`)
- Sub-coleções: `MoodEntry`, `Attendance`, `ClinicalNote`
- Schemas Zod para validação
- Eliminação de duplicidade com `users`

---

## 2. Passos para Consolidação do Projeto

### 2.1 Encontrar e Substituir Tipos Duplicados

```bash
# Buscar todas as instâncias de tipos antigos
grep -r "terapeuta\|coordenador\|administrador" src/ --include="*.ts" --include="*.tsx"
grep -r "executor\|referrer" src/ --include="*.ts" --include="*.tsx"
grep -r "type UserRole.*=" src/ --include="*.ts" --include="*.tsx"
```

### 2.2 Eliminar `any` Gradualmente

**Prioridade 1: Tipos Críticos**
- `UserProfile` em `contexts/AuthContext.tsx`
- `Patient` em serviços de paciente
- `Group` em serviços de grupo
- Respostas Firebase (`docSnap.data()`)

**Estratégia:**
```typescript
// ❌ ANTES
const profile = docSnap.data() as any;

// ✅ DEPOIS
const profile = docSnap.data() as UserProfile;
// ou
const profile: UserProfile = {
  uid: docSnap.id,
  ...docSnap.data()
} as UserProfile;
```

**Prioridade 2: Props de Componentes**
```typescript
// ❌ ANTES
interface PatientCardProps {
  patient: any;
  onSelect: any;
}

// ✅ DEPOIS
interface PatientCardProps {
  patient: Patient;
  onSelect: (patient: Patient) => void;
}
```

### 2.3 Atualizar Imports

```typescript
// ❌ ANTES - Vários arquivos de tipos
import type { UserRole } from '../types/shared';
import type { GroupStatus } from '../types/group';

// ✅ DEPOIS - Uma fonte única
import type {
  UserRole,
  GroupStatus,
  PatientStatus,
  UrgencyLevel,
  Gender,
} from '../types/common';
```

### 2.4 Consolidar Services

Cada serviço deve usar tipos de `common.ts`:

```typescript
// src/services/groupService.ts
import type { GroupStatus } from '../types/common';

export interface Group {
  id: string;
  name: string;
  status: GroupStatus;  // ✅ De common.ts
  // ...
}
```

---

## 3. Checklist de Implementação

### Fase 1: Setup (1-2 dias)
- [ ] Revisar todos os arquivos de tipos
- [ ] Documentar duplicidades encontradas
- [ ] Criar plano de remoção
- [ ] Backup de tipos atuais (ramo git)

### Fase 2: Consolidação (3-5 dias)
- [ ] Criar/finalizar `src/types/common.ts`
- [ ] Criar/finalizar `src/types/patient.ts`
- [ ] Atualizar `src/types/group.ts` com tipos consolidados
- [ ] Atualizar `src/types/user.ts` com tipos consolidados
- [ ] Remover tipos duplicados de outros arquivos

### Fase 3: Services (5-7 dias)
- [ ] Atualizar `authService.ts`
- [ ] Atualizar `patientService.ts`
- [ ] Atualizar `groupService.ts`
- [ ] Atualizar todos os demais services

### Fase 4: Componentes (7-10 dias)
- [ ] Atualizar Auth components
- [ ] Atualizar Dashboard components
- [ ] Atualizar Patient components
- [ ] Atualizar Group components
- [ ] Testar cada componente

### Fase 5: Tests e Build (2-3 dias)
- [ ] Executar `npm run lint`
- [ ] Executar `npm run build`
- [ ] Rodar testes E2E
- [ ] Resolver warnings/erros

### Fase 6: Cleanup (1 dia)
- [ ] Remover tipos antigos
- [ ] Remover imports não usados
- [ ] Atualizar documentação

---

## 4. Exemplos Práticos

### Antes: Duplicidade

```typescript
// Em shared.ts
export type UserRole = 'professional' | 'patient' | 'admin';

// Em different-file.ts
export type Role = 'terapeuta' | 'coordenador' | 'paciente' | 'administrador';

// Em outro-file.ts
export type UserRole = 'executor' | 'referrer' | 'patient';
```

### Depois: Consolidado

```typescript
// Em types/common.ts (única fonte)
export type UserRole = 'patient' | 'professional' | 'admin';

// Em todos os arquivos
import type { UserRole } from '../types/common';
```

### Antes: any em Services

```typescript
// patientService.ts
export async function getPatient(id: string) {
  const doc = await getDoc(ref);
  return doc.data() as any;  // ❌
}
```

### Depois: Tipos Específicos

```typescript
// patientService.ts
export async function getPatient(id: string): Promise<Patient | null> {
  const doc = await getDoc(ref);
  if (!doc.exists()) return null;
  return {
    patientId: doc.id,
    ...doc.data()
  } as Patient;  // ✅ Tipo explícito
}
```

---

## 5. Arquivo de Mapeamento (para referência)

| Tipo Antigo | Novo Local | Novo Nome |
|------------|-----------|-----------|
| `UserRole` (vários) | `types/common.ts` | `UserRole` |
| `GroupStatus` (vários) | `types/common.ts` | `GroupStatus` |
| `Role` (em different files) | `types/common.ts` | `UserRole` |
| `terapeuta\|coordenador` | `types/common.ts` | `'professional'` |
| `executor\|referrer` | Remover (use `'professional'`) | - |
| `Patient` (vários) | `types/patient.ts` | `Patient` |
| `Group` (vários) | `types/group.ts` | `Group` |

---

## 6. Commands Úteis

```bash
# Contar instâncias de 'any'
grep -r "as any" src/ --include="*.ts" --include="*.tsx" | wc -l

# Encontrar tipos aninhados
grep -r "interface.*{" src/types/ --include="*.ts" | grep -v "export"

# Validar imports corretos
grep -r "from.*types/schema" src/ --include="*.ts" --include="*.tsx" | head -20

# Build com strict mode
npm run build -- --strict

# Lint com reporte
npm run lint -- --format json > lint-report.json
```

---

## 7. Prioridade de Migração

### 🔴 Crítica (Afeta Segurança)
1. `UserRole` - Eliminar confusão de papéis
2. `PatientStatus` - Usado em autorização
3. Todos os `any` em AuthContext

### 🟠 Alta (Afeta Funcionalidade)
1. `Patient` unificado
2. `Group` unificado
3. Services consolidados

### 🟡 Média (Manutenção)
1. Componentes
2. Hooks
3. Utils

### 🟢 Baixa (Nice to have)
1. Comentários de tipo
2. Documentação inline
3. Tipos auxiliares

---

## 8. Validação e Testes

### Antes de Deploy

```bash
# 1. Type checking
npx tsc --noEmit

# 2. Linting
npm run lint -- --max-warnings 0

# 3. Build
npm run build

# 4. Tests
npm run test -- --run

# 5. E2E Tests
npm run test:e2e -- --headed
```

### Após Deploy

- [ ] Verificar não há erros no console do navegador
- [ ] Testar login/register/logout
- [ ] Testar operações de paciente
- [ ] Testar operações de grupo
- [ ] Verificar dados na auditoria

---

## 9. Rollback Plan

Se algo der errado:

```bash
# 1. Reverter para commit anterior
git revert <commit-hash>

# 2. Deploy anterior
firebase deploy

# 3. Investigar erro
# - Verificar logs
# - Comparar tipos antigos vs novos
# - Testar em branch separado
```

---

## 10. Status de Conclusão

- [x] Criar `types/common.ts`
- [x] Criar `types/patient.ts`
- [ ] Atualizar AuthContext
- [ ] Atualizar todos os Services
- [ ] Atualizar todos os Componentes
- [ ] Eliminar tipos antigos
- [ ] Build 100% sem warnings
- [ ] Testes passando

**Progresso:** 2/10 (20%)
