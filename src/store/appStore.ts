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
  typ: string;
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

  goalPriorities: Record<string, number>;
  urokInvestovanie: number;
  urokVyplata: number;
}

// ── Vzorové dáta (Rodina Jozef) ──────────────────────────────────────────────
const VZOROVA_RODINA = {
  // obr.1: Jozef 35, hrubý 2500, čistý mes.2000 roč.2000, pasívny mes.200 roč.500
  klient: { meno: 'Jozef', vekPos: 35, hruby: 2500, cistyMesacne: 2000, cistyRocne: 2000, pasivnyMesacne: 200, pasivnyRocne: 500, fajciar: false },
  // obr.1: Jana 32, hrubý 2000, čistý mes.1500 roč.1000
  partner: { meno: 'Jana', vekPos: 32, hruby: 2000, cistyMesacne: 1500, cistyRocne: 1000, pasivnyMesacne: '' as number | '', pasivnyRocne: '' as number | '', fajciar: false },
  hasPartner: true,
  // obr.1+2: deti Janko vek5, suma 20000, do veku 20 (o koľko rokov = 15)
  deti: [{ id: 1, meno: 'Janko', vek: 5, cielSuma: 20000, cielDoVeku: 20 }] as Dieta[],
  hasDeti: true,
  // obr.1: Majetok – Byt 200 000 €
  majetok: [{ id: 1, nazov: 'Byt', typ: 'Fyzický', hodnota: 200000 }] as Majetok[],
  cashFlow: {
    spotrebaMesacne: 1200, spotrebaRocne: 2000,       // obr.1: 1200 / 2000
    uverySplatka: 400,    uveryZostatok: 80000,        // obr.1: 400 / 80000
    sporeniaSplatka: 100, sporeniaZostatok: 2000,      // obr.1: 100 / 2000
    investicieSplatka: 50, investicieZostatok: 1000,   // obr.1: 50 / 1000
    poistZivotSplatka: 25, poistZivotZostatok: 1000,   // obr.1: 25 / 1000
    poistNezivotMesacne: '' as number | '', poistNezivotRocne: 700,  // obr.1: prázdna / 700
    zostatokUcet: 5000,                                // obr.1: 5000
  },
  aofCiele: {
    zakladnaRezerva: '', zabezpecenieKlientKapital: '', zabezpeceniePartnerKapital: '',
    zabezpecenieKlientRenta: 1500, zabezpeceniePartnerRenta: 1200,      // obr.2: 1500/1200
    zabezpecenieKlientRentaRoky: '20r', zabezpeceniePartnerRentaRoky: '20r',
    sociCheckboxKlient: true, sociCheckboxPartner: true, sociSuma: '',   // obr.2: ✓867/✓633
    // obr.2: Refinancovanie 80000 / 20r / 2.5% → splátka 424€
    byvanieCheckbox: true, byvanieNazov: 'Refinancovanie',
    byvanieSumaUveru: 80000, byvanieSplatnost: 20, byvanieUrok: 2.5, byvanieNesplatenyDiel: 80000,
    // obr.2: MD unchecked □
    rezervaMDCheckbox: false, rezervaMDRenta: '' as number | '', rezervaMDDoba: '' as number | '', rezervaMDRoky: '' as number | '', ineCieleExpand: false,
    // obr.2: Predčasná renta □ oba, prázdne polia
    predcasnaRentaKlientCheckbox: false, predcasnaRentaKlientVyska: '' as number | '', predcasnaRentaKlientVek: '' as number | '',
    predcasnaRentaPartnerCheckbox: false, predcasnaRentaPartnerVyska: '' as number | '', predcasnaRentaPartnerVek: '' as number | '',
    // obr.2: Iné ciele – Auto 20000 / 5 rokov
    ineCiele: [{ id: 101, nazov: 'Auto', hodnota: 20000, horizont: 5, checked: true }] as InyCiel[],
    goalPriorities: {},
    urokInvestovanie: 8,
    urokVyplata: 4.5,
  } as AofCieleSetup,
};

// ── Prázdny stav (Nový plán) ──────────────────────────────────────────────────
const PRAZDNY_PLAN = {
  klient: { meno: '', vekPos: '' as number | '', hruby: '' as number | '', cistyMesacne: '' as number | '', cistyRocne: '' as number | '', pasivnyMesacne: '' as number | '', pasivnyRocne: '' as number | '', fajciar: false },
  partner: { meno: '', vekPos: '' as number | '', hruby: '' as number | '', cistyMesacne: '' as number | '', cistyRocne: '' as number | '', pasivnyMesacne: '' as number | '', pasivnyRocne: '' as number | '', fajciar: false },
  hasPartner: false,
  deti: [] as Dieta[],
  hasDeti: false,
  majetok: [] as Majetok[],
  cashFlow: {
    spotrebaMesacne: '' as number | '', spotrebaRocne: '' as number | '',
    uverySplatka: '' as number | '', uveryZostatok: '' as number | '',
    sporeniaSplatka: '' as number | '', sporeniaZostatok: '' as number | '',
    investicieSplatka: '' as number | '', investicieZostatok: '' as number | '',
    poistZivotSplatka: '' as number | '', poistZivotZostatok: '' as number | '',
    poistNezivotMesacne: '' as number | '', poistNezivotRocne: '' as number | '',
    zostatokUcet: '' as number | '',
  },
  aofCiele: {
    zakladnaRezerva: '', zabezpecenieKlientKapital: '', zabezpeceniePartnerKapital: '',
    zabezpecenieKlientRenta: '' as number | '', zabezpeceniePartnerRenta: '' as number | '',
    zabezpecenieKlientRentaRoky: '20r', zabezpeceniePartnerRentaRoky: '20r',
    sociCheckboxKlient: false, sociCheckboxPartner: false, sociSuma: '',
    byvanieCheckbox: false, byvanieNazov: 'Nova hypoteka', byvanieSumaUveru: '' as number | '', byvanieSplatnost: '' as number | '', byvanieUrok: '' as number | '', byvanieNesplatenyDiel: '' as number | '',
    rezervaMDCheckbox: false, rezervaMDRenta: '' as number | '', rezervaMDDoba: '' as number | '', rezervaMDRoky: '' as number | '', ineCieleExpand: false,
    predcasnaRentaKlientCheckbox: false, predcasnaRentaKlientVyska: '' as number | '', predcasnaRentaKlientVek: '' as number | '',
    predcasnaRentaPartnerCheckbox: false, predcasnaRentaPartnerVyska: '' as number | '', predcasnaRentaPartnerVek: '' as number | '',
    ineCiele: [] as InyCiel[],
    goalPriorities: {},
    urokInvestovanie: 8,
    urokVyplata: 4.5,
  } as AofCieleSetup,
};

interface AppState {
  klient: Osoba;
  partner: Osoba;
  hasPartner: boolean;
  deti: Dieta[];
  hasDeti: boolean;
  majetok: Majetok[];
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
  aofCiele: AofCieleSetup;
  jazyk: string;

  setKlient: (data: Partial<Osoba>) => void;
  setPartner: (data: Partial<Osoba>) => void;
  setHasPartner: (val: boolean) => void;
  setHasDeti: (val: boolean) => void;
  setDeti: (deti: Dieta[]) => void;
  setMajetok: (majetok: Majetok[]) => void;
  setCashFlow: (data: Partial<AppState['cashFlow']>) => void;
  setAofCiele: (data: Partial<AofCieleSetup>) => void;
  setJazyk: (lang: string) => void;
  loadVzoroveData: () => void;
  resetNovyPlan: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  ...VZOROVA_RODINA,
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

  loadVzoroveData: () => set({
    ...VZOROVA_RODINA,
    jazyk: undefined as any,  // Keep current language
  }),

  resetNovyPlan: () => set((state) => ({
    ...PRAZDNY_PLAN,
    jazyk: state.jazyk,  // Keep current language
  })),
}));
