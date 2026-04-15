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
  meno?: string;
  vek: number | '';
  cielSuma?: number | '';
  cielDoVeku?: number | '';
}

export interface Majetok {
  id: number;
  typ: string; // 'Fyzický', 'Finančný', 'Pasíva'
  nazov: string;
  hodnota: number | '';
}

export interface InyCiel {
  id: number;
  nazov: string;
  hodnota: number | '';
  horizont: number | '';
  checked: boolean;
}

export interface AofCieleSetup {
  zakladnaRezerva: number | '';
  zabezpecenieKlientKapital: number | '';
  zabezpeceniePartnerKapital: number | '';
  zabezpecenieKlientRenta: number | '';
  zabezpeceniePartnerRenta: number | '';
  zabezpecenieKlientRentaRoky: string;
  zabezpeceniePartnerRentaRoky: string;
  sociCheckboxKlient: boolean;
  sociCheckboxPartner: boolean;
  sociSuma: number | '';
  
  byvanieCheckbox: boolean;
  byvanieNazov: string;
  byvanieSumaUveru: number | '';
  byvanieSplatnost: number | '';
  byvanieUrok: number | '';
  byvanieNesplatenyDiel: number | '';
  
  rezervaMDCheckbox: boolean;
  rezervaMDRenta: number | '';
  rezervaMDDoba: number | '';
  rezervaMDRoky: number | '';
  ineCieleExpand: boolean;
  
  predcasnaRentaKlientCheckbox: boolean;
  predcasnaRentaKlientVyska: number | '';
  predcasnaRentaKlientVek: number | '';
  
  predcasnaRentaPartnerCheckbox: boolean;
  predcasnaRentaPartnerVyska: number | '';
  predcasnaRentaPartnerVek: number | '';
  
  ineCiele: InyCiel[];
  
  // Priority table
  goalPriorities: Record<string, number>; // goalId -> priority order (1-N, 0 = not selected)
  urokInvestovanie: number;  // % p.a. for monthly payment calculation
  urokVyplata: number;       // % p.a. for drawdown / loan
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

  // --- AOF Ciele (Spodná tabuľka) ---
  aofCiele: AofCieleSetup;

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
  setAofCiele: (data: Partial<AofCieleSetup>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  klient: {
    meno: 'Jozef', vekPos: 35, hruby: 2600, cistyMesacne: 2000, cistyRocne: 4900, pasivnyMesacne: 0, pasivnyRocne: 0, fajciar: false,
  },
  partner: {
    meno: 'Mária', vekPos: 33, hruby: 1900, cistyMesacne: 1500, cistyRocne: 1000, pasivnyMesacne: 0, pasivnyRocne: 0, fajciar: false,
  },
  hasPartner: true,
  deti: [],
  hasDeti: true,
  majetok: [],
  cashFlow: {
    spotrebaMesacne: 1200, spotrebaRocne: 1500,
    uverySplatka: 464, uveryZostatok: 80000,
    sporeniaSplatka: 150, sporeniaZostatok: 8500,
    investicieSplatka: 200, investicieZostatok: 12400,
    poistZivotSplatka: 60, poistZivotZostatok: 0,
    poistNezivotMesacne: 15, poistNezivotRocne: 180,
    zostatokUcet: 5000,
  },
  aofCiele: {
    zakladnaRezerva: '',
    zabezpecenieKlientKapital: '', zabezpeceniePartnerKapital: '',
    zabezpecenieKlientRenta: 1500, zabezpeceniePartnerRenta: 1200,
    zabezpecenieKlientRentaRoky: '20r', zabezpeceniePartnerRentaRoky: '20r',
    sociCheckboxKlient: false, sociCheckboxPartner: false, sociSuma: '',
    byvanieCheckbox: false, byvanieNazov: 'Refinancovanie', byvanieSumaUveru: 80000, byvanieSplatnost: 20, byvanieUrok: 3.5, byvanieNesplatenyDiel: 80000,
    rezervaMDCheckbox: false, rezervaMDRenta: '', rezervaMDDoba: '', rezervaMDRoky: '', ineCieleExpand: false,
    predcasnaRentaKlientCheckbox: false, predcasnaRentaKlientVyska: '', predcasnaRentaKlientVek: '',
    predcasnaRentaPartnerCheckbox: false, predcasnaRentaPartnerVyska: '', predcasnaRentaPartnerVek: '',
    ineCiele: [],
    goalPriorities: {},
    urokInvestovanie: 5.0,
    urokVyplata: 4.5,
  },
  jazyk: 'SK',
  setKlient: (data) => set((state) => ({ klient: { ...state.klient, ...data } })),
  setPartner: (data) => set((state) => ({ partner: { ...state.partner, ...data } })),
  setHasPartner: (val) => set({ hasPartner: val }),
  setHasDeti: (val) => set({ hasDeti: val }),
  setDeti: (deti) => set({ deti }),
  setMajetok: (majetok) => set({ majetok }),
  setCashFlow: (data) => set((state) => ({ cashFlow: { ...state.cashFlow, ...data } })),
  setAofCiele: (data) => set((state) => ({ aofCiele: { ...state.aofCiele, ...data } })),
  setJazyk: (lang) => set({ jazyk: lang }),
}));
