import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import type { Appointment } from '../types/appointment';
import type { Group } from '../types/group';
import type { Patient } from '../types/patient';
import { COLLECTIONS } from '../constants/collections';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { appointmentService } from '../services/appointmentService';
import { db } from '../services/firebase';
import { groupService } from '../services/groupService';
import { patientService } from '../services/patientService';

interface DataContextType {
    groups: Group[];
    patients: Patient[];
    appointments: Appointment[];
    loading: boolean;
    isInitialized: boolean;
    fetchGroups: () => Promise<void>;
    fetchPatients: () => Promise<void>;
    fetchAppointments: () => Promise<void>;
    addGroup: (group: Omit<Group, 'id'>) => Promise<void>;
    addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
    updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [groups, setGroups] = useState<Group[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const userUnitId = user?.unidadeSaudeId && user.unidadeSaudeId !== 'all'
        ? user.unidadeSaudeId
        : undefined;

    const fetchGroups = async () => {
        const data = await groupService.getAll(userUnitId);
        setGroups(data);
    };

    const fetchPatients = async () => {
        const data = await patientService.getAll(userUnitId);
        setPatients(data);
    };

    const fetchAppointments = async () => {
        const data = await appointmentService.getAll();
        setAppointments(data);
    };

    const refreshData = async () => {
        await Promise.all([fetchGroups(), fetchPatients(), fetchAppointments()]);
    };

    useEffect(() => {
        if (!user) {
            setGroups([]);
            setPatients([]);
            setAppointments([]);
            setLoading(false);
            setIsInitialized(false);
            return;
        }

        setLoading(true);
        setIsInitialized(false);

        const initialLoads = {
            groups: false,
            patients: false,
            appointments: false
        };

        const markInitialized = (key: keyof typeof initialLoads) => {
            initialLoads[key] = true;
            if (Object.values(initialLoads).every(Boolean)) {
                setLoading(false);
                setIsInitialized(true);
            }
        };

        const handleListenerError = (message: string) => {
            setLoading(false);
            addNotification({ type: 'alert', title: 'Erro', message });
        };

        const groupsQuery = userUnitId
            ? query(collection(db, COLLECTIONS.GROUPS), where('unidadeSaudeId', '==', userUnitId))
            : collection(db, COLLECTIONS.GROUPS);

        const patientsQuery = userUnitId
            ? query(collection(db, COLLECTIONS.PATIENTS), where('unidadeSaudeId', '==', userUnitId))
            : query(collection(db, COLLECTIONS.PATIENTS), where('role', '==', 'patient'));

        const appointmentsQuery = user.role === 'patient'
            ? query(collection(db, COLLECTIONS.APPOINTMENTS), where('patientId', '==', user.id), orderBy('date', 'asc'))
            : query(collection(db, COLLECTIONS.APPOINTMENTS), orderBy('date', 'asc'));

        const unsubscribeGroups = onSnapshot(groupsQuery, (snapshot) => {
            setGroups(snapshot.docs.map((docSnapshot) => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
            } as Group)));
            markInitialized('groups');
        }, () => handleListenerError('Falha ao sincronizar grupos.'));

        const unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
            setPatients(snapshot.docs.map((docSnapshot) => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
            } as Patient)));
            markInitialized('patients');
        }, () => handleListenerError('Falha ao sincronizar pacientes.'));

        const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
            setAppointments(snapshot.docs.map((docSnapshot) => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
            } as Appointment)));
            markInitialized('appointments');
        }, () => handleListenerError('Falha ao sincronizar agendamentos.'));

        return () => {
            unsubscribeGroups();
            unsubscribePatients();
            unsubscribeAppointments();
        };
    }, [addNotification, user, userUnitId]);

    const addGroup = async (groupData: Omit<Group, 'id'>) => {
        await groupService.create(groupData);
        addNotification({
            type: 'success',
            title: 'Grupo criado',
            message: 'O grupo foi criado com sucesso.'
        });
    };

    const addPatient = async (patientData: Omit<Patient, 'id'>) => {
        await patientService.create(patientData);
        addNotification({
            type: 'success',
            title: 'Paciente cadastrado',
            message: 'O paciente foi cadastrado com sucesso.'
        });
    };

    const updatePatient = async (id: string, data: Partial<Patient>) => {
        await patientService.update(id, data);
        addNotification({
            type: 'success',
            title: 'Paciente atualizado',
            message: 'Os dados do paciente foram atualizados.'
        });
    };

    const deletePatient = async (id: string) => {
        await patientService.delete(id);
        addNotification({
            type: 'success',
            title: 'Paciente removido',
            message: 'O paciente foi removido com sucesso.'
        });
    };

    const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        await appointmentService.create(appointmentData);
        addNotification({
            type: 'success',
            title: 'Agendamento criado',
            message: 'O agendamento foi salvo com sucesso.'
        });
    };

    const value = useMemo(() => ({
        groups,
        patients,
        appointments,
        loading,
        isInitialized,
        fetchGroups,
        fetchPatients,
        fetchAppointments,
        addGroup,
        addPatient,
        updatePatient,
        deletePatient,
        addAppointment,
        refreshData
    }), [appointments, groups, isInitialized, loading, patients]);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
