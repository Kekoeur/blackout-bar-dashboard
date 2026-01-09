// apps/bar-dashboard/src/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Bar {
  id: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER';
}

interface BarUser {
  id: string;
  email: string;
  name: string;
  isSuperAdmin?: boolean; // ⭐ AJOUTER
  bars: Bar[];
}

interface AuthState {
  token: string | null;
  user: BarUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: BarUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      login: (token, user) => {
        console.log('✅ [AuthStore] Login called'); // ⭐ DEBUG
        console.log('✅ [AuthStore] Token:', token.substring(0, 20) + '...'); // ⭐ DEBUG
        console.log('✅ [AuthStore] User:', user); // ⭐ DEBUG
        
        localStorage.setItem('bar_dashboard_token', token);
        set({ token, user, isAuthenticated: true });
      },
      
      logout: () => {
        console.log('🚪 [AuthStore] Logout called'); // ⭐ DEBUG
        
        localStorage.removeItem('bar_dashboard_token');
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'bar-dashboard-auth',
    }
  )
);