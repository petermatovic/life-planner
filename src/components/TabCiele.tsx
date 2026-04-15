'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Trash2 } from 'lucide-react';
import { num, calcPMT_fv, calcPV, calcPMT_loan } from '@/utils/helpers';

export default function TabCiele() {
  const { t } = useTranslation();
  const {
    klient, partner, hasPartner, deti,
    aofCiele, setAofCiele,
  } = useAppStore();

  // num, calcPMT_fv, calcPV, calcPMT_loan imported from @/utils/helpers

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
    mesacnaPlatba?: number;
  };

  const allGoals: GoalDef[] = [
    {
      id: 'zabKlient',
      nazov: `${t('ciele.zabezpeceniePrijmu')} – ${klient.meno || t('aof.klient')}`,
      horizont: Math.max(0, 64 - klientVek) || '',
      potrebnaSuma: prodKapKlient || '',
    },
    ...(hasPartner ? [{
      id: 'zabPartner',
      nazov: `${t('ciele.zabezpeceniePrijmu')} – ${partner.meno || t('aof.partner')}`,
      horizont: Math.max(0, 64 - partnerVek) || '',
      potrebnaSuma: prodKapPartner || '',
    }] : []),
    {
      id: 'rezerva',
      nazov: t('ciele.rezerva'),
      horizont: '',
      potrebnaSuma: rezerva || '',
    },
    {
      id: 'rentaKlient20',
      nazov: `${t('ciele.renta')} ${klient.meno || t('aof.klient')} – ${aofCiele.zabezpecenieKlientRentaRoky}`,
      horizont: Math.max(0, 64 - klientVek) || '',
      potrebnaSuma: prodKapKlient || '',
    },
    ...(hasPartner ? [{
      id: 'rentaPartner20',
      nazov: `${t('ciele.renta')} ${partner.meno || t('aof.partner')} – ${aofCiele.zabezpeceniePartnerRentaRoky}`,
      horizont: Math.max(0, 64 - partnerVek) || '',
      potrebnaSuma: prodKapPartner || '',
    }] : []),
    ...(aofCiele.predcasnaRentaKlientCheckbox ? [{
      id: 'predRentaKlient',
      nazov: `${t('ciele.predcasnaRenta')} – ${klient.meno || t('aof.klient')}`,
      horizont: num(aofCiele.predcasnaRentaKlientVek) > 0
        ? Math.max(0, num(aofCiele.predcasnaRentaKlientVek) - klientVek)
        : '' as '',
      potrebnaSuma: num(aofCiele.predcasnaRentaKlientVyska) > 0
        ? num(aofCiele.predcasnaRentaKlientVyska) * 12 * 20
        : '' as '',
    }] : []),
    ...(aofCiele.predcasnaRentaPartnerCheckbox ? [{
      id: 'predRentaPartner',
      nazov: `${t('ciele.predcasnaRenta')} – ${partner.meno || t('aof.partner')}`,
      horizont: num(aofCiele.predcasnaRentaPartnerVek) > 0
        ? Math.max(0, num(aofCiele.predcasnaRentaPartnerVek) - partnerVek)
        : '' as '',
      potrebnaSuma: num(aofCiele.predcasnaRentaPartnerVyska) > 0
        ? num(aofCiele.predcasnaRentaPartnerVyska) * 12 * 20
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
    ...(aofCiele.byvanieCheckbox ? [{
      id: 'byvanie',
      nazov: aofCiele.byvanieNazov || t('ciele.byvanie'),
      horizont: aofCiele.byvanieSplatnost || '' as '',
      potrebnaSuma: aofCiele.byvanieNesplatenyDiel || '' as '',
      mesacnaPlatba: byvanieSplatka,
    }] : []),
    ...deti.filter(d => d.cielSuma).map(d => ({
      id: `dite_${d.id}`,
      nazov: d.meno || t('ciele.dieta'),
      horizont: (d.cielDoVeku && d.vek) ? Number(d.cielDoVeku) - Number(d.vek) : '' as '',
      potrebnaSuma: d.cielSuma || '' as '',
    })),
    ...aofCiele.ineCiele.filter(c => c.checked).map(c => ({
      id: `ciel_${c.id}`,
      nazov: c.nazov,
      horizont: c.horizont || '' as '',
      potrebnaSuma: c.hodnota || '' as '',
    })),
  ];

  const priorities = aofCiele.goalPriorities;

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

  const selectedGoals = allGoals
    .filter(g => (priorities[g.id] || 0) > 0)
    .sort((a, b) => (priorities[a.id] || 0) - (priorities[b.id] || 0));

  const rInv = aofCiele.urokInvestovanie;
  const rVyp = aofCiele.urokVyplata;

  const totalMesacnaUlozka = selectedGoals.reduce((sum, g) => {
    const pmt = g.mesacnaPlatba !== undefined
      ? g.mesacnaPlatba
      : calcPMT_fv(num(g.potrebnaSuma), num(g.horizont), rInv);
    return sum + pmt;
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
        <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-bold shadow-lg flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest opacity-80">{t('ciele.nutneInvestovat')}</span>
          <span className="text-xl">{Math.round(totalMesacnaUlozka).toLocaleString('sk-SK')} €</span>
        </div>
      </div>

      {/* ÚROKOVÉ SADZBY */}
      <div className="flex items-center gap-6 bg-[#EAEAEA] dark:bg-[#1A1A1A] border border-[#D1D1D1] dark:border-[#333] rounded px-4 py-2 text-xs">
        <span className="font-bold text-[#555] dark:text-[#AAA]">{t('ciele.urokoveSadzby')}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold">{t('ciele.investovanie')}</span>
          <input type="number" step="0.1" value={rInv || ""} onChange={e => setAofCiele({ urokInvestovanie: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0 })} className="w-16 border text-center bg-white dark:bg-[#111] px-1 py-0.5 rounded" />
          <span>% p.a.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{t('ciele.vyplataSplatka')}</span>
          <input type="number" step="0.1" value={rVyp || ""} onChange={e => setAofCiele({ urokVyplata: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0 })} className="w-16 border text-center bg-white dark:bg-[#111] px-1 py-0.5 rounded" />
          <span>% p.a.</span>
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
                <th className="px-2 py-2 text-left w-7">#</th>
                <th className="px-2 py-2 text-left">{t('ciele.ciel')}</th>
                <th className="px-2 py-2 text-center">{t('ciele.casovyHorizont')}</th>
                <th className="px-2 py-2 text-center">{t('ciele.potrebnaSuma')}</th>
                <th className="px-2 py-2 text-center bg-[#3a3a3a] dark:bg-[#222]">
                  {t('ciele.urokInvest')}
                </th>
                <th className="px-2 py-2 text-center bg-[#3a3a3a] dark:bg-[#222]">
                  {t('ciele.urokVyplata')}
                </th>
                <th className="px-2 py-2 text-center">{t('ciele.jednorazovyVklad')}</th>
                <th className="px-2 py-2 text-center">{t('ciele.mesacnaPlatba')}</th>
                <th className="w-6" />
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
                const pSuma = num(g.potrebnaSuma);
                const horizont = num(g.horizont);
                const mesacna = g.mesacnaPlatba !== undefined
                  ? g.mesacnaPlatba
                  : calcPMT_fv(pSuma, horizont, rInv);
                const jednorazovy = pSuma > 0
                  ? calcPV(pSuma, horizont, rInv)
                  : 0;

                return (
                  <tr
                    key={g.id}
                    className={`border-b border-[#D1D1D1] dark:border-[#333] ${i % 2 === 0 ? 'bg-white dark:bg-[#111]' : 'bg-[#F5F5F5] dark:bg-[#181818]'}`}
                  >
                    <td className="px-2 py-2 text-center font-extrabold text-[#AB0534] text-sm">{priorities[g.id]}</td>
                    <td className="px-2 py-2 font-bold">{g.nazov}</td>
                    <td className="px-2 py-2 text-center">{horizont > 0 ? horizont : '–'}</td>
                    <td className="px-2 py-2 text-center font-bold">{pSuma > 0 ? `${Math.round(pSuma).toLocaleString('sk-SK')} €` : '–'}</td>
                    <td className="px-2 py-2 text-center text-[#555] dark:text-[#AAA]">{rInv} %</td>
                    <td className="px-2 py-2 text-center text-[#555] dark:text-[#AAA]">{rVyp} %</td>
                    <td className="px-2 py-2 text-center font-bold text-[#1E5083]">
                      {jednorazovy > 0 ? `${Math.round(jednorazovy).toLocaleString('sk-SK')} €` : '–'}
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
                        return sum + calcPV(num(g.potrebnaSuma), num(g.horizont), rInv);
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
