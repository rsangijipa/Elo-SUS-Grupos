/**
 * Tipos consolidados e únicos de referência no projeto
 * Elimina duplicidade e padroniza nomenclatura
 */

/**
 * Role do usuário no sistema
 * - patient: Paciente em atendimento
 * - professional: Profissional de saúde
 * - admin: Administrador de unidade/municipal
 */
export type UserRole = 'patient' | 'professional' | 'admin';

/**
 * Status de um usuário profissional no sistema
 */
export type ProfessionalStatus = 'pending_approval' | 'approved' | 'suspended' | 'inactive';

/**
 * Status de um paciente no sistema
 */
export type PatientStatus = 'active' | 'waiting' | 'inactive' | 'discharged' | 'dropout' | 'shared_care';

/**
 * Tipo de gênero (inclusivo)
 */
export type Gender = 'M' | 'F' | 'O' | 'N';

/**
 * Status de um grupo
 */
export type GroupStatus = 'planning' | 'active' | 'paused' | 'closed' | 'completed';

/**
 * Status de um agendamento
 */
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

/**
 * Urgência de um sinal de acompanhamento
 */
export type UrgencyLevel = 'none' | 'low' | 'high' | 'critical' | 'unknown';

/**
 * Tipo de risco detectado
 */
export type RiskType = 'none' | 'low_engagement' | 'behavioral_change' | 'participation_gap' | 'crisis_indicator';

/**
 * Timestamp do Firestore
 */
export type FirestoreTimestamp = {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
};

/**
 * Data no Firestore (pode ser Date, Timestamp ou string ISO)
 */
export type FirestoreDate = Date | FirestoreTimestamp | string | null;

/**
 * Resultado de análise de sentimento/risco (ex: IA)
 */
export interface MoodAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  riskFlag: boolean;
  urgencyLevel: UrgencyLevel;
  summary: string;
  suggestion: string;
  source: 'ai' | 'local_keywords' | 'combined' | 'error';
  timestamp: Date;
}

/**
 * Tipo para endereço
 */
export interface Address {
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

/**
 * Contato de emergência
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

/**
 * Dado de auditoria
 */
export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  changes?: Record<string, { before: unknown; after: unknown }>;
  ipAddress?: string;
  userAgent?: string;
}
