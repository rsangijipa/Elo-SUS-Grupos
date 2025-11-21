# Elo SUS Grupos

Sistema de Gestão de Grupos Terapêuticos e Educativos para Unidades Básicas de Saúde (UBS).

## 📋 Sobre o Projeto

O **Elo SUS Grupos** é uma aplicação web desenvolvida para facilitar o gerenciamento de grupos (tabagismo, saúde mental, gestantes, etc.) nas Unidades Básicas de Saúde. O sistema permite que terapeutas e coordenadores organizem sessões, gerenciem participantes, registrem presenças e acompanhem indicadores de desempenho.

## ✨ Funcionalidades Principais

- **Gestão de Grupos**: Criação e edição de grupos com campos dinâmicos (título, tipo, periodicidade, horários).
- **Participantes**: Inscrição de pacientes, lista de espera e histórico.
- **Sessões**: Geração automática de cronogramas, registro de presença e observações.
- **Dashboard**: Visão geral com indicadores (KPIs), próximas sessões e gráficos de distribuição.
- **Perfis de Acesso**:
  - **Terapeuta**: Acesso aos seus grupos e sessões.
  - **Coordenador/Admin**: Visão global da unidade e relatórios.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## 🛠️ Configuração e Instalação

1. **Clone o repositório**:

    ```bash
    git clone https://github.com/seu-usuario/elosus-grupos.git
    cd elosus-grupos
    ```

2. **Instale as dependências**:

    ```bash
    npm install
    ```

3. **Configure o Firebase**:
    - Crie um projeto no Firebase Console.
    - Habilite Authentication e Firestore.
    - Crie um arquivo `.env` na raiz do projeto com suas credenciais:

      ```env
      VITE_FIREBASE_API_KEY=sua_api_key
      VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
      VITE_FIREBASE_PROJECT_ID=seu_project_id
      VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
      VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
      VITE_FIREBASE_APP_ID=seu_app_id
      ```

4. **Execute o projeto**:

    ```bash
    npm run dev
    ```

## 📂 Estrutura do Projeto

- `/src/components`: Componentes reutilizáveis (Layout, ProtectedRoute).
- `/src/pages`: Páginas da aplicação (Dashboard, Grupos, Login).
- `/src/services`: Serviços de integração com Firebase.
- `/src/contexts`: Contextos globais (AuthContext).
- `/src/types`: Definições de tipos TypeScript.
- `/src/utils`: Utilitários e scripts (Seed Data).

## 📄 Licença

Este projeto está sob a licença MIT.
