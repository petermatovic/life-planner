/** Safe number conversion: treats empty strings and NaN as 0 */
export const num = (v: number | string | undefined | null): number => Number(v) || 0;

/** Parse input value preserving explicit 0: '' stays '', number stays number */
export const parseInput = (raw: string): number | '' =>
  raw === '' ? '' : Number(raw);

/** Unique ID generator (collision-safe) */
let _idCounter = 0;
export const uid = (): string => `id_${Date.now()}_${++_idCounter}_${Math.random().toString(36).substr(2, 9)}`;

/** Financial PMT – mesačná platba na dosiahnutie FV pri mesačnom úrokovaní */
export const calcPMT_fv = (fv: number, rokyHorizont: number, rokPa: number): number => {
  if (!fv || rokyHorizont <= 0) return 0;
  const r = rokPa / 100 / 12;
  const n = rokyHorizont * 12;
  if (r === 0) return fv / n;
  return fv * r / (Math.pow(1 + r, n) - 1);
};

/** Financial PMT – anuitná splátka úveru */
export const calcPMT_loan = (pv: number, roky: number, rokPa: number): number => {
  if (!pv || roky <= 0) return 0;
  const r = rokPa / 100 / 12;
  const n = roky * 12;
  if (r === 0) return pv / n;
  return (pv * r) / (1 - Math.pow(1 + r, -n));
};

/** Financial FV – budúca hodnota pravidelného mesačného vkladu */
export const calcFV = (pmt: number, roky: number, rokPa: number): number => {
  if (!pmt || roky <= 0) return 0;
  const r = rokPa / 100 / 12;
  const n = roky * 12;
  if (r === 0) return pmt * n;
  return pmt * (Math.pow(1 + r, n) - 1) / r;
};

/** Financial PV – súčasná hodnota budúcej sumy (mesačne zložená) */
export const calcPV = (fv: number, roky: number, rokPa: number): number => {
  if (!fv) return 0;
  if (roky <= 0 || rokPa === 0) return fv;
  const r = rokPa / 100 / 12;
  const n = roky * 12;
  return fv / Math.pow(1 + r, n);
};

/** Financial FV_single – budúca hodnota jednorazového vkladu */
export const calcFV_single = (pv: number, roky: number, rokPa: number): number => {
  if (!pv) return 0;
  if (roky <= 0 || rokPa === 0) return pv;
  const r = rokPa / 100 / 12;
  const n = roky * 12;
  return pv * Math.pow(1 + r, n);
};
