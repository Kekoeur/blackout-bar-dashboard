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
  isSuperAdmin?: boolean;
  bars: Bar[];
}

interface AuthState {
  token: string | null;
  user: BarUser | null;
  hydrated: boolean;
  login: (token: string, user: BarUser) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,

      login: (token, user) => {
        console.log('✅ [AuthStore] Login');
        set({ token, user });
      },

      logout: () => {
        console.log('🚪 [AuthStore] Logout');
        set({ token: null, user: null });
      },

      setHydrated: () => {
        set({ hydrated: true });
      },
    }),
    {
      name: 'bar-dashboard-auth',
      onRehydrateStorage: () => (state) => {
        console.log('🔄 [AuthStore] Hydrated from storage');
        state?.setHydrated();
      },
    }
  )
);
