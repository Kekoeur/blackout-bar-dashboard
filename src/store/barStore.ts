// apps/bar-dashboard/src/store/barStore.ts

import { create } from 'zustand';

interface Bar {
  id: string;
  name: string;
  city: string;
  address: string;
  role: string;
  pendingOrders: number;
  pendingPhotos: number;
  active: boolean;
}

interface BarState {
  selectedBar: Bar | null;
  bars: Bar[];
  setSelectedBar: (bar: Bar | null) => void;
  setBars: (bars: Bar[]) => void;
}

export const useBarStore = create<BarState>((set) => ({
  selectedBar: null,
  bars: [],
  setSelectedBar: (bar) => set({ selectedBar: bar }),
  setBars: (bars) => set({ bars }),
}));