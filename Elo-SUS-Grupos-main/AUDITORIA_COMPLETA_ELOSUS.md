# AUDITORIA COMPLETA — EloSUS Grupos

**Data:** Setembro 2026  
**Versão:** 1.0  
**Escopo:** Análise arquitetural, segurança, privacidade, modelagem de dados, IA clínica e pronto para produção

---

## SUMÁRIO EXECUTIVO

### Conceito: 9/10 ⭐
O EloSUS Grupos é uma **plataforma de cuidado coletivo em Atenção Primária** bem posicionada. Não é apenas agenda; forma um ecossistema de encaminhamento → triagem → grupos → encontros → materiais → acompanhamento.

### Implementação: 6/10 ⚠️
O **frontend é maduro, o produto conceitual é excelente**, mas a **arquitetura de dados, segurança e autorização não estão prontas para produção com dados de pacientes reais**.

### Pronto para Produção: 4/10 ❌
**Não coloque em produção com dados reais antes de:**
- Corrigir Firestore Rules (P0)
- Redesenhar autorização de perfis profissionais (P0)
- Unificar modelagem users ↔ patients (P1)
- Implementar auditoria (P2)

---

## TABELA DE PRIORIDADES

| Prioridade | Área | Severidade | Impacto |
|-----------|------|-----------|---------|
| **P0** | Qualquer pessoa pode se cadastrar como profissional | CRÍTICA | Fraude/roubo de identidade profissional |
| **P0** | Qualquer usuário autenticado lê todos os pacientes | CRÍTICA | Vazamento de dados de saúde |
| **P0** | Cache offline com dados clínicos em computador compartilhado | CRÍTICA | Exposição entre usuários |
| **P1** | Duplicidade users ↔ patients | ALTA | Inconsistência de dados, bugs silenciosos |
| **P1** | Coleções sem rules (healthUnits, group_notifications, etc) | ALTA | Acesso negado em produção |
| **P2** | IA (Gemini) no frontend + chave pública | MÉDIA | Vazamento de chave, dados para terceiro |
| **P2** | Risco clínico como gatekeeper, não como assistência | MÉDIA | Falha na detecção de crises |
| **P3** | Build/lint instável, 143 erros e 81 `any` | MÉDIA | Dificuldade de manutenção |
| **P4** | Design system inconsistente, 300KB em uma página | BAIXA | Dívida técnica, UX fragmentada |

---

# P0: SEGURANÇA CRÍTICA

## P0.1: Qualquer Pessoa Pode Se Cadastrar Como Profissional

### Problema
Arquivo: `src/components/Auth/RegisterForm.tsx` + `src/services/authService.ts`

```typescript
// ❌ PROBLEMA: Usuário escolhe seu próprio role
const schema = z.object({
  userType: z.enum(['patient', 'professional', 'admin']),
  // ...
  crp: z.string().min(1, "CRP obrigatório"),
});

// ❌ PROBLEMA: CRP só valida se está vazio, não autorização
if (userType === 'professional') {
  if (!crp || crp.trim() === '') {
    throw new Error("CRP é obrigatório");
  }
  // ✗ Nenhuma validação contra base de profissionais licenciados
}
```

**Risco:**
- Alguém cria conta como "profissional" com CRP fabricado
- Obtém permissões para criar/alterar pacientes
- Acessa dados clínicos de centenas de pessoas
- Não há auditoria do que foi feito

**Solução arquitetural:**

```
CADASTRO PACIENTE
├─ Criar conta (role: null)
├─ Email confirmado
└─ Paciente ativo

CADASTRO PROFISSIONAL (novo fluxo)
├─ Pessoa clica "Sou profissional"
├─ Insere CPF + CRP + UBS
├─ Backend valida CRP no Conselho Regional
│   (Chamada integrada ou base sincronizada)
├─ Se válido → Convite enviado
├─ Profissional aceita (email link)
├─ Admin aprova vínculo com UBS
├─ Backend atribui role via Custom Claims
└─ Frontend não pode alterar role

CADASTRO ADMIN
├─ Somente por convite de Admin existente
├─ Backend atribui role via Custom Claims
└─ Não é possível via registro público
```

### Implementação

**1. Remover escolha de role do frontend:**

```typescript
// src/components/Auth/RegisterForm.tsx

// ❌ REMOVER
// const userType = 'patient' | 'professional' | 'admin'

// ✅ ADICIONAR
// Usuário se registra como paciente
// Depois pode solicitar "Modo Profissional"
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  // Somente esses dois campos
});
```

**2. Backend: Criar Cloud Function para validação de CRP:**

```typescript
// functions/src/onProfessionalRequest.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const requestProfessionalMode = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) throw new Error("Não autenticado");

    const { cpf, crp, unitId } = data;

    // Validar CRP junto ao CFP/CRMR/CRP (exemplo CFP)
    const isValid = await validateCRPWithCFP(crp, cpf);
    if (!isValid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "CRP inválido ou não registrado"
      );
    }

    // Criar registro de solicitação
    await admin
      .firestore()
      .collection("professional_requests")
      .add({
        uid: context.auth.uid,
        cpf, // Criptografado em produção
        crp,
        unitId,
        status: "pending_admin",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { status: "pending", message: "Aguardando aprovação do administrador" };
  }
);
```

**3. Admin aprova e backend atribui role:**

```typescript
// functions/src/approveProfessional.ts
export const approveProfessional = functions.https.onCall(
  async (data, context) => {
    // Apenas admin pode chamar
    const caller = await admin.auth().getUser(context.auth!.uid);
    if (!(caller.customClaims?.role === "admin")) {
      throw new functions.https.HttpsError("permission-denied", "Não é admin");
    }

    const { professionalRequestId, approve } = data;

    if (approve) {
      const request = await admin
        .firestore()
        .collection("professional_requests")
        .doc(professionalRequestId)
        .get();

      // Atualizar Custom Claims
      await admin.auth().setCustomUserClaims(request.data().uid, {
        role: "professional",
        unitId: request.data().unitId,
      });
    }
  }
);
```

**4. Firestore Rules protegem role:**

```firestore
match /users/{userId} {
  // ✅ Na CRIAÇÃO: role pode ser vazio ou paciente apenas
  allow create: if request.auth.uid == userId &&
                request.resource.data.role == null;

  // ✅ Após criação: role nunca pode ser alterado pelo cliente
  allow update: if request.auth.uid == userId &&
                !("role" in request.resource.data.diff(resource.data));

  // Role vem exclusivamente de Custom Claims
  // Não é campo editável via regras
}
```

**5. Frontend lê role de Custom Claims:**

```typescript
// src/context/AuthContext.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ✅ Pega role de Custom Claims (atribuído por backend)
      const idTokenResult = await user.getIdTokenResult();
      const role = idTokenResult.claims.role || "patient";

      setCurrentUser({
        uid: user.uid,
        email: user.email,
        role, // Vem de Custom Claims, não pode ser manipulado
      });
    }
  });
}, []);
```

**Arquivos a modificar:**
- `src/components/Auth/RegisterForm.tsx` — remover escolha de role
- `src/services/authService.ts` — remover validação de CRP apenas
- `firestore.rules` — proteger role na criação e edição
- Criar `functions/src/onProfessionalRequest.ts` — validação de CRP
- Criar `functions/src/approveProfessional.ts` — atribuição de role
- `src/context/AuthContext.tsx` — ler role de Custom Claims

---

## P0.2: Qualquer Usuário Autenticado Pode Ler Todos os Pacientes

### Problema
Arquivo: `firestore.rules`

```firestore
match /patients/{patientId} {
    allow read: if request.auth != null;  // ❌ CRÍTICA
}

match /users/{userId} {
    allow read: if request.auth != null;  // ❌ CRÍTICA
}
```

**Risco:**
- Paciente A pode abrir console e chamar: `db.collection('patients').get()`
- Retorna todos os 500 pacientes da UBS, com CPF, CNS, endereço, telefone
- Profissional B pode consultar pacientes da UBS rival
- Admin pode ser qualquer um que trocou seu role localmente

**Solução:**

```firestore
match /users/{userId} {
  // Leitura: apenas o próprio usuário
  allow read: if request.auth.uid == userId;

  // Profissional pode ler pacientes próprios (via claims)
  allow read: if request.auth.token.role == 'professional' &&
              request.auth.token.unitId == resource.data.unidadeSaudeId;

  // Admin pode ler qualquer um na sua unidade
  allow read: if request.auth.token.role == 'admin' &&
              request.auth.token.unitId == resource.data.unidadeSaudeId;
}

match /patients/{patientId} {
  // Leitura: apenas profissionais vinculados
  allow read: if isMemberOfUnit(request.auth.token.unitId) &&
              (request.auth.token.role == 'professional' ||
               request.auth.token.role == 'admin');

  // Paciente lê apenas a si mesmo
  allow read: if request.auth.uid == resource.data.userId;

  // ... criar, atualizar, deletar conforme regra de negócio
}

function isMemberOfUnit(unitId) {
  return request.auth.token.unitId == unitId;
}
```

**Dados que NUNCA devem estar em reads abertos:**
- CPF / CNS
- Endereço
- Telefone
- Registros clínicos
- Histórico de humor
- Avaliação de risco
- Gravidez / medicamentos
- Contato de emergência

**Implementação no frontend:**

```typescript
// ❌ REMOVER: DataProvider carregando todos os pacientes
useEffect(() => {
  const q = query(
    collection(db, "patients"),
    where("unidadeSaudeId", "==", unitId)
  );
  // Isso carrega TODOS se o usuario é paciente sem unitId
}, []);

// ✅ ADICIONAR: DataProvider carrega apenas dados do próprio usuário
useEffect(() => {
  if (currentUser.role === "patient") {
    // Paciente: carrega apenas seu próprio perfil
    const docRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setCurrentUserData(doc.data());
    });
    return unsubscribe;
  }

  if (currentUser.role === "professional") {
    // Profissional: carrega pacientes da sua UBS apenas
    const q = query(
      collection(db, "patients"),
      where("unidadeSaudeId", "==", userUnitId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPatients(snapshot.docs.map(d => d.data()));
    });
    return unsubscribe;
  }
}, [currentUser.role]);
```

**Arquivos a modificar:**
- `firestore.rules` — especificar regras por role
- `src/context/DataContext.tsx` — não carregar todos os pacientes
- `src/services/patientService.ts` — remover queries genéricas
- `src/context/AuthContext.tsx` — garantir Custom Claims populados

---

## P0.3: Cache Offline Expõe Dados Entre Usuários

### Problema
Arquivo: `src/main.tsx`, `vite.config.ts`, Service Worker

```typescript
// ❌ PROBLEMA: Cache persistente global
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  persistentMultipleTabManager(),
});

// Service Worker faz cache de:
// /api/patients → 300 pacientes
// /api/mood_logs → históricos
// /api/users → perfis
```

**Cenário:**
1. Psicóloga A faz login em computador compartilhado → 300 pacientes + históricos carregados no cache
2. Psicóloga A faz logout
3. Psicólogo B faz login no mesmo computador
4. Psicólogo B abre DevTools → pode acessar cache de Psicóloga A
5. Mesmo após logout, dados persistem em localStorage/IndexedDB

**Solução:**

```typescript
// src/services/storageManager.ts
export class SecureStorageManager {
  /**
   * Limpa dados clinicamente sensíveis ao fazer logout
   */
  static async clearClinicalData() {
    // 1. Limpar IndexedDB do Firebase
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name?.includes("firestore")) {
        indexedDB.deleteDatabase(db.name);
      }
    }

    // 2. Limpar localStorage de dados clínicos
    const keysToRemove = [
      "patients",
      "mood_logs",
      "screenings",
      "groups",
      "appointments",
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 3. Limpar Service Worker cache
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        if (name.includes("clinical")) {
          await caches.delete(name);
        }
      }
    }

    // 4. Avisar ao Service Worker
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CLEAR_CLINICAL_CACHE",
      });
    }
  }
}

// src/context/AuthContext.tsx
const logout = async () => {
  await auth.signOut();
  await SecureStorageManager.clearClinicalData();
  // Reload para garantir limpeza
  window.location.href = "/";
};
```

**Política de cache para PWA:**

```typescript
// src/sw.ts (Service Worker)
// ✅ Cache do SHELL (interface, scripts, CSS)
self.addEventListener("install", () => {
  caches.open("app-shell-v1").then(cache => {
    cache.addAll([
      "/",
      "/index.html",
      "/assets/app.css",
      "/assets/app.js",
      // NÃO ADICIONE dados clínicos aqui
    ]);
  });
});

// ❌ NÃO fazer cache de Firestore queries
// ❌ NÃO fazer cache de /patients
// ❌ NÃO fazer cache de /mood_logs
// ❌ NÃO fazer cache de dados autenticados

// ✅ Offline: mostrar shell + mensagem
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/clinical")) {
    // Dados clínicos: nunca cache, fallback to offline page
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/offline.html");
      })
    );
  }
});
```

**Implementação em Firestore:**

```typescript
// src/main.tsx
const db = initializeFirestore(app, {
  // ✅ Manter sincronização, mas...
  localCache: persistentLocalCache(),

  // ❌ Desabilitar em modo "shared device"
  // (Administrativamente, através de feature flags)
});

// ✅ Alternativa: Desabilitar cache local completamente
// const db = getFirestore(app);
// Sem localCache = sem persistência no IndexedDB
// Melhor para saúde, pior para offline
// Trade-off a decidir conforme contexto de uso
```

**Arquivos a modificar:**
- `src/context/AuthContext.tsx` — chamar `clearClinicalData()` no logout
- `src/services/storageManager.ts` — nova classe para limpeza segura
- `src/sw.ts` — não fazer cache de dados clínicos
- `src/main.tsx` — considerar desabilitar localCache
- Criar documentação sobre "shared device mode"

---

## P0.4: Qualquer Pessoa Pode Tentar Se Registrar Como Admin

### Problema
Arquivo: `firestore.rules`

```firestore
match /users/{userId} {
  allow create: if request.auth.uid == userId;
  // ❌ Não previne criar com role: "admin"
}
```

**Risco:**
- Cliente manipulado tenta: `db.collection('users').doc(uid).set({ role: 'admin' })`
- A regra diz "apenas o dono pode criar", mas não valida campo `role`
- Embora a regra impeça UPDATE de role depois (bom), a CRIAÇÃO inicial não está protegida

**Solução:**

```firestore
match /users/{userId} {
  // Na criação: role deve estar ausente ou null
  // Será preenchido apenas por backend via Custom Claims
  allow create: if request.auth.uid == userId &&
                (!('role' in request.resource.data) ||
                 request.resource.data.role == null);

  // Na atualização: role nunca pode ser alterado
  allow update: if request.auth.uid == userId &&
                !('role' in request.resource.data.diff(resource.data));

  // Leitura: conforme P0.2

  // Deleção: apenas o próprio usuário ou admin
  allow delete: if request.auth.uid == userId ||
                request.auth.token.role == 'admin';
}
```

**Verificar:**
- [ ] Remover campo `role` de qualquer schema de criação de user
- [ ] Confirmar que Custom Claims é a única fonte de role
- [ ] Testar que tentativa de `set({ role: 'admin' })` é bloqueada

---

## P0.5: Chats de Grupos Excessivamente Abertos

### Problema
Arquivo: `firestore.rules`

```firestore
match /groups/{groupId}/messages/{messageId} {
  allow read: if request.auth != null;  // ❌ CRÍTICA
}
```

**Risco:**
- Paciente A conhece ID de grupo diferente
- Pode ler todas as mensagens daquele grupo
- Inclui discussões clínicas, decisões de tratamento, dados de outros pacientes

**Solução:**

```firestore
// Helper
function isMemberOfGroup(groupId) {
  return exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid));
}

function isProfessionalOf(groupId) {
  let group = get(/databases/$(database)/documents/groups/$(groupId));
  return request.auth.token.unitId == group.data.unidadeSaudeId &&
         (request.auth.token.role == 'professional' ||
          request.auth.token.role == 'admin');
}

match /groups/{groupId} {
  // Leitura: membro do grupo OU profissional da unidade
  allow read: if isMemberOfGroup(groupId) ||
              isProfessionalOf(groupId);

  allow create, update, delete: if isProfessionalOf(groupId);
}

match /groups/{groupId}/members/{memberId} {
  allow read: if request.auth.uid == memberId ||
              isProfessionalOf(groupId);
}

match /groups/{groupId}/messages/{messageId} {
  // Leitura: apenas membros do grupo OU profissional
  allow read: if isMemberOfGroup(groupId) ||
              isProfessionalOf(groupId);

  // Escrita: autores e profissionais
  allow create: if (request.auth.uid == request.resource.data.authorId &&
                   isMemberOfGroup(groupId)) ||
                isProfessionalOf(groupId);

  allow update, delete: if request.auth.uid == resource.data.authorId ||
                        isProfessionalOf(groupId);
}
```

**Implementação no frontend:**

```typescript
// src/services/groupService.ts
export async function getGroupMessages(groupId: string) {
  // ✅ Firestore Rules bloqueia se não membro
  const q = query(
    collection(db, "groups", groupId, "messages"),
    orderBy("createdAt", "desc")
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data());
  } catch (error) {
    if (error.code === "permission-denied") {
      console.warn("Sem permissão para acessar este grupo");
      return [];
    }
    throw error;
  }
}
```

**Arquivos a modificar:**
- `firestore.rules` — aplicar regra `isMemberOfGroup()` a messages
- `src/services/groupService.ts` — adicionar tratamento de permission-denied

---

# P1: ARQUITETURA DE DADOS

## P1.1: Duplicidade users ↔ patients

### Problema

Duas coleções representam essencialmente a mesma coisa:

| Aspecto | users | patients |
|---------|-------|----------|
| **Usado por** | Autenticação, perfil, mood_logs | Grupos, agenda, registros clínicos |
| **ID** | UID do Firebase Auth | PatientId (UUID aleatório) |
| **Campos** | role, avatar, settings, mood_logs | clinicalData, screening, attendance |
| **Quem consulta** | Qualquer um | Profissional |
| **Problema** | Paciente está em users mas não tem patient.userId = uid | Cria inconsistência |

**Exemplos de bug:**

```typescript
// groupService.ts procura paciente em users
const participant = await db.collection('users')
  .doc(participantId)
  .get();

// Mas patient.tsx procura em patients
const patient = await db.collection('patients')
  .doc(patientId)
  .get();

// Se participantId ≠ patientId:
// - Profissional abre paciente ✓
// - Profissional tenta incluir no grupo ✗ (not found)
```

**Solução: Unificar com referência clara**

```
/users/{uid}
  ├─ email
  ├─ name
  ├─ role (deprecated → use Custom Claims)
  ├─ avatar
  ├─ settings
  └─ unidadeSaudeId (se profissional)

/patients/{patientId}
  ├─ userId: uid  ← EXPLÍCITO
  ├─ name
  ├─ cpf
  ├─ cns
  ├─ dateOfBirth
  ├─ gender
  ├─ address
  ├─ phone
  ├─ unidadeSaudeId
  ├─ clinicalData
  └─ screeningResults

/patients/{patientId}/attendance/
  ├─ appointments: [...date, status, groupId, professionalsAbsent...]
  └─ presence: [...]

/patients/{patientId}/moodEntries/
  ├─ {entryId}
  │  ├─ date
  │  ├─ mood
  │  ├─ tags
  │  ├─ text
  │  ├─ aiAnalysis (sentiment, riskFlag, urgency)
  │  └─ reviewed (profissional viu?)

/patients/{patientId}/screenings/
  └─ [{instrumentType, date, score, interpretation}]

/patients/{patientId}/notes/
  └─ [{date, authorId, text, type}]

/groups/{groupId}/members/
  └─ {patientId}: {joinedAt, status, role}
```

### Implementação

**1. Migration script:**

```typescript
// scripts/migrate-users-to-patients.ts
import * as admin from "firebase-admin";

export async function migrateUsersToPatients() {
  const db = admin.firestore();
  const batch = db.batch();

  // 1. Para cada user com role: "patient"
  const usersSnapshot = await db
    .collection("users")
    .where("role", "==", "patient")
    .get();

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();

    // 2. Criar patient record com referência ao uid
    const newPatient = {
      userId: userDoc.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      cpf: userData.cpf || null,
      cns: userData.cns || null,
      // ... copiar campos clínicos relevantes
    };

    batch.set(db.collection("patients").doc(), newPatient);
  }

  await batch.commit();
  console.log("Migration completed");
}
```

**2. Schema atualizado:**

```typescript
// src/types/patient.ts
import { z } from "zod";

export const PatientSchema = z.object({
  patientId: z.string(),
  userId: z.string(), // Vínculo com Firebase Auth
  name: z.string(),
  cpf: z.string().nullable(),
  cns: z.string().nullable(),
  dateOfBirth: z.string(),
  gender: z.enum(["M", "F", "O"]),
  address: z.string(),
  phone: z.string(),
  unidadeSaudeId: z.string(),
  clinicalData: z.object({
    primaryDiagnosis: z.string().nullable(),
    comorbidities: z.array(z.string()),
    currentMedications: z.array(z.string()),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Patient = z.infer<typeof PatientSchema>;
```

**3. Serviços refatorados:**

```typescript
// src/services/patientService.ts
export async function getPatientByUserId(userId: string): Promise<Patient> {
  const q = query(
    collection(db, "patients"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("Patient not found");
  return snapshot.docs[0].data() as Patient;
}

export async function addPatientToGroup(
  patientId: string,
  groupId: string
): Promise<void> {
  // ✅ Agora patientId é a fonte única
  const batch = writeBatch(db);

  // Adicionar em members
  batch.set(
    doc(db, "groups", groupId, "members", patientId),
    { joinedAt: new Date(), status: "active" }
  );

  // Atualizar grupos do paciente
  batch.update(
    doc(db, "patients", patientId),
    { groupIds: arrayUnion(groupId) }
  );

  await batch.commit();
}
```

**4. DataContext refatorado:**

```typescript
// src/context/DataContext.tsx
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "professional") return;

    // ✅ Query apenas a colleção patients
    // ✅ Protegida por Firestore Rules
    const q = query(
      collection(db, "patients"),
      where("unidadeSaudeId", "==", currentUser.unitId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPatients(snapshot.docs.map(d => d.data() as Patient));
    });

    return unsubscribe;
  }, [currentUser]);

  // ...
}
```

**Arquivos a criar/modificar:**
- `src/types/patient.ts` — novo schema unificado
- `scripts/migrate-users-to-patients.ts` — migration
- `src/services/patientService.ts` — refatorar com userId
- `src/context/DataContext.tsx` — simplificar
- `src/components/PatientDetail.tsx` — usar patients collection
- `firestore.rules` — atualizar com novo modelo

---

## P1.2: Coleções sem Regras (healthUnits, group_notifications, etc.)

### Problema
Arquivo: Vários services usam coleções que não têm regras correspondentes

```typescript
// src/services/healthUnitService.ts
export async function getAllHealthUnits() {
  return getDocs(collection(db, "healthUnits")); // ❌ Sem rule
}

// src/services/groupService.ts
export async function getGroupNotifications(groupId) {
  return getDocs(collection(db, `groups/${groupId}/notifications`)); // ❌ Sem rule
}

// No final do firestore.rules:
match /{document=**} {
  allow read, write: if false;  // ← Tudo o resto é bloqueado
}
```

**Resultado em produção:**
- `permission-denied` error
- Interface quebrada
- Admin não consegue visualizar unidades de saúde
- Dashboard profissional vazio

**Mapeamento de coleções:**

| Coleção | Tipo | Atual | Necessária |
|---------|------|-------|-----------|
| healthUnits | Metadados | ❌ | ✅ |
| presencasSessao | Clínico | ❌ | ✅ |
| inscricoesGrupo | Clínico | ❌ | ✅ |
| group_notifications | Notificação | ❌ | ✅ |
| news | Conteúdo | ❌ | ✅ |
| appointments | Clínico | ❌ | ✅ |
| quizzes | Conteúdo | ❌ | ✅ |

**Solução: Adicionar rules completas**

```firestore
// ===== HEALTH UNITS =====
match /healthUnits/{unitId} {
  // Leitura: qualquer autenticado (metadado público da rede SUS)
  allow read: if request.auth != null;

  // Escrita: apenas admin
  allow write: if request.auth.token.role == 'admin';
}

// ===== APPOINTMENTS =====
match /appointments/{appointmentId} {
  // Paciente: vê os seus
  allow read: if request.auth.uid == resource.data.patientId;

  // Profissional: vê da sua unidade
  allow read: if request.auth.token.role == 'professional' &&
              request.auth.token.unitId == resource.data.unidadeSaudeId;

  // Profissional cria/atualiza na sua unidade
  allow create, update: if request.auth.token.role == 'professional' &&
                        request.resource.data.unidadeSaudeId == request.auth.token.unitId;

  allow delete: if request.auth.token.role == 'admin';
}

// ===== GROUP ATTENDANCE/PRESENCE =====
match /groups/{groupId}/attendance/{attendanceId} {
  allow read: if get(/databases/$(database)/documents/groups/$(groupId)).data.unidadeSaudeId == request.auth.token.unitId &&
              (request.auth.token.role == 'professional' || request.auth.token.role == 'admin');

  allow write: if get(/databases/$(database)/documents/groups/$(groupId)).data.unidadeSaudeId == request.auth.token.unitId &&
               (request.auth.token.role == 'professional' || request.auth.token.role == 'admin');
}

// ===== GROUP ENROLLMENTS =====
match /groups/{groupId}/enrollments/{enrollmentId} {
  allow read: if exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)) ||
              (request.auth.token.role == 'professional' &&
               get(/databases/$(database)/documents/groups/$(groupId)).data.unidadeSaudeId == request.auth.token.unitId);

  allow create: if request.auth.token.role == 'professional' &&
                get(/databases/$(database)/documents/groups/$(groupId)).data.unidadeSaudeId == request.auth.token.unitId;
}

// ===== NOTIFICATIONS =====
match /groups/{groupId}/notifications/{notificationId} {
  // Notificações: apenas quem está no grupo
  allow read: if exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid));

  // Profissional cria
  allow create: if request.auth.token.role == 'professional' &&
                get(/databases/$(database)/documents/groups/$(groupId)).data.unidadeSaudeId == request.auth.token.unitId;
}

// ===== CONTENT/QUIZZES/NEWS =====
match /quizzes/{quizId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.role == 'admin';
}

match /news/{newsId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.role == 'admin';
}
```

**Implementação:**

```typescript
// src/services/healthUnitService.ts
export async function getHealthUnits() {
  try {
    const snapshot = await getDocs(collection(db, "healthUnits"));
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    if (error.code === "permission-denied") {
      console.error("Sem permissão para acessar healthUnits");
      return [];
    }
    throw error;
  }
}
```

**Verificar:**
- [ ] Listar TODAS as coleções usadas no código (grep por `collection(db,`)
- [ ] Criar regra para cada uma
- [ ] Testar cada serviço com permissões corretas
- [ ] Documentar matriz de permissões

---

# P2: SEGURANÇA CLÍNICA E IA

## P2.1: Gemini API Key no Frontend + Dados Sensíveis

### Problema
Arquivo: `src/components/Dashboard/MoodTracker.tsx`, `vite.config.ts`

```typescript
// ❌ PROBLEMA 1: Chave no env público
const VITE_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Isso entra no bundle JavaScript publicado

// ❌ PROBLEMA 2: Dados clínicos enviados diretamente para Gemini
const result = await model.generateContent(
  `Analisar sentimento e risco: "${userMoodText}"`
);

// Dados do paciente viajam:
// Frontend → Gemini API (Google)
// Sem intermediário, sem criptografia, sem auditoria
```

**Risco:**
- Chave API é pública (fácil de roubar via DevTools)
- Relatórios de saúde mental enviados para Google sem contrato de processamento
- Sem logs de quem acessou
- Google pode treinar modelos com dados (a menos que opte por "data not for training")
- Sem conformidade LGPD

**Solução: Mover para Cloud Function**

```typescript
// functions/src/analyzeMood.ts
import * as functions from "firebase-functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeMood = functions.https.onCall(
  async (data: { moodText: string; tags: string[] }, context) => {
    if (!context.auth) throw new Error("Not authenticated");

    // ✅ Log de acesso (auditoria)
    await logAction({
      userId: context.auth.uid,
      action: "analyze_mood",
      timestamp: new Date(),
    });

    const { moodText, tags } = data;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Você é um assistente de suporte emocional em um sistema de saúde pública.
        
        Paciente relatou:
        - Texto: "${moodText}"
        - Tags: ${tags.join(", ")}
        
        Análise solicitada:
        1. Sentimento (positivo/neutro/negativo)
        2. Sinais de risco (sim/não) - APENAS se texto contiver explicitamente palavras-chave como "morte", "suicídio", "machucar"
        3. Urgência (low/medium/high) - HIGH apenas se risco = sim
        4. Resumo em 1 linha
        5. Sugestão de próximo passo
        
        IMPORTANTE: Isso é para apoiar a decisão profissional, não substituí-la.
        Se houver sinais críticos, retorne: "REFER_TO_PROFESSIONAL"
      `;

      const response = await model.generateContent(prompt);
      const analysis = response.response.text();

      // ✅ Estruturar resposta
      return parseAnalysis(analysis);
    } catch (error) {
      // ❌ NÃO retornar false por padrão
      throw new functions.https.HttpsError("internal", "Analysis failed");
    }
  }
);

function parseAnalysis(text: string) {
  // Parse do response estruturado
  return {
    sentiment: extractSentiment(text),
    riskFlag: extractRisk(text),
    urgencyLevel: extractUrgency(text),
    summary: extractSummary(text),
    suggestion: extractSuggestion(text),
  };
}
```

**Frontend atualizado:**

```typescript
// src/components/Dashboard/MoodTracker.tsx
import { functions } from "firebase/app";
import { httpsCallable } from "firebase/functions";

const analyzeMood = httpsCallable(functions(app), "analyzeMood");

export function MoodTracker() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  async function handleSubmitMood(text: string, tags: string[]) {
    setIsAnalyzing(true);
    try {
      // ✅ Chamada vai para backend, não para Google
      const result = await analyzeMood({ moodText: text, tags });

      // ✅ Se falhar, exibe erro, não assume "sem risco"
      if (!result.data) {
        setAnalysis({
          error: "Não conseguimos analisar. Por favor, contate um profissional.",
          riskFlag: "unknown", // ← NÃO assume false
        });
        return;
      }

      setAnalysis(result.data);

      // ✅ Se risco detectado, mostrar botão visível de ajuda
      if (result.data.riskFlag === "high" || result.data.urgency === "high") {
        showCrisisSupport(); // ← Sempre visível
      }
    } catch (error) {
      setAnalysis({
        error: "Erro ao processar. Precisa de ajuda? Ligue 188 (CVV).",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="mood-tracker">
      {/* Formulário */}
      <form onSubmit={handleSubmitMood}>
        <textarea placeholder="Como você está se sentindo?" />
        <button type="submit" disabled={isAnalyzing}>
          {isAnalyzing ? "Analisando..." : "Enviar"}
        </button>
      </form>

      {/* ✅ SEMPRE visível, independente da IA */}
      <div className="crisis-support">
        <strong>Precisando de ajuda agora?</strong>
        <a href="tel:188">CVV: 188</a>
        <a href="tel:192">SAMU: 192</a>
      </div>

      {/* Resultado da análise */}
      {analysis && (
        <div className={`analysis ${analysis.urgency}`}>
          {analysis.error && <p className="error">{analysis.error}</p>}
          {!analysis.error && (
            <>
              <p>{analysis.summary}</p>
              <p>{analysis.suggestion}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

**Contrato com Google (Privacy):**

```typescript
// functions/.env
GEMINI_API_KEY=xxx
GEMINI_DATA_NOT_FOR_TRAINING=true

// Incluir no contrato:
// - Dados não serão usados para treinamento
// - Dados são sob regime LGPD
// - Retenção máxima: 24 horas
```

**Arquivos a modificar/criar:**
- `functions/src/analyzeMood.ts` — nova Cloud Function
- `src/components/Dashboard/MoodTracker.tsx` — remover Gemini local
- `.env.example` — remover VITE_GEMINI_API_KEY
- `firestore.rules` — adicionar regra para acessar Cloud Functions
- Criar `docs/PRIVACY_AI.md` — documentar fluxo de dados

---

## P2.2: Risco Clínico não Pode ser Gatekeeper da IA

### Problema
Arquivo: `src/services/moodService.ts`

```typescript
// ❌ PROBLEMA: Se IA falhar, fallback assume "sem risco"
async function analyzeMoodWithAI(moodText: string) {
  try {
    const response = await model.generateContent(prompt);
    return {
      sentiment: response.sentiment,
      riskFlag: response.riskFlag, // ← Depende do Gemini
      urgencyLevel: response.urgency,
    };
  } catch (error) {
    // ❌ FALLBACK PERIGOSO
    return {
      sentiment: "unknown",
      riskFlag: false, // ← Assume "sem risco" se falhar
      urgencyLevel: "none",
    };
  }
}
```

**Cenário:**
1. Paciente escreve: "Não aguento mais, quero morrer"
2. Gemini timeout / erro de API
3. Sistema retorna: `riskFlag: false`
4. Profissional nunca vê a mensagem como prioritária
5. Paciente não recebe ajuda

**Solução: Heurística + Palavras-chave locais**

```typescript
// src/services/riskDetection.ts
export class RiskDetectionService {
  // Keywords críticos que não dependem de IA
  private static CRITICAL_KEYWORDS = [
    "suicídio",
    "morrer",
    "pular",
    "veneno",
    "corda",
    "faca",
    "medicamento",
    "overdose",
  ];

  private static HIGH_KEYWORDS = [
    "deprimido",
    "desesperado",
    "dor",
    "sofrer",
    "isolado",
  ];

  /**
   * Detecção local (não depende de IA)
   */
  static detectLocalRisk(text: string): "critical" | "high" | "low" | "none" {
    const lower = text.toLowerCase();

    // ✅ Busca por keywords críticas
    for (const keyword of this.CRITICAL_KEYWORDS) {
      if (lower.includes(keyword)) {
        return "critical";
      }
    }

    // ✅ Busca por keywords altas
    for (const keyword of this.HIGH_KEYWORDS) {
      if (lower.includes(keyword)) {
        return "high";
      }
    }

    return "none";
  }

  /**
   * Análise combinada: IA + Heurística
   */
  static combineAnalysis(
    aiAnalysis: AIAnalysisResult | null,
    localRisk: string
  ) {
    // Se IA falhou, usa detecção local
    if (!aiAnalysis) {
      return {
        riskFlag: localRisk === "critical" || localRisk === "high",
        urgencyLevel: localRisk,
        source: "local_keywords", // ← Para auditoria
        aiAnalysis: null,
      };
    }

    // Se IA retornou low mas local detectou high, prioriza o maior
    const finalRisk = this.MAX_RISK(aiAnalysis.riskFlag, localRisk);

    return {
      riskFlag: finalRisk !== "none",
      urgencyLevel: finalRisk,
      source: "combined", // ← IA + local
      aiAnalysis,
    };
  }

  private static MAX_RISK(aiLevel: string, localLevel: string): string {
    const levels = { none: 0, low: 1, high: 2, critical: 3 };
    return Object.entries(levels).sort((a, b) => b[1] - a[1]).find(
      ([_, v]) => v === Math.max(levels[aiLevel] || 0, levels[localLevel] || 0)
    )?.[0] || "none";
  }
}

// Uso:
export async function analyzeMoodComprehensive(moodText: string) {
  // 1. Detecção local (sempre funciona)
  const localRisk = RiskDetectionService.detectLocalRisk(moodText);

  // 2. Tentar IA (pode falhar)
  let aiAnalysis = null;
  try {
    aiAnalysis = await callAnalyzeMoodFunction(moodText);
  } catch (error) {
    console.warn("IA analysis failed, using local detection", error);
  }

  // 3. Combinar
  const final = RiskDetectionService.combineAnalysis(aiAnalysis, localRisk);

  return final;
}
```

**Botão de ajuda SEMPRE visível:**

```typescript
// src/components/Dashboard/CrisisSupport.tsx
export function CrisisSupport() {
  return (
    <div className="crisis-support-banner">
      <div className="content">
        <strong>Precisando de ajuda agora?</strong>
        <p>Você nunca está sozinho. Ligue:</p>
        <ul>
          <li>
            <a href="tel:188">
              <strong>188</strong> — CVV (Centro de Valorização da Vida)
            </a>
          </li>
          <li>
            <a href="tel:192">
              <strong>192</strong> — SAMU (Emergência Médica)
            </a>
          </li>
          <li>
            <a href="tel:190">
              <strong>190</strong> — Polícia (Se em perigo imediato)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Posicionar:
// - Visível permanentemente na página de mood
// - Não escondido atrás de toggles
// - Estilo destacado (contraste alto, fonte grande)
// - Mobile: sticky no topo
```

**Marcação de "assistência vs. diagnóstico":**

```typescript
// src/components/Dashboard/MoodInsight.tsx
export function MoodInsight({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="mood-insight">
      <p className="disclaimer">
        ⚠️ Esta análise é fornecida como <strong>assistência à decisão</strong>,
        não como diagnóstico clínico.
        <br />
        <strong>Sempre consulte um profissional de saúde.</strong>
      </p>

      <div className="analysis-content">
        <p>
          <strong>Seu relato:</strong> {analysis.summary}
        </p>

        {analysis.urgencyLevel === "high" && (
          <div className="alert alert-high">
            <strong>Sinais de atenção detectados.</strong>
            <p>
              Recomendamos conversar com um profissional de saúde mental
              urgentemente.
            </p>
            <button onClick={() => bookUrgentAppointment()}>
              Agendar consulta urgente
            </button>
          </div>
        )}

        {analysis.source === "local_keywords" && (
          <p className="info">
            (Análise baseada em palavras-chave; IA não disponível no momento)
          </p>
        )}

        <p className="suggestion">{analysis.suggestion}</p>
      </div>
    </div>
  );
}
```

**Arquivos a modificar/criar:**
- `src/services/riskDetection.ts` — nova classe de detecção local
- `src/components/Dashboard/MoodTracker.tsx` — integrar `RiskDetectionService`
- `src/components/Dashboard/CrisisSupport.tsx` — adicionar sempre visível
- `functions/src/analyzeMood.ts` — retornar `source` da análise

---

## P2.3: "Radar de Saúde" Precisa ser Não-diagnóstico

### Problema
Arquivo: `src/components/Dashboard/HealthRadar.tsx`

```typescript
// ❌ PROBLEMA: Apresenta como "risco clínico"
const calculateRisk = (patient) => {
  if (patient.mood < 2 && patient.absenceDays > 7) {
    return "CRITICAL"; // ← Isso é diagnóstico
  }
  if (patient.mood > 4 && patient.absenceDays > 15) {
    return "MONITOR";
  }
};

// Componente exibe como "Risco Clínico"
<HealthRadar riskLevel="CRITICAL" />
```

**Problema:**
- Usuário vê "Risco Crítico" e pode tomar decisões sem profissional
- Heurística não é validada clinicamente
- Pode criar ansiedade ou falsa segurança
- Não é um instrumento de avaliação, apenas padrão de comportamento

**Solução: Renomear e reposicionar**

```typescript
// src/services/engagementTracking.ts
export interface EngagementSignal {
  type: "low_engagement" | "participation_gap" | "behavioral_change";
  labels: string[];
  suggestedReview: string;
  clinicalNote: string;
}

export class EngagementTrackingService {
  /**
   * Não é diagnóstico. É sinal para revisão profissional.
   */
  static detectEngagementSignals(patient: PatientData): EngagementSignal[] {
    const signals: EngagementSignal[] = [];

    // ✅ Renomear: não é "risco", é "sinal de acompanhamento"
    if (patient.recentMood < 2 && patient.sessionAbsenceDays > 7) {
      signals.push({
        type: "low_engagement",
        labels: ["Humor reduzido", "Ausências recentes"],
        suggestedReview: "Verificar bem-estar e barreiras de participação",
        clinicalNote:
          "Sinal para avaliação profissional; não é diagnóstico. Pode indicar desafios na participação.",
      });
    }

    if (patient.recentMood > 4 && patient.sessionAbsenceDays > 15) {
      signals.push({
        type: "participation_gap",
        labels: ["Engajamento reduzido"],
        suggestedReview: "Revisar motivos da ausência",
        clinicalNote:
          "Padrão de presença pode indicar necessidade de revisão do plano de cuidado.",
      });
    }

    return signals;
  }
}
```

**UI refatorada:**

```typescript
// src/components/Dashboard/EngagementReview.tsx
import { EngagementTrackingService } from "@/services/engagementTracking";

export function EngagementReview({ patient }: { patient: Patient }) {
  const signals = EngagementTrackingService.detectEngagementSignals(patient);

  return (
    <div className="engagement-review">
      {/* ✅ Renomear a seção */}
      <h2>Sinais de Acompanhamento</h2>

      {/* ✅ Adicionar disclaimer claro */}
      <div className="disclaimer">
        <p>
          <strong>Não diagnóstico.</strong> Esta seção exibe padrões de
          comportamento que podem ser úteis para a avaliação profissional.
        </p>
        <p>
          Qualquer decisão clínica deve ser feita por profissional autorizado.
        </p>
      </div>

      {signals.length === 0 ? (
        <p className="success">
          ✅ Sem sinais especiais detectados. Continue acompanhando!
        </p>
      ) : (
        <ul className="signals-list">
          {signals.map((signal) => (
            <li key={signal.type} className={`signal signal-${signal.type}`}>
              <div className="signal-header">
                <h3>Prioridade para Revisão: {signal.type}</h3>
                <p className="clinical-note">{signal.clinicalNote}</p>
              </div>
              <div className="signal-labels">
                {signal.labels.map((label) => (
                  <span key={label} className="label">
                    {label}
                  </span>
                ))}
              </div>
              <p className="suggestion">
                <strong>Ação sugerida:</strong> {signal.suggestedReview}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Link para documentação clínica */}
      <a href="/docs/engagement-methodology" className="link-methodology">
        Como interpretamos esses sinais?
      </a>
    </div>
  );
}
```

**Documentação:** Criar `docs/engagement-methodology.md` explicando:
- Qual é a heurística (mood + absência)
- Por que não é diagnóstico
- Como um profissional deve interpretar
- Quais instrumentos validados usar

**Arquivos a modificar/criar:**
- `src/services/engagementTracking.ts` — nova classe não-diagnóstica
- `src/components/Dashboard/EngagementReview.tsx` — UI refatorada
- `docs/engagement-methodology.md` — explicação clara

---

# P3: ENGENHARIA

## P3.1: Build/Lint Instável, 143 Erros, 81 `any`

### Problema
Arquivos encontrados: `lint_output.txt`, `build_log.txt`
```
143 ESLint errors
9 ESLint warnings
81 ocurrências de "any"
TypeScript strict mode ainda com casts
```

**Exemplo:**
```typescript
// ❌ Típico
const result = (data as any).something;

// ❌ Types inconsistentes
type Role = 'professional' | 'patient' | 'admin';
// vs.
type UserRole = 'terapeuta' | 'coordenador' | 'administrador';
```

**Solução: Roadmap de fixação**

```bash
# 1. Audit completo
npm run lint -- --format json > lint-full-report.json
npx tsc --noEmit > type-errors.txt

# 2. Criar tarefa por categoria
## - Duplicidade de types
## - Casts (as any)
## - Missing types
## - Build errors

# 3. Estabelecer "no regressions"
npm run lint -- --max-warnings 0
```

**Exemplo: Consolidar tipos**

```typescript
// src/types/common.ts
export type UserRole = "patient" | "professional" | "admin";
export type Gender = "M" | "F" | "O" | "N"; // Não-binário
export type GroupStatus = "planning" | "active" | "closed";
export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

// ✅ Usar globalmente
import type { UserRole } from "@/types/common";
```

---

## P3.2: Páginas > 40KB (componentes muito grandes)

### Problema
```
PatientDetail.tsx: ~46 KB
GroupManagement.tsx: ~40 KB
ProfessionalDashboard.tsx: ~34 KB
```

**Solução: Quebrar em sub-módulos**

```
src/
├─ pages/
│  └─ PatientDetail.tsx          (componente container)
├─ modules/
│  ├─ patient/
│  │  ├─ PatientHeader.tsx       (< 5 KB)
│  │  ├─ PatientClinicalSummary.tsx
│  │  ├─ PatientMoodPanel.tsx
│  │  ├─ PatientGroups.tsx
│  │  ├─ PatientTimeline.tsx
│  │  └─ PatientActions.tsx
│  └─ group/
│     ├─ GroupHeader.tsx
│     ├─ GroupMembers.tsx
│     ├─ GroupSchedule.tsx
│     └─ GroupSettings.tsx
```

---

# P4: DESIGN E PRODUTO

## P4.1: Design System Inconsistente

### Recomendações
- Consolidar em 3 níveis visuais:
  - **Institucional** (azul SUS) → Admin, listas
  - **Clínico** (neutro + semântica) → Profissional, dados
  - **Bem-estar** (roxo + emoção) → Paciente, jornada
- Reduzir glassmorphism / gradientes
- Implementar modo "alto contraste" real (CSS tokens, não `filter`)
- Aplicar `prefers-reduced-motion` globalmente

---

# ROADMAP DE IMPLEMENTAÇÃO

## Fase 1: Segurança P0 (2-3 semanas)
- [ ] Impedir cadastro autônomo de profissional (aprovação + backend role)
- [ ] Limitar leitura de pacientes/users/chats a membros/profissionais
- [ ] Limpar cache offline na troca de usuário
- [ ] Adicionar regras completas para todas as coleções

## Fase 2: Arquitetura de Dados (2-3 semanas)
- [ ] Unificar users ↔ patients com `patients.userId`
- [ ] Migration script e testes
- [ ] Refatorar serviços (groupService, patientService, etc.)
- [ ] Atualizar DataContext

## Fase 3: IA e Segurança Clínica (2 semanas)
- [ ] Mover Gemini para Cloud Function
- [ ] Implementar RiskDetectionService (local + IA)
- [ ] Adicionar CrisisSupport permanente
- [ ] Renomear Radar → EngagementSignals

## Fase 4: Engenharia (3-4 semanas)
- [ ] Zero lint errors / warnings
- [ ] Eliminar 81 `any` → tipos corretos
- [ ] Quebrar páginas gigantes em sub-módulos
- [ ] Estabilizar CI/CD

## Fase 5: Produto (Ongoing)
- [ ] Design system consolidado
- [ ] Modo alto contraste real
- [ ] Relatórios expandidos
- [ ] Fluxo de encaminhamento
- [ ] Interoperabilidade com e-SUS

---

# CONCLUSÃO

**EloSUS Grupos é um conceito excelente com implementação promissora, mas não pronto para produção.**

**Ao invés de reescrever, faça uma "versão 2 da arquitetura":**

1. **Segurança** (P0) → 2-3 semanas
2. **Dados** (P1) → 2-3 semanas  
3. **Clínica** (P2) → 2 semanas
4. **Engenharia** (P3) → 3-4 semanas
5. **Produto** (P4) → Ongoing

**Depois disso**, você terá uma plataforma realmente robusta, pronta para dados reais de saúde.

---

**Documento preparado para discussão e validação com time de arquitetura e product.**
