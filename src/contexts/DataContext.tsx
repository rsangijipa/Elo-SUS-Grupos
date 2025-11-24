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

    useEffect(() => {
        if (user) {
            loadData();
        } else {
            setGroups([]);
            setPatients([]);
            setAppointments([]);
            setLoading(false);
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedGroups, fetchedPatients, fetchedAppointments] = await Promise.all([
                groupService.getAll(),
                patientService.getAll(),
                appointmentService.getAll()
            ]);
            setGroups(fetchedGroups);
            setPatients(fetchedPatients);
            setAppointments(fetchedAppointments);
        } catch (error) {
            console.error('Error loading data:', error);
            addNotification({
                type: 'alert',
                title: 'Erro ao carregar dados',
                message: 'Não foi possível sincronizar com o servidor.'
            });
        } finally {
            setLoading(false);
        }
    };

    const addGroup = async (groupData: Omit<Group, 'id'>) => {
        try {
            await groupService.create(groupData);
            await loadData(); // Refresh to get the new ID and server timestamp
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
            await loadData();
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
            await loadData();
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
            await loadData();
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
            await loadData();
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

    const refreshData = async () => {
        await loadData();
    };

    return (
        <DataContext.Provider value={{
            groups,
            patients,
            appointments,
            loading,
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
