import { create } from 'zustand';

export interface Osoba {
  meno: string;
  vekPos: number | '';
  hruby: number | '';
  cistyMesacne: number | '';
  cistyRocne: number | '';
  pasivnyMesacne: number | '';
  pasivnyRocne: number | '';
  fajciar: boolean;
}

export interface Dieta {
  id: number;
  vek: number | '';
}

export interface Majetok {
  id: number;
  typ: string; // 'Fyzický', 'Finančný', 'Pasíva'
  nazov: string;
  hodnota: number | '';
}

interface AppState {
  // --- AOF Data ---
  klient: Osoba;
  partner: Osoba;
  hasPartner: boolean;
  deti: Dieta[];
  hasDeti: boolean;
  majetok: Majetok[];

  // --- Cash Flow Data ---
  cashFlow: {
    spotrebaMesacne: number | '';
    spotrebaRocne: number | '';
    uverySplatka: number | '';
    uveryZostatok: number | '';
    sporeniaSplatka: number | '';
    sporeniaZostatok: number | '';
    investicieSplatka: number | '';
    investicieZostatok: number | '';
    poistZivotSplatka: number | '';
    poistZivotZostatok: number | '';
    poistNezivotMesacne: number | '';
    poistNezivotRocne: number | '';
    zostatokUcet: number | '';
  };

  // --- Settings ---
  jazyk: string;
  setJazyk: (lang: string) => void;

  // --- Actions ---
  setKlient: (data: Partial<Osoba>) => void;
  setPartner: (data: Partial<Osoba>) => void;
  setHasPartner: (val: boolean) => void;
  setHasDeti: (val: boolean) => void;
  setDeti: (deti: Dieta[]) => void;
  setMajetok: (majetok: Majetok[]) => void;
  setCashFlow: (data: Partial<AppState['cashFlow']>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  klient: {
    meno: '', vekPos: '', hruby: '', cistyMesacne: '', cistyRocne: '', pasivnyMesacne: '', pasivnyRocne: '', fajciar: false,
  },
  partner: {
    meno: '', vekPos: '', hruby: '', cistyMesacne: '', cistyRocne: '', pasivnyMesacne: '', pasivnyRocne: '', fajciar: false,
  },
  hasPartner: true,
  deti: [],
  hasDeti: true,
  majetok: [],
  cashFlow: {
    spotrebaMesacne: '', spotrebaRocne: '',
    uverySplatka: '', uveryZostatok: '',
    sporeniaSplatka: '', sporeniaZostatok: '',
    investicieSplatka: '', investicieZostatok: '',
    poistZivotSplatka: '', poistZivotZostatok: '',
    poistNezivotMesacne: '', poistNezivotRocne: '',
    zostatokUcet: '',
  },
  jazyk: 'SK',
  setKlient: (data) => set((state) => ({ klient: { ...state.klient, ...data } })),
  setPartner: (data) => set((state) => ({ partner: { ...state.partner, ...data } })),
  setHasPartner: (val) => set({ hasPartner: val }),
  setHasDeti: (val) => set({ hasDeti: val }),
  setDeti: (deti) => set({ deti }),
  setMajetok: (majetok) => set({ majetok }),
  setCashFlow: (data) => set((state) => ({ cashFlow: { ...state.cashFlow, ...data } })),
  setJazyk: (lang) => set({ jazyk: lang }),
}));
