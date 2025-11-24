import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupDevEnvironment } from './services/devSeed';

// Run seeding in development
try {
  setupDevEnvironment();
} catch (error) {
  console.error("Failed to run dev seeding:", error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)