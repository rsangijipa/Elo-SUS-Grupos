/**
 * Gerenciador de armazenamento seguro para dados clínicos
 * 
 * Responsável por:
 * - Limpar dados clinicamente sensíveis ao fazer logout
 * - Desabilitar cache de dados de pacientes em modo compartilhado
 * - Garantir conformidade com regulamentações de privacidade
 */

import toast from 'react-hot-toast';

export class SecureStorageManager {
  /**
   * Dados clínicos que devem ser removidos ao fazer logout
   */
  private static readonly CLINICAL_DATA_KEYS = [
    'patients',
    'mood_logs',
    'screenings',
    'groups',
    'appointments',
    'referrals',
    'clinical_notes',
    'health_records',
    'anamnesis',
  ];

  /**
   * Nomes de cache do Service Worker que contêm dados clínicos
   */
  private static readonly CLINICAL_CACHE_NAMES = ['clinical-data', 'clinical-cache', 'firestore-cache'];

  /**
   * Limpa todos os dados clinicamente sensíveis ao fazer logout
   * Deve ser chamado em:
   * - logout()
   * - troca de usuário
   * - remoção de sessions compartilhadas
   */
  static async clearClinicalData(): Promise<void> {
    console.info('[SecureStorageManager] Iniciando limpeza de dados clínicos...');

    try {
      // 1. Limpar IndexedDB do Firebase (sincronização offline)
      await this.clearFirestoreIndexedDB();

      // 2. Limpar localStorage
      await this.clearLocalStorage();

      // 3. Limpar Service Worker cache
      await this.clearServiceWorkerCache();

      // 4. Notificar Service Worker
      await this.notifyServiceWorker();

      console.info('[SecureStorageManager] Limpeza concluída com sucesso');
    } catch (error) {
      console.error('[SecureStorageManager] Erro durante limpeza:', error);
      // Não falhar o logout por causa de erro na limpeza
      toast.error('Aviso: Alguns dados podem ainda estar em cache local');
    }
  }

  /**
   * Limpa bases de dados IndexedDB do Firebase
   */
  private static async clearFirestoreIndexedDB(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('[SecureStorageManager] IndexedDB não disponível');
      return;
    }

    try {
      const dbs = await indexedDB.databases?.();
      if (!dbs) return;

      for (const db of dbs) {
        // Firestore usa nomes como "firestore-db", "firebase_db", etc
        if (
          db.name?.toLowerCase().includes('firestore') ||
          db.name?.toLowerCase().includes('firebase') ||
          db.name?.toLowerCase().includes('clinical')
        ) {
          console.info(`[SecureStorageManager] Deletando IndexedDB: ${db.name}`);
          indexedDB.deleteDatabase(db.name!);
        }
      }
    } catch (error) {
      console.warn('[SecureStorageManager] Erro ao limpar IndexedDB:', error);
    }
  }

  /**
   * Limpa localStorage de dados clínicos
   */
  private static clearLocalStorage(): void {
    for (const key of this.CLINICAL_DATA_KEYS) {
      try {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
        localStorage.removeItem(`${key}_metadata`);
      } catch (error) {
        console.warn(`[SecureStorageManager] Erro ao remover localStorage[${key}]:`, error);
      }
    }

    // Limpar também padrões com wildcards
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (
        key.includes('clinical') ||
        key.includes('patient') ||
        key.includes('mood') ||
        key.includes('appointment') ||
        key.includes('referral') ||
        key.includes('screening')
      ) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`[SecureStorageManager] Erro ao remover localStorage[${key}]`, error);
        }
      }
    }
  }

  /**
   * Limpa cache do Service Worker
   */
  private static async clearServiceWorkerCache(): Promise<void> {
    if (!('caches' in window)) {
      console.warn('[SecureStorageManager] Service Worker cache não disponível');
      return;
    }

    try {
      const cacheNames = await caches.keys();

      for (const name of cacheNames) {
        // Verificar se é cache clínico ou genérico
        const isClinicaltCache =
          this.CLINICAL_CACHE_NAMES.some((clinical) => name.toLowerCase().includes(clinical)) ||
          name.toLowerCase().includes('firestore') ||
          name.toLowerCase().includes('firebase');

        if (isClinicaltCache) {
          console.info(`[SecureStorageManager] Deletando cache: ${name}`);
          await caches.delete(name);
        }
      }
    } catch (error) {
      console.warn('[SecureStorageManager] Erro ao limpar caches:', error);
    }
  }

  /**
   * Notifica o Service Worker sobre logout
   */
  private static async notifyServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if (registration.active) {
        registration.active.postMessage({
          type: 'CLEAR_CLINICAL_CACHE',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn('[SecureStorageManager] Erro ao notificar Service Worker:', error);
    }
  }

  /**
   * Ativa modo "shared device" (computador compartilhado)
   * Em modo compartilhado:
   * - Sem persistência offline de dados clínicos
   * - Cache agressivo ao fazer logout
   * - Avisos de segurança
   */
  static async enableSharedDeviceMode(): Promise<void> {
    console.warn('[SecureStorageManager] Ativando modo computador compartilhado');

    try {
      // Desabilitar persistência local
      localStorage.setItem('_shared_device_mode', 'true');

      // Limpar dados existentes
      await this.clearClinicalData();

      toast.success('Modo computador compartilhado ativado. Seus dados não serão salvos localmente.');
    } catch (error) {
      console.error('[SecureStorageManager] Erro ao ativar shared device mode:', error);
    }
  }

  /**
   * Desativa modo "shared device"
   */
  static disableSharedDeviceMode(): void {
    localStorage.removeItem('_shared_device_mode');
  }

  /**
   * Verifica se está em modo computador compartilhado
   */
  static isSharedDeviceMode(): boolean {
    return localStorage.getItem('_shared_device_mode') === 'true';
  }

  /**
   * Cria backup encriptado de dados (futuro)
   * Pode ser usado para sincronizar entre devices de forma segura
   */
  static async createEncryptedBackup(): Promise<string> {
    // TODO: Implementar com crypto API do navegador
    throw new Error('Backup encriptado ainda não implementado');
  }

  /**
   * Restaura dados de backup encriptado (futuro)
   */
  static async restoreFromEncryptedBackup(backup: string): Promise<void> {
    // TODO: Implementar com crypto API do navegador
    throw new Error('Restauração de backup ainda não implementada');
  }
}
