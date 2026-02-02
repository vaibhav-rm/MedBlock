import { create } from 'zustand';

type UserRole = 'patient' | 'doctor' | null;

interface AuthState {
    isAuthenticated: boolean;
    role: UserRole;
    walletAddress: string | null;
    phoneNumber: string | null;
    login: (role: UserRole, address: string, phone: string) => void;
    logout: () => void;
    pendingAuth: { role: UserRole; phone: string; address: string; redirectTo: string } | null;
    setPendingAuth: (data: { role: UserRole; phone: string; address: string; redirectTo: string } | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    role: null,
    walletAddress: null,
    phoneNumber: null,
    login: (role, address, phone) => set({ isAuthenticated: true, role, walletAddress: address, phoneNumber: phone }),
    logout: () => set({ isAuthenticated: false, role: null, walletAddress: null, phoneNumber: null }),

    // Temporary state for OTP flow
    pendingAuth: null as { role: UserRole; phone: string; address: string; redirectTo: string } | null,
    setPendingAuth: (data: { role: UserRole; phone: string; address: string; redirectTo: string } | null) => set({ pendingAuth: data }),
}));
