'use client';
import React, { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { num, calcPMT_fv, calcFV as sharedCalcFV, calcPMT_loan } from '@/utils/helpers';

export default function TabFinancnyPlan() {
  const { t } = useTranslation();
  const { klient, partner, hasPartner, deti, cashFlow, aofCiele } = useAppStore();

  const num_ = num; // alias for clarity

  // ── Cash Flow ─────────────────────────────────────────────────────────────
  const prijmy = num(klient.cistyMesacne) + num(klient.cistyRocne) / 12
    + (hasPartner ? num(partner.cistyMesacne) + num(partner.cistyRocne) / 12 : 0)
    + num(klient.pasivnyMesacne) + num(klient.pasivnyRocne) / 12
    + (hasPartner ? num(partner.pasivnyMesacne) + num(partner.pasivnyRocne) / 12 : 0);

  const vydavky = num(cashFlow.spotrebaMesacne) + num(cashFlow.spotrebaRocne) / 12
    + num(cashFlow.uverySplatka) + num(cashFlow.sporeniaSplatka)
    + num(cashFlow.investicieSplatka) + num(cashFlow.poistZivotSplatka)
    + num(cashFlow.poistNezivotMesacne) + num(cashFlow.poistNezivotRocne) / 12;

  const kDisp = Math.max(0, prijmy - vydavky);
  const kDispJednor = num(cashFlow.zostatokUcet);

  // ── Výpočtové pomôcky ─────────────────────────────────────────────────────
  const rInvPa = aofCiele.urokInvestovanie; // ročný % pre helpers

  const klientVek = num(klient.vekPos);
  const partnerVek = num(partner.vekPos);
  const klientPrijem = num(klient.cistyMesacne) + num(klient.cistyRocne) / 12;
  const partnerPrijem = num(partner.cistyMesacne) + num(partner.cistyRocne) / 12;

  // ── Katalóg cieľov (rovnaká logika ako TabCiele) ──────────────────────────
  type Goal = {
    id: string;
    nazov: string;
    horizont: number;   // roky
    fvIdeal: number;    // potrebná suma (budúca hodnota)
    pmtIdeal: number;   // ideálna mesačná platba
    pmtMiera: number;   // platba na mieru (user input)
    fvMiera: number;    // budúca hodnota z platby na mieru
  };

  const buildGoals = (): Goal[] => {
    const goals: Goal[] = [];

    const addGoal = (id: string, nazov: string, horizont: number, fvIdeal: number, pmtMieraSeed = 0) => {
      if (horizont <= 0 || fvIdeal <= 0) return;
      const pmtIdeal = calcPMT_fv(fvIdeal, horizont, rInvPa);
      const pmtMiera = pmtMieraSeed > 0 ? pmtMieraSeed : pmtIdeal;
      const fvMiera = sharedCalcFV(pmtMiera, horizont, rInvPa);
      goals.push({ id, nazov, horizont, fvIdeal, pmtIdeal, pmtMiera, fvMiera });
    };

    // Zabezpečenie príjmu – klient
    const prodKapKlient = klientPrijem * 12 * Math.max(0, 64 - klientVek);
    if (prodKapKlient > 0) {
      addGoal('zabKlient', `${t('fp.rentaKlient')} ${klient.meno || 'Klient'}`, Math.max(0, 64 - klientVek), prodKapKlient);
    }

    // Zabezpečenie príjmu – partner
    if (hasPartner) {
      const prodKapPartner = partnerPrijem * 12 * Math.max(0, 64 - partnerVek);
      if (prodKapPartner > 0) {
        addGoal('zabPartner', `${t('fp.rentaPartner')} ${partner.meno || 'Partner'}`, Math.max(0, 64 - partnerVek), prodKapPartner);
      }
    }

    // Predčasná renta – klient
    if (aofCiele.predcasnaRentaKlientCheckbox && num(aofCiele.predcasnaRentaKlientVyska) && num(aofCiele.predcasnaRentaKlientVek)) {
      const horizont = Math.max(0, num(aofCiele.predcasnaRentaKlientVek) - klientVek);
      const fv = num(aofCiele.predcasnaRentaKlientVyska) * 12 * 20; // 20 ročná renta
      addGoal('predRentaK', `${t('fp.predRentaKlient')} ${klient.meno || 'Klient'}`, horizont, fv);
    }

    // Predčasná renta – partner
    if (hasPartner && aofCiele.predcasnaRentaPartnerCheckbox && num(aofCiele.predcasnaRentaPartnerVyska) && num(aofCiele.predcasnaRentaPartnerVek)) {
      const horizont = Math.max(0, num(aofCiele.predcasnaRentaPartnerVek) - partnerVek);
      const fv = num(aofCiele.predcasnaRentaPartnerVyska) * 12 * 20;
      addGoal('predRentaP', `${t('fp.predRentaPartner')} ${partner.meno || 'Partner'}`, horizont, fv);
    }

    // Rezerva na MD
    if (aofCiele.rezervaMDCheckbox && num(aofCiele.rezervaMDRenta) && num(aofCiele.rezervaMDDoba)) {
      const fv = num(aofCiele.rezervaMDRenta) * num(aofCiele.rezervaMDDoba) * 12;
      const horizont = num(aofCiele.rezervaMDRoky) || 1;
      addGoal('md', t('fp.rezervaMD'), horizont, fv);
    }

    // Základná rezerva (6 mesačných príjmov)
    const rezerva = prijmy * 6;
    if (rezerva > 0) {
      addGoal('rezerva', t('fp.rezerva'), 5, rezerva);
    }

    // Deti
    deti.forEach(d => {
      if (num(d.cielSuma) && num(d.cielDoVeku) && num(d.vek)) {
        const horizont = num(d.cielDoVeku) - num(d.vek);
        addGoal(`dieta_${d.id}`, d.meno || t('fp.dieta'), horizont, num(d.cielSuma));
      }
    });

    // Bývanie
    if (aofCiele.byvanieCheckbox && num(aofCiele.byvanieNesplatenyDiel) && num(aofCiele.byvanieSplatnost) > 0) {
      const pmt = calcPMT_loan(num(aofCiele.byvanieSumaUveru), num(aofCiele.byvanieSplatnost), num(aofCiele.byvanieUrok));
      const fv = num(aofCiele.byvanieNesplatenyDiel);
      const horizont = num(aofCiele.byvanieSplatnost);
      const pmtIdeal = calcPMT_fv(fv, horizont, rInvPa);
      const fvMiera = sharedCalcFV(pmt, horizont, rInvPa);
      goals.push({ id: 'byvanie', nazov: aofCiele.byvanieNazov || t('fp.byvanie'), horizont, fvIdeal: fv, pmtIdeal, pmtMiera: pmt, fvMiera });
    }

    // Iné ciele
    aofCiele.ineCiele.filter(c => c.checked && num(c.hodnota) && num(c.horizont)).forEach(c => {
      addGoal(`ciel_${c.id}`, c.nazov, num(c.horizont), num(c.hodnota));
    });

    return goals;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const goals = useMemo(() => buildGoals(), [klient, partner, hasPartner, deti, cashFlow, aofCiele, rInvPa]);

  const totalPmtIdeal = goals.reduce((s, g) => s + g.pmtIdeal, 0);
  const totalPmtMiera = goals.reduce((s, g) => s + g.pmtMiera, 0);
  const totalFvMiera = goals.reduce((s, g) => s + g.fvMiera, 0);
  const totalFvIdeal = goals.reduce((s, g) => s + g.fvIdeal, 0);

  const fmt = (v: number) => v > 0 ? `${Math.round(v).toLocaleString('sk-SK')} €` : '0 €';
  const fmtPct = (v: number) => v > 0 ? `${Math.round(v)} %` : '0 %';

  // ── Grafy – rozdelenie do 3 skupín ────────────────────────────────────────
  const kratko = goals.filter(g => g.horizont <= 5);
  const stredne = goals.filter(g => g.horizont > 5 && g.horizont <= 15);
  const dlhodo = goals.filter(g => g.horizont > 15);

  const sumFvIdeal = (gs: Goal[]) => gs.reduce((s, g) => s + g.fvIdeal, 0);
  const sumFvMiera = (gs: Goal[]) => gs.reduce((s, g) => s + g.fvMiera, 0);

  const buildChartData = (gs: Goal[]) => [
    { name: t('fp.optimum'), value: sumFvIdeal(gs), fill: '#AB0534' },
    { name: t('fp.realizacia'), value: sumFvMiera(gs), fill: '#7A8C99' },
  ];

  const ChartBlock = ({ label, gs }: { label: string; gs: Goal[] }) => {
    const data = buildChartData(gs);
    const ideal = sumFvIdeal(gs);
    const real = sumFvMiera(gs);
    const pct = ideal > 0 ? Math.round(real / ideal * 100) : 0;
    return (
      <div className="flex flex-col items-center flex-1 min-w-[200px]">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-center mb-1 text-[#4D4D4D] dark:text-[#AAA]">{label}</div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${Math.round(v / 1000)}k`} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => `${Math.round(Number(v)).toLocaleString('sk-SK')} €`} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-[10px] mt-1">
          <div className="font-bold text-[#AB0534]">{fmt(ideal)}</div>
          <div className="text-[#555] dark:text-[#AAA]">{pct}%</div>
          <div className="font-bold">{fmt(real)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 text-xs">

      {/* HEADER */}
      <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">
        {t('fp.title')}
      </h2>

      {/* TOP 3 COLUMNS */}
      <div className="grid grid-cols-3 gap-0 border border-[#D1D1D1] dark:border-[#333] rounded overflow-hidden">

        {/* Aktuálne portfólio */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] p-3 border-r border-[#D1D1D1] dark:border-[#333]">
          <div className="bg-[#5C5C5C] dark:bg-[#333] text-white text-center font-bold py-1 text-[11px] uppercase tracking-wide mb-3">{t('fp.aktualnePortfolio')}</div>
          <div className="flex justify-between py-1"><span className="font-bold">{t('fp.kDispMesacne')}</span><span className="font-extrabold text-[#AB0534]">{fmt(kDisp)}</span></div>
          <div className="flex justify-between py-1"><span className="font-bold">{t('fp.kDispJednor')}</span><span className="font-extrabold text-[#AB0534]">{fmt(kDispJednor)}</span></div>
        </div>

        {/* Ideálny plán */}
        <div className="bg-[#E8F0D8] dark:bg-[#1A2510] p-3 border-r border-[#D1D1D1] dark:border-[#333]">
          <div className="bg-[#5C5C5C] dark:bg-[#333] text-white text-center font-bold py-1 text-[11px] uppercase tracking-wide mb-3">{t('fp.idealnyPlan')}</div>
          <div className="flex justify-between py-1"><span className="font-bold">{t('fp.platbyMesacne')}</span><span className="font-extrabold">{fmt(totalPmtIdeal)}</span></div>
          <div className="flex justify-between py-1"><span className="font-bold">{t('fp.jednor')}</span><span className="font-extrabold">0 €</span></div>
          <div className="flex justify-between py-1 pl-8"><span className="text-[#989FA7]">{fmt(kDispJednor)}</span></div>
          <div className="flex justify-between py-1 border-t border-[#C8D8B0] dark:border-[#333] mt-1"><span className="font-bold">{t('fp.budHodnota')}</span><span className="font-extrabold">{fmt(totalFvIdeal)}</span></div>
        </div>

        {/* Plán na mieru */}
        <div className="bg-[#F0F0F0] dark:bg-[#1A1A1A] p-3">
          <div className="bg-[#5C5C5C] dark:bg-[#333] text-white text-center font-bold py-1 text-[11px] uppercase tracking-wide mb-3">{t('fp.planNaMieru')}</div>
          <div className="flex justify-between py-1"><span className="font-bold">{t('fp.platbyMesacne')}</span><span className="font-extrabold">{fmt(totalPmtMiera)}</span></div>
          <div className="flex justify-between py-1"><span className="font-bold">{t('fp.jednor')}</span><span className="font-extrabold">0 €</span></div>
          <div className="flex justify-between py-1 pl-8"><span className="text-[#989FA7]">{fmt(kDispJednor)}</span></div>
          <div className="flex justify-between py-1 border-t border-[#D1D1D1] dark:border-[#333] mt-1"><span className="font-bold">{t('fp.budHodnota')}</span><span className="font-extrabold">{fmt(totalFvMiera)}</span></div>
        </div>
      </div>

      {/* DETAIL TABLE */}
      <div className="border border-[#D1D1D1] dark:border-[#333] rounded overflow-hidden">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className="bg-[#5C5C5C] text-white px-2 py-1 text-left w-[180px] font-bold border-r border-[#888]">{t('fp.nazov')}</th>
              <th rowSpan={2} className="bg-[#5C5C5C] text-white px-2 py-1 text-center w-[40px] font-bold border-r border-[#888]">{t('fp.doba')}</th>
              <th colSpan={3} className="bg-[#4A7A30] text-white px-2 py-1 text-center font-bold border-r border-[#888]">{t('fp.idealnyPlan')}</th>
              <th colSpan={4} className="bg-[#5C5C5C] text-white px-2 py-1 text-center font-bold">{t('fp.planNaMieru')}</th>
            </tr>
            <tr>
              <th className="bg-[#5A9040] text-white px-2 py-1 text-center font-bold border-r border-[#88B070]">{t('fp.sumaMesacne')}</th>
              <th className="bg-[#5A9040] text-white px-2 py-1 text-center font-bold border-r border-[#88B070]">{t('fp.jednorazova')}</th>
              <th className="bg-[#5A9040] text-white px-2 py-1 text-center font-bold border-r border-[#888]">{t('fp.budHodnotaPort')}</th>
              <th className="bg-[#6C6C6C] text-white px-2 py-1 text-center font-bold border-r border-[#888]">{t('fp.sumaMesacne')}</th>
              <th className="bg-[#6C6C6C] text-white px-2 py-1 text-center font-bold border-r border-[#888]">{t('fp.jednorazova')}</th>
              <th className="bg-[#6C6C6C] text-white px-2 py-1 text-center font-bold border-r border-[#888]">{t('fp.budHodnotaPort')}</th>
              <th className="bg-[#6C6C6C] text-white px-2 py-1 text-center font-bold">{t('fp.naplnenie')}</th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 && (
              <tr><td colSpan={9} className="text-center py-6 text-[#989FA7] italic bg-white dark:bg-[#111]">{t('fp.ziadneCiele')}</td></tr>
            )}
            {goals.map((g, i) => {
              const naplnenie = g.fvIdeal > 0 ? Math.round(g.fvMiera / g.fvIdeal * 100) : 0;
              const rowBg = i % 2 === 0 ? 'bg-white dark:bg-[#111]' : 'bg-[#F5F5F5] dark:bg-[#181818]';
              const naplColor = naplnenie >= 100 ? 'text-[#166E36]' : naplnenie >= 50 ? 'text-[#E06138]' : 'text-[#AB0534]';
              return (
                <tr key={g.id} className={rowBg}>
                  <td className="px-2 py-1 font-bold border-r border-[#D1D1D1] dark:border-[#333]">{g.nazov}</td>
                  <td className="px-2 py-1 text-center border-r border-[#D1D1D1] dark:border-[#333] text-[#555] dark:text-[#AAA]">{g.horizont}</td>
                  {/* Ideálny plán */}
                  <td className="px-2 py-1 text-center bg-[#FFCCCC] dark:bg-[#3A1010] border-r border-[#D1D1D1] dark:border-[#333] font-bold text-[#AB0534]">{fmt(g.pmtIdeal)}</td>
                  <td className="px-2 py-1 text-center bg-[#FFCCCC] dark:bg-[#3A1010] border-r border-[#D1D1D1] dark:border-[#333]">0 €</td>
                  <td className="px-2 py-1 text-center bg-[#FFCCCC] dark:bg-[#3A1010] border-r border-[#D1D1D1] dark:border-[#333] font-bold">{fmt(g.fvIdeal)}</td>
                  {/* Plán na mieru */}
                  <td className="px-2 py-1 text-center bg-[#D4EAC0] dark:bg-[#1A2A10] border-r border-[#D1D1D1] dark:border-[#333] font-bold text-[#166E36]">{fmt(g.pmtMiera)}</td>
                  <td className="px-2 py-1 text-center bg-[#D4EAC0] dark:bg-[#1A2A10] border-r border-[#D1D1D1] dark:border-[#333]">0 €</td>
                  <td className="px-2 py-1 text-center bg-[#D4EAC0] dark:bg-[#1A2A10] border-r border-[#D1D1D1] dark:border-[#333] font-bold">{fmt(g.fvMiera)}</td>
                  <td className={`px-2 py-1 text-center bg-[#D4EAC0] dark:bg-[#1A2A10] font-extrabold ${naplColor}`}>{fmtPct(naplnenie)}</td>
                </tr>
              );
            })}
            {/* TOTAL ROW */}
            {goals.length > 0 && (
              <tr className="bg-[#DCDCDC] dark:bg-[#2A2A2A] font-extrabold border-t-2 border-[#AAA] dark:border-[#555]">
                <td colSpan={2} className="px-2 py-1 text-right border-r border-[#D1D1D1] dark:border-[#333]">{t('fp.spolu')}</td>
                <td className="px-2 py-1 text-center border-r border-[#D1D1D1] dark:border-[#333] text-[#AB0534]">{fmt(totalPmtIdeal)}</td>
                <td className="px-2 py-1 text-center border-r border-[#D1D1D1] dark:border-[#333]">0 €</td>
                <td className="px-2 py-1 text-center border-r border-[#D1D1D1] dark:border-[#333]">{fmt(totalFvIdeal)}</td>
                <td className="px-2 py-1 text-center border-r border-[#D1D1D1] dark:border-[#333] text-[#166E36]">{fmt(totalPmtMiera)}</td>
                <td className="px-2 py-1 text-center border-r border-[#D1D1D1] dark:border-[#333]">0 €</td>
                <td className="px-2 py-1 text-center border-r border-[#D1D1D1] dark:border-[#333]">{fmt(totalFvMiera)}</td>
                <td className="px-2 py-1 text-center">{fmtPct(totalFvIdeal > 0 ? totalFvMiera / totalFvIdeal * 100 : 0)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3 CHARTS */}
      <div className="flex gap-4 mt-4 flex-wrap">
        <ChartBlock label={t('fp.kratkodbCiele')} gs={kratko} />
        <ChartBlock label={t('fp.strednodCiele')} gs={stredne} />
        <ChartBlock label={t('fp.dlhodobCiele')} gs={dlhodo} />
      </div>

    </div>
  );
}
