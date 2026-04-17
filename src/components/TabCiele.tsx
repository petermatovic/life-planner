'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Trash2 } from 'lucide-react';
import { num, calcPMT_fv, calcPV, calcPMT_loan, calcFV_single } from '@/utils/helpers';

/* ─── Goal type flags: which rates apply to each goal type ─────────────────── */
type GoalRateMode = 'none' | 'invest' | 'both' | 'loan';
const GOAL_RATE_MODE: Record<string, GoalRateMode> = {
  zabKlient: 'none',         // Zabezpečenie príjmu – poistná suma, bez investovania
  zabPartner: 'none',
  rezerva: 'invest',         // Rezerva – len invest úrok
  rentaKlient20: 'both',     // Renta klient – invest + výplata
  rentaPartner20: 'both',
  predRentaKlient: 'both',   // Predčasná renta – invest + výplata
  predRentaPartner: 'both',
  rezervaMD: 'none',         // MD – krátkodobá, bez úroku
  byvanie: 'loan',           // Bývanie – sadzba úveru
};
// dite_* → 'none', ciel_* → 'invest' (handled in code below)
function getGoalRateMode(goalId: string): GoalRateMode {
  if (GOAL_RATE_MODE[goalId]) return GOAL_RATE_MODE[goalId];
  if (goalId.startsWith('dite_')) return 'none';
  if (goalId.startsWith('ciel_')) return 'invest';
  return 'invest';
}

export default function TabCiele() {
  const { t } = useTranslation();
  const {
    klient, partner, hasPartner, deti,
    aofCiele, setAofCiele,
  } = useAppStore();

  // ── Výpočetné pomôcky ──────────────────────────────────────────────────────
  const klientVek = num(klient.vekPos);
  const partnerVek = num(partner.vekPos);
  const klientPrijem = num(klient.cistyMesacne) + num(klient.cistyRocne) / 12;
  const partnerPrijem = num(partner.cistyMesacne) + num(partner.cistyRocne) / 12;
  const totalMesacne = klientPrijem + (hasPartner ? partnerPrijem : 0);

  const prodKapKlient = klientPrijem > 0 ? klientPrijem * 12 * Math.max(0, 64 - klientVek) : 0;
  const prodKapPartner = partnerPrijem > 0 ? partnerPrijem * 12 * Math.max(0, 64 - partnerVek) : 0;
  const rezerva = totalMesacne * 6;

  const byvanieSplatka = calcPMT_loan(num(aofCiele.byvanieSumaUveru), num(aofCiele.byvanieSplatnost), num(aofCiele.byvanieUrok));

  // ── Katalóg všetkých cieľov ────────────────────────────────────────────────
  type GoalDef = {
    id: string;
    nazov: string;
    horizont: number | string;
    potrebnaSuma: number | string;
    mesacnaPlatba?: number;   // override for loan-type goals
  };

  const allGoals: GoalDef[] = [
    {
      id: 'zabKlient',
      nazov: `${t('ciele.zabezpeceniePrijmu')} – ${klient.meno || t('aof.klient')}`,
      horizont: '-',
      potrebnaSuma: '-',
    },
    ...(hasPartner ? [{
      id: 'zabPartner',
      nazov: `${t('ciele.zabezpeceniePrijmu')} – ${partner.meno || t('aof.partner')}`,
      horizont: '-',
      potrebnaSuma: '-',
    }] : []),
    ...(aofCiele.predcasnaRentaPartnerCheckbox ? [{
      id: 'predRentaPartner',
      nazov: `${t('ciele.predcasnaRenta')} ${partner.meno || t('aof.partner')}`,
      horizont: num(aofCiele.predcasnaRentaPartnerVek) > 0
        ? Math.max(0, num(aofCiele.predcasnaRentaPartnerVek) - partnerVek)
        : '' as '',
      potrebnaSuma: num(aofCiele.predcasnaRentaPartnerVyska) > 0
        ? num(aofCiele.predcasnaRentaPartnerVyska) * 12 * 20
        : '' as '',
    }] : []),
    ...(aofCiele.predcasnaRentaKlientCheckbox ? [{
      id: 'predRentaKlient',
      nazov: `${t('ciele.predcasnaRenta')} ${klient.meno || t('aof.klient')}`,
      horizont: num(aofCiele.predcasnaRentaKlientVek) > 0
        ? Math.max(0, num(aofCiele.predcasnaRentaKlientVek) - klientVek)
        : '' as '',
      potrebnaSuma: num(aofCiele.predcasnaRentaKlientVyska) > 0
        ? num(aofCiele.predcasnaRentaKlientVyska) * 12 * 20
        : '' as '',
    }] : []),
    ...(aofCiele.rezervaMDCheckbox ? [{
      id: 'rezervaMD',
      nazov: t('ciele.rezervaMD'),
      horizont: aofCiele.rezervaMDRoky || '' as '',
      potrebnaSuma: (aofCiele.rezervaMDRenta && aofCiele.rezervaMDDoba)
        ? num(aofCiele.rezervaMDRenta) * num(aofCiele.rezervaMDDoba) * 12
        : '' as '',
    }] : []),
    ...deti.filter(d => d.cielSuma).map(d => ({
      id: `dite_${d.id}`,
      nazov: d.meno || t('ciele.dieta'),
      horizont: (d.cielDoVeku && d.vek) ? Number(d.cielDoVeku) - Number(d.vek) : '' as '',
      potrebnaSuma: d.cielSuma || '' as '',
    })),
    {
      id: 'rentaKlient20',
      nazov: `${t('ciele.renta')} ${klient.meno || t('aof.klient')}-${aofCiele.zabezpecenieKlientRentaRoky}`,
      horizont: Math.max(0, 64 - klientVek) || '',
      potrebnaSuma: prodKapKlient || '',
    },
    ...(hasPartner ? [{
      id: 'rentaPartner20',
      nazov: `${t('ciele.renta')} ${partner.meno || t('aof.partner')}-${aofCiele.zabezpeceniePartnerRentaRoky}`,
      horizont: Math.max(0, 64 - partnerVek) || '',
      potrebnaSuma: prodKapPartner || '',
    }] : []),
    {
      id: 'rezerva',
      nazov: t('ciele.rezerva'),
      horizont: 5,
      potrebnaSuma: rezerva || '',
    },
    ...(aofCiele.byvanieCheckbox ? [{
      id: 'byvanie',
      nazov: aofCiele.byvanieNazov || t('ciele.byvanie'),
      horizont: '-' as string,
      potrebnaSuma: aofCiele.byvanieNesplatenyDiel || '' as '',
      mesacnaPlatba: byvanieSplatka,
    }] : []),
    ...aofCiele.ineCiele.filter(c => c.checked).map(c => ({
      id: `ciel_${c.id}`,
      nazov: c.nazov,
      horizont: c.horizont || '' as '',
      potrebnaSuma: c.hodnota || '' as '',
    })),
  ];

  const priorities = aofCiele.goalPriorities;
  const goalRates = aofCiele.goalRates || {};
  const rInvDefault = aofCiele.urokInvestovanie;
  const rVypDefault = aofCiele.urokVyplata;

  const togglePriority = (goalId: string) => {
    const current = priorities[goalId] || 0;
    if (current > 0) {
      const newP: Record<string, number> = {};
      Object.entries(priorities).forEach(([k, v]) => {
        if (k === goalId) return;
        newP[k] = v > current ? v - 1 : v;
      });
      setAofCiele({ goalPriorities: newP });
    } else {
      const maxP = Object.values(priorities).reduce((m, v) => Math.max(m, v), 0);
      setAofCiele({ goalPriorities: { ...priorities, [goalId]: maxP + 1 } });
    }
  };

  const setGoalRate = (goalId: string, field: 'urokInvest' | 'urokVyplata' | 'vklad', value: number | '') => {
    setAofCiele({
      goalRates: {
        ...goalRates,
        [goalId]: { ...goalRates[goalId], [field]: value },
      },
    });
  };

  const getGoalInvestRate = (goalId: string): number => {
    const mode = getGoalRateMode(goalId);
    if (mode === 'none') return 0;
    const custom = goalRates[goalId]?.urokInvest;
    if (custom !== undefined && custom !== '') return Number(custom);
    return rInvDefault;
  };

  const getGoalVyplataRate = (goalId: string): number => {
    const mode = getGoalRateMode(goalId);
    if (mode !== 'both') return 0;
    const custom = goalRates[goalId]?.urokVyplata;
    if (custom !== undefined && custom !== '') return Number(custom);
    return rVypDefault;
  };

  const selectedGoals = allGoals
    .filter(g => (priorities[g.id] || 0) > 0)
    .sort((a, b) => (priorities[a.id] || 0) - (priorities[b.id] || 0));

  const totalMesacnaUlozka = selectedGoals.reduce((sum, g) => {
    if (g.mesacnaPlatba !== undefined) return sum + g.mesacnaPlatba;
    
    const mode = getGoalRateMode(g.id);
    const pSuma = g.potrebnaSuma === '-' ? 0 : num(g.potrebnaSuma);
    const horizont = num(g.horizont);
    const rootVklad = goalRates[g.id]?.vklad;
    const vkladVal = num(rootVklad);
    
    if (pSuma <= 0) return sum;

    if (mode === 'none' || horizont <= 0) {
      // Simple division for no-rate goals, offset by vklad
      const remaining = Math.max(0, pSuma - vkladVal);
      const n = horizont > 0 ? horizont * 12 : 1;
      return sum + remaining / n;
    }
    
    // Future value of lump sum
    const rInv = getGoalInvestRate(g.id);
    const fvOfeVklad = calcFV_single(vkladVal, horizont, rInv);
    const remainingSuma = Math.max(0, pSuma - fvOfeVklad);
    
    return sum + (horizont > 0 ? calcPMT_fv(remainingSuma, horizont, rInv) : 0);
  }, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">
            {t('ciele.title')}
          </h2>
          <p className="text-sm font-bold text-[#4D4D4D] dark:text-[#989FA7] mt-2 ml-4">
            {t('ciele.subtitle')}
          </p>
        </div>
      </div>

      {/* MAIN LAYOUT: goals list + table */}
      <div className="flex gap-4">

        {/* LEFT: Goal selection list */}
        <div className="w-[260px] flex-shrink-0 bg-[#EAEAEA] dark:bg-[#1A1A1A] border border-[#D1D1D1] dark:border-[#333] rounded shadow-sm text-xs">
          <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold px-3 py-2 text-sm">{t('ciele.zoznamCielov')}</div>
          <div className="divide-y divide-[#D1D1D1] dark:divide-[#333]">
            {allGoals.map(g => {
              const p = priorities[g.id] || 0;
              return (
                <div
                  key={g.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors select-none
                    ${p > 0 ? 'bg-white dark:bg-[#111] font-bold' : 'hover:bg-[#D8D8D8] dark:hover:bg-[#222]'}`}
                  onClick={() => togglePriority(g.id)}
                >
                  <span className={p > 0 ? 'text-[#171717] dark:text-white' : 'text-[#555] dark:text-[#777]'}>
                    {g.nazov}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 ml-2 flex-shrink-0 transition-all
                    ${p > 0 ? 'bg-[#AB0534] border-[#AB0534] text-white' : 'border-[#BBBBB] text-[#BBB]'}`}>
                    {p > 0 ? p : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Priority Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#5C5C5C] dark:bg-[#333] text-white text-[11px]">
                <th className="px-2 py-2 text-left w-7" rowSpan={2}>#</th>
                <th className="px-2 py-2 text-left" rowSpan={2}>{t('ciele.ciel')}</th>
                <th className="px-2 py-2 text-center" rowSpan={2}>{t('ciele.casovyHorizont')}</th>
                <th className="px-2 py-2 text-center" rowSpan={2}>{t('ciele.potrebnaSuma')}</th>
                <th className="px-2 py-2 text-center border-l border-white/20" colSpan={2}>
                  {t('ciele.urokLabel') || 'Úrok'}
                </th>
                <th className="px-2 py-2 text-center border-l border-white/20" rowSpan={2}>{t('ciele.jednorazovyVklad')}</th>
                <th className="px-2 py-2 text-center" rowSpan={2}>{t('ciele.mesacnaPlatba')}</th>
                <th className="w-6" rowSpan={2} />
              </tr>
              <tr className="bg-[#4a4a4a] dark:bg-[#2a2a2a] text-white text-[10px]">
                <th className="px-2 py-1 text-center border-l border-white/20">{t('ciele.urokInvest')}</th>
                <th className="px-2 py-1 text-center">{t('ciele.urokVyplata')}</th>
              </tr>
            </thead>
            <tbody>
              {selectedGoals.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-[#989FA7] py-10 bg-white dark:bg-[#111] italic">
                    {t('ciele.vybreCiele')}
                  </td>
                </tr>
              )}
              {selectedGoals.map((g, i) => {
                const mode = getGoalRateMode(g.id);
                const pSuma = g.potrebnaSuma === '-' ? 0 : num(g.potrebnaSuma);
                const horizont = g.horizont === '-' ? 0 : num(g.horizont);
                const rInv = getGoalInvestRate(g.id);
                const rVyp = getGoalVyplataRate(g.id);

                const vkladStr = goalRates[g.id]?.vklad;
                const vkladVal = num(vkladStr);

                let mesacna = 0;
                if (g.mesacnaPlatba !== undefined) {
                  mesacna = g.mesacnaPlatba;
                } else if (pSuma > 0) {
                  if (mode === 'none') {
                    const remaining = Math.max(0, pSuma - vkladVal);
                    mesacna = horizont > 0 ? remaining / (horizont * 12) : remaining;
                  } else {
                    const fvOfeVklad = calcFV_single(vkladVal, horizont, rInv);
                    const remainingSuma = Math.max(0, pSuma - fvOfeVklad);
                    mesacna = horizont > 0 ? calcPMT_fv(remainingSuma, horizont, rInv) : 0;
                  }
                }

                const customInvest = goalRates[g.id]?.urokInvest;
                const customVyplata = goalRates[g.id]?.urokVyplata;

                return (
                  <tr
                    key={g.id}
                    className={`border-b border-[#D1D1D1] dark:border-[#333] ${i % 2 === 0 ? 'bg-white dark:bg-[#111]' : 'bg-[#F5F5F5] dark:bg-[#181818]'}`}
                  >
                    <td className="px-2 py-2 text-center font-extrabold text-[#AB0534] text-sm">{priorities[g.id]}</td>
                    <td className="px-2 py-2 font-bold">{g.nazov}</td>
                    <td className="px-2 py-2 text-center">{g.horizont === '-' ? '-' : (horizont > 0 ? horizont : '–')}</td>
                    <td className="px-2 py-2 text-center font-bold">{g.potrebnaSuma === '-' ? '-' : (pSuma > 0 ? `${Math.round(pSuma).toLocaleString('sk-SK')} €` : '–')}</td>

                    {/* Úrok investovanie */}
                    <td className="px-1 py-1 text-center">
                      {mode === 'none' ? (
                        <span className="text-[#999]">-</span>
                      ) : mode === 'loan' ? (
                        <span className="text-[#555] font-bold">{num(aofCiele.byvanieUrok)}%</span>
                      ) : (
                        <select
                          value={customInvest !== undefined && customInvest !== '' ? String(customInvest) : String(rInvDefault)}
                          onChange={e => {
                            const v = parseFloat(e.target.value);
                            setGoalRate(g.id, 'urokInvest', isNaN(v) ? '' : v);
                          }}
                          className="w-full text-center text-[10px] border bg-white dark:bg-[#111] px-0.5 py-0.5 rounded"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(r => (
                            <option key={r} value={r}>{r}%</option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Úrok výplata/splátka */}
                    <td className="px-1 py-1 text-center">
                      {mode === 'both' ? (
                        <select
                          value={customVyplata !== undefined && customVyplata !== '' ? String(customVyplata) : String(rVypDefault)}
                          onChange={e => {
                            const v = parseFloat(e.target.value);
                            setGoalRate(g.id, 'urokVyplata', isNaN(v) ? '' : v);
                          }}
                          className="w-full text-center text-[10px] border bg-white dark:bg-[#111] px-0.5 py-0.5 rounded"
                        >
                          {[0, 1, 2, 3, 4, 4.5, 5, 6, 7, 8, 9, 10, 12].map(r => (
                            <option key={r} value={r}>{r}%</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#999]">-</span>
                      )}
                    </td>

                    <td className="px-1 py-1 text-center font-bold text-[#1E5083]">
                      {(pSuma > 0 && g.mesacnaPlatba === undefined) ? (
                        <input
                          type="number"
                          value={vkladStr === undefined ? '' : vkladStr}
                          onChange={e => setGoalRate(g.id, 'vklad', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-16 text-center text-xs px-1 py-0.5 border border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FFF2E5] dark:bg-[#332211] rounded"
                          placeholder="0"
                        />
                      ) : (
                        <span className="text-[#999]">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center font-extrabold text-[#166E36] text-sm">
                      {mesacna > 0 ? `${Math.round(mesacna).toLocaleString('sk-SK')} €` : '–'}
                    </td>
                    <td className="px-1 py-2 text-center">
                      <button onClick={() => togglePriority(g.id)} className="text-[#989FA7] hover:text-[#AB0534]">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {selectedGoals.length > 0 && (
              <tfoot>
                <tr className="bg-[#DCDCDC] dark:bg-[#2A2A2A] font-extrabold">
                  <td colSpan={6} className="px-2 py-2 text-right text-xs">{t('ciele.celkom')}</td>
                  <td className="px-2 py-2 text-center text-[#1E5083]">
                    {(() => {
                      const total = selectedGoals.reduce((sum, g) => {
                        return sum + num(goalRates[g.id]?.vklad);
                      }, 0);
                      return total > 0 ? `${Math.round(total).toLocaleString('sk-SK')} €` : '';
                    })()}
                  </td>
                  <td className="px-2 py-2 text-center text-[#166E36] text-sm">
                    {Math.round(totalMesacnaUlozka).toLocaleString('sk-SK')} €
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
