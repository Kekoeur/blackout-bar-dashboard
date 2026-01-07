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
        set({ token, user, isAuthenticated: true });
      },
      
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'bar-dashboard-auth',
    }
  )
);