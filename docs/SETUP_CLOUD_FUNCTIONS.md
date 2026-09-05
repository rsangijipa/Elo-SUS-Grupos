# Setup de Cloud Functions - EloSUS Grupos

**Objetivo:** Documentar setup, deployment e configuração de Cloud Functions.

---

## 1. Pré-Requisitos

### 1.1 Ferramentas
```bash
# Node.js 18+ (verificar versão)
node --version

# Firebase CLI 12+
npm install -g firebase-tools@latest

# Autenticar no Firebase
firebase login
```

### 1.2 Variáveis de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

```env
# Chave Gemini API (para análise de humor)
GEMINI_API_KEY=sua_chave_aqui

# Para development local
FIREBASE_PROJECT_ID=seu-projeto-dev

# Se usar dados de produção (cuidado!)
# FIRESTORE_EMULATOR_HOST=localhost:8080
```

---

## 2. Estrutura de Cloud Functions

```
functions/
├── src/
│   ├── index.ts                      # Entry point
│   ├── analyzeMood.ts               # Análise de humor (P2.1)
│   ├── requestProfessionalMode.ts   # Solicitar profissional (P0.1)
│   ├── approveProfessional.ts       # Aprovar profissional (P0.1)
│   └── utils/
│       ├── auth.ts                  # Helpers de autenticação
│       ├── audit.ts                 # Logging de auditoria
│       └── validation.ts            # Validações
├── package.json
├── tsconfig.json
└── .env.local                       # Não commit!
```

---

## 3. Instalação e Configuração

### 3.1 Inicializar Cloud Functions (se não existir)

```bash
# Na raiz do projeto
firebase init functions

# Responder às perguntas:
# - Usar TypeScript? → sim
# - ESLint? → sim
# - Install dependencies now? → sim
```

### 3.2 Instalar Dependências

```bash
cd functions

# Dependências principais
npm install \
  firebase-functions \
  firebase-admin \
  @google/generative-ai \
  zod

# Dev dependencies
npm install --save-dev \
  typescript \
  @types/node \
  @types/firebase-functions \
  firebase-functions-test
```

### 3.3 Atualizar `functions/package.json`

```json
{
  "name": "functions",
  "description": "EloSUS Grupos Cloud Functions",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log",
    "test": "jest"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0",
    "@google/generative-ai": "^0.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 3.4 Atualizar `functions/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitAny": true,
    "outDir": "lib",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "compileOnSave": true,
  "include": ["src"]
}
```

---

## 4. Variáveis de Ambiente em Runtime

### 4.1 Configurar no Firebase Console

```bash
# Via CLI
firebase functions:config:set gemini.api_key="sua_chave"

# Verificar
firebase functions:config:get

# Limpar
firebase functions:config:unset gemini.api_key
```

### 4.2 Usar em Função

```typescript
import * as functions from 'firebase-functions';

const apiKey = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY não configurada');
}
```

---

## 5. Desenvolvimento Local

### 5.1 Iniciar Emulator

```bash
# Terminal 1: Iniciar emulators
firebase emulators:start --only functions,firestore

# Terminal 2: Desenvolver
npm run watch
```

### 5.2 Testar Função Localmente

```bash
# Via Firebase Shell
firebase functions:shell

# No shell:
> analyzeMood({moodText: "Estou triste"}, {auth: {uid: "test-user"}})
```

### 5.3 Testar com Cliente

No frontend, apontaré emulator:

```typescript
// src/services/firebase.ts
import { connectFunctionsEmulator } from 'firebase/functions';

if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

---

## 6. Logging e Debugging

### 6.1 Logs Locais

```typescript
console.log('[functionName] Informação');     // Info
console.warn('[functionName] Aviso');         // Warning
console.error('[functionName] Erro');         // Error
```

### 6.2 Logs em Produção

```bash
# Visualizar logs em tempo real
firebase functions:log --follow

# Filtrar por função
firebase functions:log --function=analyzeMood

# Histórico
firebase functions:log --limit 50
```

---

## 7. Deployment

### 7.1 Deploy para Produção

```bash
# Verificar autenticação
firebase auth:list-users --limit 5

# Deploy apenas functions
firebase deploy --only functions

# Deploy específica
firebase deploy --only functions:analyzeMood

# Com verbosidade
firebase deploy --only functions --debug
```

### 7.2 Versioning

Sempre testar em staging antes:

```bash
# Criar ramo de staging
git checkout -b functions/feature-xyz

# Fazer changes
# Testar localmente
# Fazer PR

# Merge e deploy
firebase deploy --only functions
```

---

## 8. Monitoramento e Alertas

### 8.1 Google Cloud Console

1. Ir para [Cloud Console](https://console.cloud.google.com/)
2. Selecionar seu projeto
3. Ir para **Cloud Functions**
4. Ver metrics de:
   - Execuções
   - Erros
   - Latência
   - Memória

### 8.2 Configurar Alertas

No Cloud Console:
1. Monitoring → Alert Policies
2. Create Policy
3. Selecionar métrica: `cloudfunctions.googleapis.com/function/execution_count`
4. Configurar threshold e notificação

---

## 9. Segurança

### 9.1 IAM Roles

```bash
# Dar role a usuário
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:email@example.com" \
  --role="roles/cloudfunctions.developer"
```

### 9.2 Secrets Management

```bash
# Usar Secret Manager para sensíveis
gcloud secrets create GEMINI_API_KEY --data-file=-

# Atribuir acesso
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 9.3 Rate Limiting

Implementado nas Cloud Functions:

```typescript
// Limitar a 10 req/minuto por usuário
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(userId: string, limit = 10): boolean {
  const now = Date.now();
  const minuteAgo = now - 60000;

  const timestamps = rateLimitMap.get(userId) || [];
  const recentReqs = timestamps.filter(t => t > minuteAgo);

  if (recentReqs.length >= limit) {
    return false; // Bloqueado
  }

  rateLimitMap.set(userId, [...recentReqs, now]);
  return true; // Permitido
}
```

---

## 10. Troubleshooting

### Erro: "Permission denied"
```bash
# Verificar autenticação
firebase login

# Verificar projeto
firebase projects:list
firebase use PROJECT_ID
```

### Erro: "Function not found"
```bash
# Verificar se foi deployada
firebase functions:list

# Verificar logs
firebase functions:log
```

### Erro: "GEMINI_API_KEY not configured"
```bash
# Verificar variável
firebase functions:config:get

# Set novamente
firebase functions:config:set gemini.api_key="valor"

# Redeploy
firebase deploy --only functions
```

### Timeout
```typescript
// Aumentar timeout (máx 540s)
export const analyzeMood = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onCall(async (data, context) => {
    // ...
  });
```

---

## 11. Checklist de Deployment

### Antes de Fazer Deploy

- [ ] Testes locais passando
- [ ] Sem erros de type (`tsc --noEmit`)
- [ ] Sem logs sensíveis
- [ ] Variáveis de ambiente configuradas
- [ ] Rate limiting implementado
- [ ] Erros tratados com mensagens seguras
- [ ] Auditoria implementada

### Processo de Deploy

- [ ] Create feature branch
- [ ] Implementar + testar localmente
- [ ] Create PR com descrição
- [ ] Code review
- [ ] Merge para main
- [ ] `firebase deploy --only functions`
- [ ] Verificar logs: `firebase functions:log`
- [ ] Testar em produção com dados reais

### Pós-Deployment

- [ ] Monitorar erros
- [ ] Verificar performance
- [ ] Testar com usuários reais
- [ ] Documentar mudanças

---

## 12. Recursos

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Google Cloud Functions](https://cloud.google.com/functions/docs)
- [Gemini API](https://ai.google.dev/tutorials/python_quickstart)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
