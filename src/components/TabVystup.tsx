'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Download, Printer, Upload } from 'lucide-react';
import { num, calcPMT_fv, calcFV, calcPMT_loan } from '@/utils/helpers';

export default function TabVystup() {
  const { t } = useTranslation();
  const state = useAppStore();
  const { klient, partner, hasPartner, deti, cashFlow, majetok, aofCiele } = state;

  // ── Príjmy a výdavky ─────────────────────────────────────────────────────
  const klientPrijemMes = num(klient.cistyMesacne) + num(klient.pasivnyMesacne);
  const klientPrijemRoc = num(klient.cistyRocne) + num(klient.pasivnyRocne);
  const partnerPrijemMes = hasPartner ? num(partner.cistyMesacne) + num(partner.pasivnyMesacne) : 0;
  const partnerPrijemRoc = hasPartner ? num(partner.cistyRocne) + num(partner.pasivnyRocne) : 0;
  const prijmyMes = klientPrijemMes + partnerPrijemMes;
  const prijmyRocEff = (klientPrijemRoc + partnerPrijemRoc) / 12;
  const totalPrijmy = prijmyMes + prijmyRocEff;

  // Výdavky podľa Excel: Spotreba a Finančný trh
  const spotreba = num(cashFlow.spotrebaMesacne) + num(cashFlow.spotrebaRocne) / 12;
  const financnyTrh = num(cashFlow.uverySplatka) + num(cashFlow.sporeniaSplatka)
    + num(cashFlow.investicieSplatka) + num(cashFlow.poistZivotSplatka)
    + num(cashFlow.poistNezivotMesacne) + num(cashFlow.poistNezivotRocne) / 12;
  const totalVydavky = spotreba + financnyTrh;
  const rozdiel = totalPrijmy - totalVydavky;

  // ── Majetok ──────────────────────────────────────────────────────────────
  const fyzickyMajetok = majetok.reduce((s, m) => s + num(m.hodnota), 0);
  const financnyMajetok = num(cashFlow.sporeniaZostatok) + num(cashFlow.investicieZostatok) + num(cashFlow.poistZivotZostatok);
  const pasiva = num(cashFlow.uveryZostatok);
  const cistaMajetok = fyzickyMajetok + financnyMajetok - pasiva;

  // ── Ideálne finančné miery (podľa Excelu) ─────────────────────────────────
  // Optimal = percentuálny podiel z celkového príjmu
  const optSpotreba = totalPrijmy * 0.40;
  const optUvery = totalPrijmy * 0.30;
  const optMajetok = totalPrijmy * 0.20;
  const optRezerva = totalPrijmy * 0.10;

  // Súčasné = reálne sumy
  const sucSpotreba = spotreba;
  const sucUvery = num(cashFlow.uverySplatka);
  const sucMajetok = num(cashFlow.sporeniaSplatka) + num(cashFlow.investicieSplatka) + num(cashFlow.poistZivotSplatka);
  const sucRezerva = rozdiel > 0 ? Math.min(rozdiel, totalPrijmy * 0.10) : 0;

  // Nové = redistribuovaný plán (optimálne rozdelenie príjmu)
  const noveSpotreba = optSpotreba; // cieľový stav
  const noveUvery = 0; // ideálne žiadne nové úvery
  const noveMajetok = optMajetok;
  const noveRezerva = 0; // po naplnení ide do investícií

  // ── Prioritné ciele (z Ciele tabu) ──────────────────────────────────────
  const klientVek = num(klient.vekPos);
  const partnerVek = num(partner.vekPos);
  const klientPrijem = num(klient.cistyMesacne) + num(klient.cistyRocne) / 12;
  const partnerPrijem = num(partner.cistyMesacne) + num(partner.cistyRocne) / 12;
  const prodKapKlient = klientPrijem > 0 ? klientPrijem * 12 * Math.max(0, 64 - klientVek) : 0;
  const prodKapPartner = partnerPrijem > 0 ? partnerPrijem * 12 * Math.max(0, 64 - partnerVek) : 0;
  const rezerva = (klientPrijem + (hasPartner ? partnerPrijem : 0)) * 6;
  const rInv = aofCiele.urokInvestovanie;
  const rVyp = aofCiele.urokVyplata;
  const byvanieSplatka = calcPMT_loan(num(aofCiele.byvanieSumaUveru), num(aofCiele.byvanieSplatnost), num(aofCiele.byvanieUrok));

  const priorities = aofCiele.goalPriorities;
  const goalRates = aofCiele.goalRates || {};

  type GoalRow = {
    id: string; nazov: string; platba: number; jednorazovy: number;
    vysledna: number; vyskaRenty: number; dobaVyplaty: number;
    pozadovana: number; naplnenie: number;
  };

  const getGR = (id: string, field: 'urokInvest' | 'urokVyplata', def: number) => {
    const v = goalRates[id]?.[field];
    return (v !== undefined && v !== '') ? Number(v) : def;
  };

  const buildGoal = (id: string, nazov: string, horizont: number, pozadovana: number, isLoan = false, loanPmt = 0): GoalRow | null => {
    if ((priorities[id] || 0) <= 0) return null;
    const goalInv = getGR(id, 'urokInvest', rInv);
    const goalVyp = getGR(id, 'urokVyplata', rVyp);

    let platba = 0;
    let jednorazovy = 0;
    let vysledna = 0;
    let vyskaRenty = 0;
    let dobaVyplaty = 0;

    if (isLoan) {
      platba = loanPmt;
    } else if (id.startsWith('zab')) {
      // Zabezpečenie príjmu – poistná suma, no interest
      platba = pozadovana > 0 ? 2 : 0; // symbolická suma (poistné)
    } else if (id === 'rezervaMD' || id.startsWith('dite_')) {
      // No interest, simple division
      platba = horizont > 0 ? pozadovana / (horizont * 12) : pozadovana;
    } else if (horizont > 0 && pozadovana > 0) {
      platba = calcPMT_fv(pozadovana, horizont, goalInv);
      jednorazovy = 0; // default
      vysledna = calcFV(platba, horizont, goalInv);

      // Ak má výplatnú sadzbu, počítame rentu
      if (id.includes('Renta') || id.includes('renta') || id.startsWith('rentaK') || id.startsWith('rentaP') || id.startsWith('predRenta')) {
        if (goalVyp > 0) {
          const mesVyp = goalVyp / 100 / 12;
          vyskaRenty = mesVyp > 0 ? vysledna * mesVyp / (1 - Math.pow(1 + mesVyp, -20 * 12)) : vysledna / (20 * 12);
          dobaVyplaty = id.startsWith('predRenta') ? 4 : 20;
        }
      }
    }

    const naplnenie = pozadovana > 0 && vysledna > 0 ? Math.round((vysledna / pozadovana) * 100) : 0;

    return { id, nazov, platba, jednorazovy, vysledna, vyskaRenty, dobaVyplaty, pozadovana, naplnenie };
  };

  const allRows: GoalRow[] = [];

  // Zabezpečenie príjmu
  const zK = buildGoal('zabKlient', `${t('ciele.zabezpeceniePrijmu')}`, 0, prodKapKlient);
  if (zK) { zK.vysledna = 0; zK.naplnenie = 0; allRows.push(zK); }
  if (hasPartner) {
    const zP = buildGoal('zabPartner', `${t('ciele.zabezpeceniePrijmu')} (P)`, 0, prodKapPartner);
    if (zP) { zP.vysledna = 0; zP.naplnenie = 0; allRows.push(zP); }
  }

  // Predčasná renta
  if (aofCiele.predcasnaRentaPartnerCheckbox) {
    const h = Math.max(0, num(aofCiele.predcasnaRentaPartnerVek) - partnerVek);
    const s = num(aofCiele.predcasnaRentaPartnerVyska) * 12 * 20;
    const r = buildGoal('predRentaPartner', `${t('ciele.predcasnaRenta')} ${partner.meno}`, h, s);
    if (r) allRows.push(r);
  }
  if (aofCiele.predcasnaRentaKlientCheckbox) {
    const h = Math.max(0, num(aofCiele.predcasnaRentaKlientVek) - klientVek);
    const s = num(aofCiele.predcasnaRentaKlientVyska) * 12 * 20;
    const r = buildGoal('predRentaKlient', `${t('ciele.predcasnaRenta')} ${klient.meno}`, h, s);
    if (r) allRows.push(r);
  }

  // Rezerva na MD
  if (aofCiele.rezervaMDCheckbox) {
    const h = num(aofCiele.rezervaMDRoky) || 1;
    const s = num(aofCiele.rezervaMDRenta) * num(aofCiele.rezervaMDDoba) * 12;
    const r = buildGoal('rezervaMD', t('ciele.rezervaMD'), h, s);
    if (r) allRows.push(r);
  }

  // Deti
  deti.filter(d => d.cielSuma).forEach(d => {
    const h = (d.cielDoVeku && d.vek) ? Number(d.cielDoVeku) - Number(d.vek) : 0;
    const r = buildGoal(`dite_${d.id}`, d.meno || t('ciele.dieta'), h, num(d.cielSuma));
    if (r) allRows.push(r);
  });

  // Renta
  {
    const h = Math.max(0, 64 - klientVek);
    const r = buildGoal('rentaKlient20', `${t('ciele.renta')} ${klient.meno}-${aofCiele.zabezpecenieKlientRentaRoky}`, h, prodKapKlient);
    if (r) allRows.push(r);
  }
  if (hasPartner) {
    const h = Math.max(0, 64 - partnerVek);
    const r = buildGoal('rentaPartner20', `${t('ciele.renta')} ${partner.meno}-${aofCiele.zabezpeceniePartnerRentaRoky}`, h, prodKapPartner);
    if (r) allRows.push(r);
  }

  // Rezerva
  {
    const r = buildGoal('rezerva', t('ciele.rezerva'), 5, rezerva);
    if (r) allRows.push(r);
  }

  // Bývanie
  if (aofCiele.byvanieCheckbox) {
    const r = buildGoal('byvanie', aofCiele.byvanieNazov || t('ciele.byvanie'), num(aofCiele.byvanieSplatnost), num(aofCiele.byvanieNesplatenyDiel), true, byvanieSplatka);
    if (r) { r.vysledna = 0; r.naplnenie = 0; allRows.push(r); }
  }

  // Iné ciele
  aofCiele.ineCiele.filter(c => c.checked).forEach(c => {
    const r = buildGoal(`ciel_${c.id}`, c.nazov, num(c.horizont), num(c.hodnota));
    if (r) allRows.push(r);
  });

  const fmt = (v: number) => v > 0 ? `${Math.round(v).toLocaleString('sk-SK')} €` : '0 €';
  const fmtOrDash = (v: number) => v > 0 ? `${Math.round(v).toLocaleString('sk-SK')} €` : '';

  // ── Export / Import ──────────────────────────────────────────────────────
  const handleExportJSON = () => {
    const { setKlient, setPartner, setHasPartner, setHasDeti, setDeti, setMajetok, setCashFlow, setAofCiele, addInyCiel, setJazyk, loadVzoroveData, resetNovyPlan, ...data } = state;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `fp_${klient.meno || 'klient'}_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const handleImportJSON = () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.klient || !data.cashFlow) {
          alert(t('vystup.importError') || 'Neplatný súbor.');
          return;
        }
        const currentLang = state.jazyk;
        state.setKlient(data.klient);
        if (data.partner) state.setPartner(data.partner);
        if (data.hasPartner !== undefined) state.setHasPartner(data.hasPartner);
        if (data.hasDeti !== undefined) state.setHasDeti(data.hasDeti);
        if (data.deti) state.setDeti(data.deti);
        if (data.majetok) state.setMajetok(data.majetok);
        state.setCashFlow(data.cashFlow);
        if (data.aofCiele) state.setAofCiele(data.aofCiele);
        state.setJazyk(data.jazyk || currentLang);
        alert(t('vystup.importSuccess') || `Dáta načítané.`);
      } catch {
        alert(t('vystup.importError') || 'Chyba pri čítaní.');
      }
    };
    inp.click();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-20 print:pb-2 print:gap-3">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-4 print:pb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">
            {t('vystup.title')}
          </h2>
          <p className="text-sm text-[#4D4D4D] dark:text-[#989FA7] mt-1 ml-4">
            {klient.meno || '–'}{hasPartner ? ` & ${partner.meno || '–'}` : ''}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={handleImportJSON} className="bg-white dark:bg-[#2A2A2A] text-[#171717] dark:text-white border border-[#D1D1D1] dark:border-[#4D4D4D] px-3 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-[#EAEAEA] dark:hover:bg-[#333] transition text-xs">
            <Upload size={14} /> {t('vystup.importJson')}
          </button>
          <button onClick={handleExportJSON} className="bg-white dark:bg-[#2A2A2A] text-[#171717] dark:text-white border border-[#D1D1D1] dark:border-[#4D4D4D] px-3 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-[#EAEAEA] dark:hover:bg-[#333] transition text-xs">
            <Download size={14} /> {t('vystup.exportJson')}
          </button>
          <button onClick={() => window.print()} className="bg-[#AB0534] text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-[#8A042A] transition text-xs">
            <Printer size={14} /> {t('vystup.print')}
          </button>
        </div>
      </div>

      {/* ── MESAČNÝ CASH FLOW + MAJETOK ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2">

        {/* Cash Flow */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
          <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold text-sm px-4 py-2 uppercase tracking-wider">
            {t('aof.mesacnyCashflowTitle')}
          </div>
          <div className="p-4 text-xs space-y-2">
            <div className="flex justify-between font-bold text-sm">
              <span>{t('aof.prijmy')}:</span>
              <span className="bg-[#EAEAEA] dark:bg-[#333] px-3 py-0.5 border min-w-[100px] text-right">{fmt(totalPrijmy)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">{t('aof.vydavky')}</span>
              <span className="bg-[#EAEAEA] dark:bg-[#333] px-3 py-0.5 border min-w-[100px] text-right">{fmt(totalVydavky)}</span>
            </div>
            <div className="flex justify-between pl-4 text-[#4D4D4D] dark:text-[#989FA7]">
              <span>{t('aof.spotreba')}</span>
              <span>{fmt(spotreba)}</span>
            </div>
            <div className="flex justify-between pl-4 text-[#4D4D4D] dark:text-[#989FA7]">
              <span>{t('vystup.financnyTrh')}</span>
              <span>{fmt(financnyTrh)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-[#D1D1D1] dark:border-[#333] mt-2">
              <span>{t('aof.rozdiel')}:</span>
              <span className={`bg-[#EAEAEA] dark:bg-[#333] px-3 py-0.5 border min-w-[100px] text-right ${rozdiel >= 0 ? 'text-[#166E36]' : 'text-[#AB0534]'}`}>{fmt(rozdiel)}</span>
            </div>

            {/* Majetok */}
            <div className="pt-3 mt-3 border-t border-[#D1D1D1] dark:border-[#333]">
              <div className="font-extrabold uppercase mb-2">{t('aof.majetokTitle')}:</div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>{t('aof.fyzicky')}</span><span className="font-bold">{fmt(fyzickyMajetok)}</span></div>
                <div className="flex justify-between"><span>{t('aof.financny')}</span><span className="font-bold">{fmt(financnyMajetok)}</span></div>
                <div className="flex justify-between"><span>{t('aof.pasiva')}</span><span className="font-bold text-[#AB0534]">{fmt(pasiva)}</span></div>
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-[#D1D1D1] dark:border-[#333]">
                  <span>{t('aof.cistaHodnota')}:</span>
                  <span className={cistaMajetok >= 0 ? 'text-[#166E36]' : 'text-[#AB0534]'}>{fmt(cistaMajetok)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ideálne finančné miery */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
          <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold text-sm px-4 py-2 uppercase tracking-wider">
            {t('aof.idealneMiery')}
          </div>
          <div className="p-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-[#989FA7] uppercase border-b border-[#D1D1D1] dark:border-[#333]">
                  <th className="text-left py-1"></th>
                  <th className="text-center py-1 w-12">%</th>
                  <th className="text-right py-1 bg-[#EAEAEA] dark:bg-[#222] px-2">{t('aof.optimal')}</th>
                  <th className="text-right py-1 bg-[#f5e6cc] dark:bg-[#332a1a] px-2">{t('aof.sucasne')}</th>
                  <th className="text-right py-1 bg-[#d4edda] dark:bg-[#1a331a] px-2">{t('vystup.nove')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: t('aof.spotreba'), pct: '40%', opt: optSpotreba, suc: sucSpotreba, nov: noveSpotreba },
                  { label: t('vystup.uveroveZatazenie'), pct: '30%', opt: optUvery, suc: sucUvery, nov: noveUvery },
                  { label: t('vystup.tvorbaMajetku'), pct: '20%', opt: optMajetok, suc: sucMajetok, nov: noveMajetok },
                  { label: t('vystup.rezervaLabel'), pct: '10%', opt: optRezerva, suc: sucRezerva, nov: noveRezerva },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#EAEAEA] dark:border-[#333]">
                    <td className="py-2 font-bold">{row.label}</td>
                    <td className="py-2 text-center font-extrabold text-[#AB0534]">{row.pct}</td>
                    <td className="py-2 text-right bg-[#EAEAEA] dark:bg-[#222] px-2 font-bold">{fmt(row.opt)}</td>
                    <td className="py-2 text-right bg-[#f5e6cc] dark:bg-[#332a1a] px-2 font-bold">{fmt(row.suc)}</td>
                    <td className="py-2 text-right bg-[#d4edda] dark:bg-[#1a331a] px-2 font-bold">{fmt(row.nov)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CIELE TABLE ──────────────────────────────────────────────── */}
      {allRows.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
          <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold text-sm px-4 py-2 uppercase tracking-wider">
            {t('ciele.title')}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#EAEAEA] dark:bg-[#222] text-[10px] font-bold uppercase text-[#4D4D4D] dark:text-[#989FA7]">
                  <th className="px-2 py-2 text-center w-8">#</th>
                  <th className="px-2 py-2 text-left">{t('ciele.ciel')}</th>
                  <th className="px-2 py-2 text-right">{t('vystup.platba')}</th>
                  <th className="px-2 py-2 text-right">{t('ciele.jednorazovyVklad')}</th>
                  <th className="px-2 py-2 text-right">{t('vystup.vysledna')}</th>
                  <th className="px-2 py-2 text-right">{t('vystup.vyskaRenty')}</th>
                  <th className="px-2 py-2 text-center">{t('vystup.dobaVyplaty')}</th>
                  <th className="px-2 py-2 text-right">{t('vystup.pozadovana')}</th>
                  <th className="px-2 py-2 text-center">{t('vystup.naplnenie')}</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((g, i) => (
                  <tr key={g.id} className={`border-b border-[#EAEAEA] dark:border-[#333] ${i % 2 === 0 ? '' : 'bg-[#FAFAFA] dark:bg-[#151515]'}`}>
                    <td className="px-2 py-2 text-center font-extrabold text-[#AB0534]">{i + 1}</td>
                    <td className="px-2 py-2 font-bold">{g.nazov}</td>
                    <td className="px-2 py-2 text-right">{fmtOrDash(g.platba)}</td>
                    <td className="px-2 py-2 text-right">{fmtOrDash(g.jednorazovy)}</td>
                    <td className="px-2 py-2 text-right font-bold">{fmtOrDash(g.vysledna)}</td>
                    <td className="px-2 py-2 text-right">{g.vyskaRenty > 0 ? `${Math.round(g.vyskaRenty).toLocaleString('sk-SK')} €` : ''}</td>
                    <td className="px-2 py-2 text-center">{g.dobaVyplaty > 0 ? g.dobaVyplaty : ''}</td>
                    <td className="px-2 py-2 text-right font-bold">{g.pozadovana > 0 ? fmt(g.pozadovana) : '-'}</td>
                    <td className={`px-2 py-2 text-center font-extrabold ${g.naplnenie >= 100 ? 'text-[#166E36]' : g.naplnenie > 0 ? 'text-[#E06138]' : 'text-[#999]'}`}>
                      {g.naplnenie > 0 ? `${g.naplnenie}%` : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ZÁVER ────────────────────────────────────────────────────── */}
      <div className="bg-[#FAFAFA] dark:bg-[#111111] p-6 rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] text-center text-xs text-[#989FA7] print:hidden">
        <p>{t('vystup.footer')}</p>
      </div>
    </div>
  );
}
