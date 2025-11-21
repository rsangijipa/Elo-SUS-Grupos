# EloSUS Grupos

Aplicação web para gestão de grupos terapêuticos no SUS (Sistema Único de Saúde), focada em padronização, qualidade clínica e indicadores de gestão.

## 🚀 Tecnologias

- **Frontend**: React + Vite + TypeScript
- **Estilização**: Tailwind CSS (Inspirado no gov.br)
- **Backend**: Firebase (Auth, Firestore)
- **Ícones**: Lucide React
- **Gráficos**: Recharts (preparado para uso)

## 🛠️ Configuração

1. **Instalar dependências**:

   ```bash
   npm install
   ```

2. **Configurar Firebase**:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
   - Habilite **Authentication** (Email/Password).
   - Habilite **Firestore Database**.
   - Copie as credenciais do projeto.
   - Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example` ou `.env.local`) e preencha as variáveis:

     ```env
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     VITE_FIREBASE_PROJECT_ID=...
     ...
     ```

3. **Rodar o projeto**:

   ```bash
   npm run dev
   ```

## 📂 Estrutura do Projeto

- `/src/components`: Componentes reutilizáveis e Layouts (Sidebar, Header).
- `/src/pages`: Telas principais (Dashboard, Pacientes, Grupos, Agenda).
- `/src/services`: Camada de comunicação com o Firebase e integrações.
- `/src/contexts`: Gerenciamento de estado global (AuthContext).
- `/src/types`: Definições de tipos TypeScript (User, Patient, Group, Session).
- `/src/utils`: Utilitários e script de Seed Data.

## 🔐 Segurança

As regras de segurança do Firestore estão definidas em `firestore.rules`. Elas garantem que apenas usuários autenticados possam acessar os dados, com restrições adicionais baseadas no papel do usuário (terapeuta, coordenador, administrador).

## 🧪 Dados de Demonstração

Para popular o banco de dados com dados de teste:

1. Faça login na aplicação.
2. No Dashboard, clique no botão "Seed Data" no canto superior direito.
3. Isso criará unidades de saúde, pacientes e grupos de exemplo.

## 📱 Funcionalidades Principais

- **Gestão de Pacientes**: Cadastro completo com dados do CNS e responsáveis.
- **Grupos Terapêuticos**: Criação de grupos com campos dinâmicos por tipo (Tabagismo, Gestantes, etc.).
- **Agenda**: Visualização de sessões e controle de presença.
- **Notificações**: Integração simulada com WhatsApp para lembretes.
