import { create } from 'zustand';

type UserRole = 'patient' | 'doctor' | null;

interface AuthState {
    isAuthenticated: boolean;
    role: UserRole;
    phoneNumber: string | null;
    login: (role: UserRole, phone: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    role: null,
    phoneNumber: null,
    login: (role, phone) => set({ isAuthenticated: true, role, phoneNumber: phone }),
    logout: () => set({ isAuthenticated: false, role: null, phoneNumber: null }),
}));
