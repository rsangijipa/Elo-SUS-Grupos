import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/shared';

interface RoleGuardProps {
    children: React.ReactNode;
    allowed: UserRole[];
    fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowed, fallback = null }: RoleGuardProps) {
    const { user } = useAuth();

    // If no user, or user role not in allowed list, return fallback
    if (!user || !allowed.includes(user.role as UserRole)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
