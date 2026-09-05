/**
 * Tipos consolidados para Paciente
 * P1.1: Arquitetura unificada patients/users
 *
 * Princípio:
 * - users/{uid}: Autenticação + perfil mínimo
 * - patients/{patientId}: Dados assistenciais + clínicos
 * - patients/{patientId}.userId = uid (vínculo explícito)
 */

import { z } from 'zod';
import type { Address, EmergencyContact, FirestoreDate, PatientStatus, Gender } from './common';

/**
 * Status clínico de um paciente
 */
export type ClinicaStatus = 'active' | 'waiting' | 'inactive' | 'discharged' | 'dropout' | 'shared_care';

/**
 * Rastreabilidade de mudanças de status
 */
export interface StatusTransition {
  from: PatientStatus;
  to: PatientStatus;
  reason?: string;
  date: Date;
  recordedBy: string; // UID do profissional
}

/**
 * Dados de saúde mental/screening
 */
export interface HealthScreening {
  type: 'depression' | 'anxiety' | 'suicide_risk' | 'substance_use' | 'other';
  instrumentName: string; // Ex: "PHQ-9", "GAD-7"
  score: number;
  maxScore: number;
  interpretation: string;
  date: Date;
  recordedBy: string; // UID do profissional
}

/**
 * Diagnóstico
 */
export interface Diagnosis {
  cidCode: string; // CID-10 ou CID-11
  description: string;
  primary: boolean;
  date: Date;
  status: 'active' | 'resolved' | 'suspected';
}

/**
 * Medicação
 */
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  indication: string;
  notes?: string;
}

/**
 * Entrada de humor (sub-coleção)
 */
export interface MoodEntry {
  id: string;
  date: Date;
  mood: number; // 1-10 ou 1-5
  tags: string[];
  text: string;
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
    riskFlag: boolean;
    urgencyLevel: 'none' | 'low' | 'high' | 'critical';
    summary: string;
    suggestion: string;
  };
  reviewed: boolean;
  reviewedBy?: string; // UID do profissional que revisou
  timestamp: Date;
}

/**
 * Presença em uma sessão (sub-coleção)
 */
export interface Attendance {
  id: string;
  sessionId: string;
  groupId: string;
  date: Date;
  status: 'present' | 'absent' | 'justified_absence' | 'excused';
  justification?: string;
  recordedBy: string;
  recordedAt: Date;
}

/**
 * Nota clínica (sub-coleção)
 */
export interface ClinicalNote {
  id: string;
  date: Date;
  authorId: string; // UID do profissional
  type: 'assessment' | 'progress' | 'plan' | 'observation' | 'alert';
  text: string;
  visibility: 'private' | 'team'; // private = só autor + admin; team = toda equipe
  archived: boolean;
  timestamp: Date;
}

/**
 * Schema Zod para validação
 */
export const MoodEntrySchema = z.object({
  mood: z.number().min(1).max(10),
  tags: z.array(z.string()),
  text: z.string().max(5000),
});

export const DiagnosisSchema = z.object({
  cidCode: z.string().min(1),
  description: z.string(),
  primary: z.boolean(),
  date: z.date(),
  status: z.enum(['active', 'resolved', 'suspected']),
});

export const MedicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string(),
  frequency: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  indication: z.string(),
  notes: z.string().optional(),
});

export const HealthScreeningSchema = z.object({
  type: z.enum(['depression', 'anxiety', 'suicide_risk', 'substance_use', 'other']),
  instrumentName: z.string(),
  score: z.number().nonnegative(),
  maxScore: z.number().positive(),
  interpretation: z.string(),
  date: z.date(),
  recordedBy: z.string(),
});

/**
 * Documento Principal: Patient (sub-coleção é patients/{patientId})
 */
export interface Patient {
  // IDs e Vínculo
  patientId: string; // Auto-gerado (UUID)
  userId: string; // ✅ Vínculo explícito com users/{uid}

  // Dados Pessoais
  name: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
  cpf: string; // Criptografado em produção
  cns?: string; // Cartão Nacional de Saúde

  // Endereço e Contato
  address: Address;
  phone: string;
  emergencyContact: EmergencyContact;

  // Contexto de Saúde
  unidadeSaudeId: string; // Unidade de referência
  status: PatientStatus;
  statusHistory: StatusTransition[];

  // Dados Clínicos
  clinicalData: {
    primaryDiagnosis?: string;
    diagnoses: Diagnosis[];
    comorbidities: string[]; // CID codes
    currentMedications: Medication[];
    allergies: string[];
    specialNotes?: string;
  };

  // Screenings de Saúde
  screenings: HealthScreening[];

  // Grupos e Engajamento
  enrolledGroups: {
    groupId: string;
    joinDate: Date;
    status: 'active' | 'inactive' | 'discharged';
  }[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // UID do profissional que criou
  lastModifiedBy: string; // UID do último que modificou

  // Auditoria
  isActive: boolean;
  lastActivityDate: Date;
}

/**
 * Schema Zod para Patient
 */
export const PatientSchema = z.object({
  patientId: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  dateOfBirth: z.date(),
  gender: z.enum(['M', 'F', 'O', 'N']),
  cpf: z.string(),
  cns: z.string().optional(),
  phone: z.string(),
  unidadeSaudeId: z.string(),
  status: z.enum(['active', 'waiting', 'inactive', 'discharged', 'dropout', 'shared_care']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PatientFormData = z.infer<typeof PatientSchema>;
