import React, { createContext, useContext, useState, useEffect } from 'react';
import { Group } from '../types/group';
import { Patient } from '../types/patient';
import { Appointment } from '../types/appointment';
import { useAuth } from './AuthContext';
import { groupService } from '../services/groupService';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { useNotifications } from './NotificationContext';

interface DataContextType {
    groups: Group[];
    patients: Patient[];
    appointments: Appointment[];
    loading: boolean;
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
    const [loading, setLoading] = useState(false);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await groupService.getAll();
            setGroups(data);
        } catch (error) {
            console.error('Error loading groups:', error);
            addNotification({ type: 'alert', title: 'Erro', message: 'Falha ao carregar grupos.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const data = await patientService.getAll();
            setPatients(data);
        } catch (error) {
            console.error('Error loading patients:', error);
            addNotification({ type: 'alert', title: 'Erro', message: 'Falha ao carregar pacientes.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const data = await appointmentService.getAll();
            setAppointments(data);
        } catch (error) {
            console.error('Error loading appointments:', error);
            addNotification({ type: 'alert', title: 'Erro', message: 'Falha ao carregar agendamentos.' });
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        await Promise.all([fetchGroups(), fetchPatients(), fetchAppointments()]);
    };

    const addGroup = async (groupData: Omit<Group, 'id'>) => {
        try {
            await groupService.create(groupData);
            await fetchGroups();
            addNotification({
                type: 'success',
                title: 'Grupo criado',
                message: 'O grupo foi criado com sucesso.'
            });
        } catch (error) {
            console.error('Error adding group:', error);
            throw error;
        }
    };

    const addPatient = async (patientData: Omit<Patient, 'id'>) => {
        try {
            await patientService.create(patientData);
            await fetchPatients();
            addNotification({
                type: 'success',
                title: 'Paciente cadastrado',
                message: 'O paciente foi cadastrado com sucesso.'
            });
        } catch (error) {
            console.error('Error adding patient:', error);
            throw error;
        }
    };

    const updatePatient = async (id: string, data: Partial<Patient>) => {
        try {
            await patientService.update(id, data);
            await fetchPatients();
            addNotification({
                type: 'success',
                title: 'Paciente atualizado',
                message: 'Os dados do paciente foram atualizados.'
            });
        } catch (error) {
            console.error('Error updating patient:', error);
            throw error;
        }
    };

    const deletePatient = async (id: string) => {
        try {
            await patientService.delete(id);
            await fetchPatients();
            addNotification({
                type: 'success',
                title: 'Paciente removido',
                message: 'O paciente foi removido com sucesso.'
            });
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    };

    const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        try {
            await appointmentService.create(appointmentData);
            await fetchAppointments();
            addNotification({
                type: 'success',
                title: 'Agendamento criado',
                message: 'O agendamento foi salvo com sucesso.'
            });
        } catch (error) {
            console.error('Error adding appointment:', error);
            throw error;
        }
    };

    return (
        <DataContext.Provider value={{
            groups,
            patients,
            appointments,
            loading,
            fetchGroups,
            fetchPatients,
            fetchAppointments,
            addGroup,
            addPatient,
            updatePatient,
            deletePatient,
            addAppointment,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
