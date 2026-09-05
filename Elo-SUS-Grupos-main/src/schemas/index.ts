import { z } from 'zod';
import type { GroupProtocol } from '../types/group';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const isValidCPF = (value: string) => {
    const cpf = onlyDigits(value);

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }

    const calculateDigit = (base: string, factor: number) => {
        let total = 0;
        for (const digit of base) {
            total += Number(digit) * factor--;
        }
        const remainder = total % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    const digit1 = calculateDigit(cpf.slice(0, 9), 10);
    const digit2 = calculateDigit(cpf.slice(0, 10), 11);

    return digit1 === Number(cpf[9]) && digit2 === Number(cpf[10]);
};

const isValidBRPhone = (value: string) => {
    const digits = onlyDigits(value);
    return digits.length === 10 || digits.length === 11;
};

const isValidCNS = (value: string) => {
    const digits = onlyDigits(value);
    return digits.length === 15;
};

const parseBirthDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
};

const roleSchema = z.enum(['professional', 'patient', 'admin']);
const protocolSchema = z.enum(['STANDARD', 'TABAGISMO', 'GESTANTE', 'ANSIEDADE_DEPRESSAO'] as [GroupProtocol, ...GroupProtocol[]]);

export const PatientSchema = z.object({
    name: z.string().trim().min(3, 'Informe o nome completo.'),
    birthDate: z.string().min(1, 'Informe a data de nascimento.').refine((value) => {
        const birthDate = parseBirthDate(value);
        if (!birthDate) {
            return false;
        }

        const now = new Date();
        if (birthDate > now) {
            return false;
        }

        const age = now.getFullYear() - birthDate.getFullYear() - (now < new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
        return age >= 0 && age <= 120;
    }, 'Informe uma data valida entre 0 e 120 anos.'),
    phone: z.string().min(1, 'Informe o telefone.').refine(isValidBRPhone, 'Informe um telefone brasileiro valido.'),
    cns: z.string().min(1, 'Informe o CNS.').refine(isValidCNS, 'O CNS deve ter 15 digitos.'),
    cpf: z.string().optional().or(z.literal('')).refine((value) => !value || isValidCPF(value), 'CPF invalido.'),
    motherName: z.string().trim().min(3, 'Informe o nome da mae.'),
    sexo: z.enum(['M', 'F', 'Outro']),
    status: z.enum(['active', 'waiting', 'inactive', 'discharged', 'dropout']),
    neighborhood: z.string().trim().optional().or(z.literal('')),
    street: z.string().trim().optional().or(z.literal('')),
    number: z.string().trim().optional().or(z.literal('')),
    complement: z.string().trim().optional().or(z.literal('')),
    city: z.string().trim().optional().or(z.literal('')),
    state: z.string().trim().max(2, 'UF invalida.').optional().or(z.literal('')),
    zipCode: z.string().trim().optional().or(z.literal('')),
    originUnit: z.string().trim().optional().or(z.literal('')),
    address: z.string().trim().optional().or(z.literal('')),
    unidadeSaudeId: z.string().optional().or(z.literal('')),
    nomeResponsavel: z.string().optional().or(z.literal('')),
    whatsappResponsavel: z.string().optional().or(z.literal('')),
    observacoes: z.string().optional().or(z.literal(''))
});

export const GroupSchema = z.object({
    name: z.string().trim().min(3, 'Informe o nome do grupo.'),
    description: z.string().trim().min(3, 'Informe a descricao do grupo.'),
    schedule: z.string().trim().min(3, 'Informe o horario do grupo.'),
    room: z.string().trim().min(1, 'Informe o local ou sala.'),
    protocol: protocolSchema,
    maxParticipants: z.coerce.number().min(1, 'Minimo de 1 participante.').max(50, 'Maximo de 50 participantes.')
});

export const LoginSchema = z.object({
    email: z.string().trim().email('Digite um e-mail valido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.')
});

export const RegisterSchema = LoginSchema.extend({
    name: z.string().trim().min(3, 'Informe seu nome completo.'),
    confirmPassword: z.string().min(6, 'Confirme sua senha.'),
    role: roleSchema,
    cpf: z.string().optional().or(z.literal('')).refine((value) => !value || isValidCPF(value), 'CPF invalido.'),
    crp: z.string().optional().or(z.literal('')),
    cns: z.string().optional().or(z.literal(''))
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: 'As senhas nao coincidem.'
        });
    }

    if (data.role === 'professional' && !data.crp?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['crp'],
            message: 'Informe o registro profissional.'
        });
    }

    if (data.role === 'patient') {
        if (!data.cns?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['cns'],
                message: 'Informe o CNS.'
            });
        } else if (!isValidCNS(data.cns)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['cns'],
                message: 'O CNS deve ter 15 digitos.'
            });
        }
    }
});

export type PatientFormValues = z.infer<typeof PatientSchema>;
export type GroupFormValues = z.infer<typeof GroupSchema>;
export type LoginFormValues = z.infer<typeof LoginSchema>;
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
