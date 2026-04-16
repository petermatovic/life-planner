'use client';
import React from 'react';
import { useAppStore, type PrepoctyOsoba } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const num = (v: number | string | undefined | null): number => Number(v) || 0;

const fmtEur = (v: number) => v.toLocaleString('sk-SK', { maximumFractionDigits: 0 }) + ' €';
const fmtPct = (v: number) => (v * 100).toFixed(0) + '%';

/** Editable numeric cell */
const EditCell = ({ value, onChange, className = '' }: { value: number | ''; onChange: (v: number | '') => void; className?: string }) => (
  <input
    type="number"
    value={value === '' ? '' : value}
    onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
    className={`w-full text-center text-xs px-1 py-1 border border-[#D1D1D1] dark:border-[#4D4D4D] bg-white dark:bg-[#1A1A1A] focus:outline-none focus:border-[#AB0534] rounded-sm ${className}`}
    placeholder="0"
  />
);

export default function TabPrepocty() {
  const {
    klient, partner, hasPartner, aofCiele,
    prepoctyKlient, prepoctyPartner,
    setPrepoctyKlient, setPrepoctyPartner,
  } = useAppStore();

  const renderOsoba = (
    osobaLabel: string,
    osobaData: typeof klient,
    prepocty: PrepoctyOsoba,
    setPrepocty: (data: Partial<PrepoctyOsoba>) => void,
    isKlient: boolean,
  ) => {
    const hruby = num(osobaData.hruby);
    const cisty = num(osobaData.cistyMesacne);
    const vek = num(osobaData.vekPos);
    const fajciar = osobaData.fajciar;

    // ── Úmrtie / Úmrtie úrazom ──
    const pohrebne = 4000;
    // Klesajúca suma: renta × 12 × roky_renty (z AOF) → PV at discount rate
    const rentaMesacna = isKlient ? num(aofCiele.zabezpecenieKlientRenta) : num(aofCiele.zabezpeceniePartnerRenta);
    const rentaRoky = isKlient
      ? parseInt(aofCiele.zabezpecenieKlientRentaRoky) || 20
      : parseInt(aofCiele.zabezpeceniePartnerRentaRoky) || 20;
    const klesajucaSuma = rentaMesacna * 12 * rentaRoky;

    // ── Práceneschopnosť ──
    // Sociálna poisťovňa: 55% z vymeriavacieho základu, max 1 551,45 € mesačne
    const socDavkaMesacna = hruby > 0 ? Math.min(hruby * 0.55, 1551.45) : 0;
    const socDavkaDenna = socDavkaMesacna / 30;
    const znizeniePrijmu = Math.max(0, cisty - socDavkaMesacna);
    const optimalnaPNnaDen = znizeniePrijmu / 30;

    // ── Invalidita ──
    // Invalidný dôchodok zo soc. poistenia
    const invDochOd41_70 = hruby > 0 ? hruby * 0.4 * 0.55 : 0; // ~40% pokles, 55% základ
    const invDochOd71 = hruby > 0 ? hruby * 0.7 * 0.55 : 0;     // ~71%+ pokles
    // Optimálne nastavenie: cisty - inv. dôchodok
    const optInvOd41_70 = Math.max(0, cisty - invDochOd41_70);
    const optInvOd71 = Math.max(0, cisty - invDochOd71);
    // Celkové sumy (kapitálová hodnota renty)
    const invSumaOd41 = optInvOd41_70 * 12 * rentaRoky;
    const invSumaOd71 = optInvOd71 * 12 * rentaRoky;

    // ── Jednorazové odškodnenie ──
    const invaliditaKonst = cisty * 12; // 12-mesačný príjem
    const trvaleNasledky = cisty * 12;
    const zavazneOchorenia = cisty * 12;

    // ── Poistná suma tabuľka ──
    const rows = [
      { key: 'umrtie', label: 'Úmrtie', sub: '', opt: pohrebne, noveKey: 'noveUmrtie' as const, aktKey: 'aktualneUmrtie' as const },
      { key: 'umrtieKles', label: 'Úmrtie s klesajúcou poistnou', sub: isKlient ? `od ${(invDochOd41_70 / cisty * 100).toFixed(0)}% do` : '', opt: klesajucaSuma, noveKey: 'noveUmrtieKlesajuca' as const, aktKey: 'aktualneUmrtieKlesajuca' as const },
      { key: 'krytieRenty', label: 'Krytie renty v prípade invalidity', sub: `od 71% do\n100 %`, opt: invSumaOd71, noveKey: 'noveKrytieRenty' as const, aktKey: 'aktualneKrytieRenty' as const },
      { key: 'poistPN', label: 'Poistenie PN', sub: `100 %`, opt: optimalnaPNnaDen, noveKey: 'novePoistPN' as const, aktKey: 'aktualnePoistPN' as const },
      { key: 'invalKonst', label: 'Invalidita s konštantnou', sub: `od 41%\nod 71% do\n100 %`, opt: invaliditaKonst, noveKey: 'noveInvaliditaKonst' as const, aktKey: 'aktualneInvaliditaKonst' as const },
      { key: 'trvaleNasl', label: 'Trvalé následky úrazu', sub: '', opt: trvaleNasledky, noveKey: 'noveTrvaleNasledky' as const, aktKey: 'aktualneTrvaleNasledky' as const },
      { key: 'zavazneOch', label: 'Závažné ochorenia', sub: '', opt: zavazneOchorenia, noveKey: 'noveZavazneOchorenia' as const, aktKey: 'aktualneZavazneOchorenia' as const },
    ];

    // Mesačné PS: sum of nové values that make sense as monthly
    const spolusNove = rows.reduce((s, r) => s + num(prepocty[r.noveKey]), 0);
    const spolusAkt = rows.reduce((s, r) => s + num(prepocty[r.aktKey]), 0);

    // Chart data
    const chartData = [
      { name: 'príjem', klient: cisty, partner: 0 },
      { name: 'PN pôvodné', klient: num(prepocty.aktualnePoistPN), partner: 0 },
      { name: 'PN nové', klient: num(prepocty.novePoistPN), partner: 0 },
      { name: 'INV 40\npôvodné', klient: num(prepocty.aktualneInvaliditaKonst), partner: 0 },
      { name: 'INV 40 nové', klient: num(prepocty.noveInvaliditaKonst), partner: 0 },
      { name: 'INV 71', klient: num(prepocty.aktualneKrytieRenty), partner: 0 },
      { name: 'INV 71 nové', klient: num(prepocty.noveKrytieRenty), partner: 0 },
    ];

    return (
      <div key={osobaLabel} className="bg-white dark:bg-[#111] rounded-lg border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-md overflow-hidden mb-6">
        {/* ── Header ── */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] px-4 py-2 border-b border-[#D1D1D1] dark:border-[#2A2A2A] flex flex-wrap items-center gap-4">
          <h3 className="font-extrabold text-sm uppercase w-24">{osobaLabel}:</h3>
          <div className="flex flex-1 gap-6 items-center text-xs flex-wrap">
            <div className="flex items-center gap-1"><span className="font-bold">Hrubý príjem:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded min-w-[80px] text-right">{hruby.toLocaleString()} €</span></div>
            <div className="flex items-center gap-1"><span className="font-bold">Príjem čistý:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded min-w-[80px] text-right">{cisty.toLocaleString()} €</span></div>
            <div className="flex items-center gap-1 ml-auto"><span className="font-bold">vek</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded w-12 text-center">{vek}</span></div>
            <div className="flex items-center gap-1"><span className="font-bold">fajčiar</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded min-w-[40px] text-center italic">{fajciar ? 'áno' : 'nie'}</span></div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 bg-[#FAFAFA] dark:bg-[#111]">
          {/* ══════ LEFT COLUMN ══════ */}
          <div className="flex flex-col gap-4">

            {/* ── Úmrtie / Úmrtie úrazom ── */}
            <div className="border border-[#AB0534]/30 rounded overflow-hidden">
              <div className="bg-[#AB0534] text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider">Úmrtie / Úmrtie úrazom</div>
              <div className="p-3 bg-white dark:bg-[#1A1A1A] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs"><span className="text-[#4D4D4D] dark:text-[#ededed]">Konštantná suma na zabezpečenie pohrebných nákladov:</span><span className="bg-white dark:bg-[#2A2A2A] border px-2 py-1 font-bold w-24 text-right">{fmtEur(pohrebne)}</span></div>
                <div className="flex justify-between items-center text-xs"><span className="text-[#4D4D4D] dark:text-[#ededed]">Klesajúca suma na zabezpečenie renty:</span><span className="bg-orange-100/30 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] px-2 py-1 font-bold w-32 text-right">{fmtEur(klesajucaSuma)}</span></div>
              </div>
            </div>

            {/* ── Práceneschopnosť ── */}
            <div className="border border-[#AB0534]/30 rounded overflow-hidden">
              <div className="bg-[#AB0534] text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider">Práceneschopnosť (resp.: Denné odškodné v prípade úrazu + Hospitalizácia)</div>
              <div className="bg-white dark:bg-[#1A1A1A]">
                <div className="grid grid-cols-5 text-[10px] text-center font-bold bg-[#EAEAEA] dark:bg-[#222]">
                  <div className="col-span-1 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] flex items-center justify-center">Dávky od 2. mes. na PN:</div>
                  <div className="col-span-2 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D]">Sociálne zabezpečenie</div>
                  <div className="col-span-2 p-1 border-b border-[#D1D1D1] dark:border-[#4D4D4D]">Súkromné zabezpečenie</div>
                </div>
                <div className="grid grid-cols-5 text-[10px] text-center font-bold bg-[#EAEAEA] dark:bg-[#222]">
                  <div className="col-span-1 p-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                  <div className="col-span-1 p-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D]">Mesačná dávka*</div>
                  <div className="col-span-1 p-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D]">Denná dávka*</div>
                  <div className="col-span-1 p-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D]">Zníženie príjmu</div>
                  <div className="col-span-1 p-1">Optimálna PS/deň</div>
                </div>
                <div className="grid grid-cols-5 text-xs text-center">
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">{socDavkaMesacna.toLocaleString('sk-SK', {minimumFractionDigits:0, maximumFractionDigits:0})} €</div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A] font-bold">{socDavkaDenna.toFixed(2)} €</div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-orange-100/30 dark:bg-[#333] text-red-600 font-semibold">{znizeniePrijmu.toFixed(2)} €</div>
                  <div className="col-span-1 p-1.5 font-bold text-[#AB0534]">{optimalnaPNnaDen.toFixed(2)} €</div>
                </div>
              </div>
            </div>

            {/* ── Invalidita ── */}
            <div className="border border-[#7A8C99]/50 dark:border-[#4D4D4D] rounded overflow-hidden">
              <div className="bg-[#EAEAEA] dark:bg-[#2A2A2A] font-bold text-xs px-3 py-1.5 uppercase tracking-wider border-b border-[#D1D1D1]">Invalidita - zabezpečenie náhrady príjmu</div>
              <div className="bg-white dark:bg-[#1A1A1A]">
                <div className="grid grid-cols-5 text-[10px] text-center font-bold bg-[#FAFAFA] dark:bg-[#222]">
                  <div className="col-span-1 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] flex items-center justify-center">Krytie renty v prípade invalidity:</div>
                  <div className="col-span-2 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D]">Invalidný dôchodok zo soc. poist.</div>
                  <div className="col-span-2 p-1 border-b border-[#D1D1D1] dark:border-[#4D4D4D]">Optimálne nastavenie z poistenia</div>
                </div>
                <div className="grid grid-cols-5 text-[10px] text-center font-bold">
                  <div className="col-span-1 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                  <div className="col-span-1 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#4D4D4D] text-white">od 41% do 70%*</div>
                  <div className="col-span-1 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#4D4D4D] text-white">od 71%*</div>
                  <div className="col-span-1 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#7A8C99] text-white">od 41% do 70%</div>
                  <div className="col-span-1 p-1 border-b border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#7A8C99] text-white">od 71%</div>
                </div>
                <div className="grid grid-cols-5 text-xs text-center">
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">{invDochOd41_70.toFixed(2)} €</div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">{invDochOd71.toFixed(2)} €</div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-orange-100/30 dark:bg-[#333] text-[#AB0534] font-bold">{optInvOd41_70.toFixed(2)} €</div>
                  <div className="col-span-1 p-1.5 bg-orange-100/30 dark:bg-[#333] text-[#AB0534] font-bold">{optInvOd71.toFixed(2)} €</div>
                </div>
                <div className="grid grid-cols-5 text-xs text-center border-t border-[#D1D1D1] dark:border-[#4D4D4D]">
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                  <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] font-bold">{fmtEur(invSumaOd41)}</div>
                  <div className="col-span-1 p-1.5 font-bold">{fmtEur(invSumaOd71)}</div>
                </div>
              </div>
            </div>

            {/* ══════ POISTNÁ SUMA TABLE ══════ */}
            <div className="border border-[#AB0534]/30 rounded overflow-hidden shadow-sm">
              <div className="bg-[#AB0534] text-white font-bold text-xs px-3 py-2 text-center uppercase tracking-wider">Poistná suma</div>
              <div className="bg-white dark:bg-[#111] overflow-x-auto text-[10px]">
                <table className="w-full text-center">
                  <thead>
                    <tr className="bg-[#4D4D4D] text-white font-bold text-[10px]">
                      <th className="p-1.5 border-r border-gray-600 w-[28%] text-left pl-2"></th>
                      <th className="p-1.5 border-r border-gray-600 bg-[#7A8C99] w-[12%]">Optimálna</th>
                      <th className="p-1.5 border-r border-gray-600 bg-[#171717] w-[12%]">Nové</th>
                      <th className="p-1.5 border-r border-gray-600 w-[10%]">% pokrytia</th>
                      <th className="p-1.5 border-r border-gray-600 w-[12%]">Aktuálne</th>
                      <th className="p-1.5 w-[10%]">% pokrytia</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {rows.map((r, idx) => {
                      const noveVal = num(prepocty[r.noveKey]);
                      const aktVal = num(prepocty[r.aktKey]);
                      const pctNove = r.opt > 0 ? noveVal / r.opt : 0;
                      const pctAkt = r.opt > 0 ? aktVal / r.opt : 0;
                      return (
                        <tr key={r.key} className={`border-b border-[#D1D1D1] dark:border-[#4D4D4D] ${idx % 2 === 0 ? 'bg-white dark:bg-[#1A1A1A]' : 'bg-[#FAFAFA] dark:bg-[#161616]'}`}>
                          <td className="p-1.5 text-left border-r dark:border-[rgba(255,255,255,0.1)] text-[10px]">
                            <span className="font-semibold">{r.label}</span>
                            {r.sub && <span className="block text-[9px] text-[#7A8C99] whitespace-pre-line">{r.sub}</span>}
                          </td>
                          <td className="p-1.5 border-r font-bold">{fmtEur(r.opt)}</td>
                          <td className="p-1 border-r bg-green-50/50 dark:bg-green-900/10">
                            <EditCell value={prepocty[r.noveKey]} onChange={v => setPrepocty({ [r.noveKey]: v } as Partial<PrepoctyOsoba>)} />
                          </td>
                          <td className={`p-1.5 border-r font-semibold ${pctNove >= 1 ? 'text-green-600' : pctNove > 0 ? 'text-orange-500' : 'text-[#4D4D4D]'}`}>{fmtPct(pctNove)}</td>
                          <td className="p-1 border-r bg-green-50/50 dark:bg-green-900/10">
                            <EditCell value={prepocty[r.aktKey]} onChange={v => setPrepocty({ [r.aktKey]: v } as Partial<PrepoctyOsoba>)} />
                          </td>
                          <td className={`p-1.5 font-semibold ${pctAkt >= 1 ? 'text-green-600' : pctAkt > 0 ? 'text-orange-500' : 'text-[#4D4D4D]'}`}>{fmtPct(pctAkt)}</td>
                        </tr>
                      );
                    })}
                    {/* Spolu mesačne row */}
                    <tr className="bg-[#EAEAEA] dark:bg-[#222] font-bold text-xs border-t-2 border-[#AB0534]">
                      <td className="p-1.5 text-right border-r" colSpan={2}>Spolu mesačne</td>
                      <td className="p-1.5 border-r text-[#AB0534]">{fmtEur(spolusNove)}</td>
                      <td className="p-1.5 border-r"></td>
                      <td className="p-1.5 border-r text-[#AB0534]">{fmtEur(spolusAkt)}</td>
                      <td className="p-1.5"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Bude riešené v Partners ── */}
            <div className="flex items-center gap-2 text-xs mt-1">
              <span className="font-bold">Bude riešené v Partners poisťovni?</span>
              <select
                value={prepocty.partnersPoistovna ? 'ano' : 'nie'}
                onChange={e => setPrepocty({ partnersPoistovna: e.target.value === 'ano' })}
                className="border border-[#D1D1D1] dark:border-[#4D4D4D] px-2 py-1 rounded bg-white dark:bg-[#1A1A1A] text-xs font-bold"
              >
                <option value="ano">áno</option>
                <option value="nie">nie</option>
              </select>
            </div>
          </div>

          {/* ══════ RIGHT COLUMN ══════ */}
          <div className="flex flex-col gap-4">
            {/* Jednorazové odškodnenie header */}
            <div className="text-center">
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-[#171717] dark:text-white">Jednorazové odškodnenie v prípade závažných zdravotných problémov</h3>
            </div>

            {/* Invalidita */}
            <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
              <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl text-[#AB0534]">{fmtEur(invaliditaKonst)}</div>
              <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Invalidita</h4>
              <span className="text-[10px] uppercase font-bold ml-2">Odporúčaná suma</span>
              <p className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] leading-tight">V prípade uznania invalidity je klientovi vyplatená jednorazovo poistná suma.</p>
            </div>

            {/* Trvalé následky úrazu */}
            <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
              <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl text-[#AB0534]">{fmtEur(trvaleNasledky)}</div>
              <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Trvalé následky úrazu</h4>
              <span className="text-[10px] uppercase font-bold ml-2">Odporúčaná suma</span>
              <p className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] leading-tight">V prípade trvalého poškodenia následkom úrazu bude vyplatená časť poistnej sumy s ohľadom na percento poškodenia a na dojednanú progresiu.</p>
            </div>

            {/* Závažné ochorenia */}
            <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
              <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl text-[#AB0534]">{fmtEur(zavazneOchorenia)}</div>
              <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Závažné ochorenia</h4>
              <span className="text-[10px] uppercase font-bold ml-2">Odporúčaná suma</span>
              <p className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] leading-tight">V prípade vzniku ťažkej choroby (rakovina, infarkt myokardu, cievna mozgová príhoda...) poistenej osobe vyplatená dojednaná poistná suma.</p>
            </div>

            {/* Poznámky */}
            <div className="text-[9px] text-[#4D4D4D] dark:text-[#989FA7] leading-relaxed border-t border-[#D1D1D1] dark:border-[#4D4D4D] pt-3 mt-1">
              <p>* Hodnota je orientačná. Presný výpočet závisí od aktuálnych podmienok Sociálnej poisťovne a výšky odvodov do Sociálnej poisťovne.</p>
              <p className="mt-1">- Náhrada mzdy zo Sociálnej poisťovne v prípade PN sa rovná 55% z vymeriavacieho základu (maximálne 55% z 94,0274 eur na deň a teda maximálna mesačná suma je 1 551,45 €).</p>
              <p className="mt-1">- Predpokladaný invalidný dôchodok vyplácaný Sociálnou poisťovňou za ideálnych podmienok je 2 012 €. Po zohľadnení zníženia za každé kedy klient nepracoval.</p>
            </div>

            {/* ── Nové PS v PP (bar chart) ── */}
            <div className="border border-[#D1D1D1] dark:border-[#4D4D4D] rounded overflow-hidden mt-2">
              <div className="bg-[#EAEAEA] dark:bg-[#222] px-3 py-1.5 text-xs font-bold text-center uppercase">Nové PS v PP</div>
              <div className="bg-white dark:bg-[#1A1A1A] p-2" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(v: any) => fmtEur(Number(v))} />
                    <Bar dataKey="klient" fill="#7A8C99">
                      <LabelList dataKey="klient" position="top" style={{ fontSize: 8 }} formatter={(v: any) => Number(v) > 0 ? fmtEur(Number(v)) : ''} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">Prepočty Zabezpečenia Príjmu</h2>

      {renderOsoba('KLIENT', klient, prepoctyKlient, setPrepoctyKlient, true)}
      {hasPartner && renderOsoba('PARTNER', partner, prepoctyPartner, setPrepoctyPartner, false)}
    </div>
  );
}
