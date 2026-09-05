/**
 * Firebase Cloud Functions para EloSUS Grupos
 *
 * Deploy: firebase deploy --only functions
 */

import * as admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp();

// Importar e exportar todas as functions
export * from './analyzeMood';
export * from './approveProfessional';
export * from './requestProfessionalMode';
