import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            role: null,
            walletAddress: null,
            phoneNumber: null,
            login: (role, address, phone) => set({ isAuthenticated: true, role, walletAddress: address, phoneNumber: phone }),
            logout: () => set({ isAuthenticated: false, role: null, walletAddress: null, phoneNumber: null }),

            // Temporary state for OTP flow (do not persist this if not needed, but harmless if small)
            pendingAuth: null,
            setPendingAuth: (data) => set({ pendingAuth: data }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                role: state.role,
                walletAddress: state.walletAddress,
                phoneNumber: state.phoneNumber,
            }),
        }
    )
);
