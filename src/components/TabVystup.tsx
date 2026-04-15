'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Download, Printer, Upload } from 'lucide-react';
import { num, calcPMT_fv, calcPV, calcPMT_loan } from '@/utils/helpers';

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

  const spotrebaMes = num(cashFlow.spotrebaMesacne) + num(cashFlow.spotrebaRocne) / 12;
  const finVydavky = num(cashFlow.uverySplatka) + num(cashFlow.sporeniaSplatka)
    + num(cashFlow.investicieSplatka) + num(cashFlow.poistZivotSplatka)
    + num(cashFlow.poistNezivotMesacne) + num(cashFlow.poistNezivotRocne) / 12;
  const totalVydavky = spotrebaMes + finVydavky;
  const rozdiel = totalPrijmy - totalVydavky;

  // ── Majetok ──────────────────────────────────────────────────────────────
  const fyzickyMajetok = majetok.filter(m => m.typ === 'Fyzický').reduce((s, m) => s + num(m.hodnota), 0);
  const financnyMajetok = num(cashFlow.sporeniaZostatok) + num(cashFlow.investicieZostatok) + num(cashFlow.poistZivotZostatok);
  const pasiva = num(cashFlow.uveryZostatok);
  const cistaMajetok = fyzickyMajetok + financnyMajetok - pasiva;

  // ── Ciele z AOF (zaškrtnuté) ─────────────────────────────────────────────
  const klientVek = num(klient.vekPos);
  const partnerVek = num(partner.vekPos);
  const klientPrijem = num(klient.cistyMesacne) + num(klient.cistyRocne) / 12;
  const partnerPrijem = num(partner.cistyMesacne) + num(partner.cistyRocne) / 12;
  const prodKapKlient = klientPrijem > 0 ? klientPrijem * 12 * Math.max(0, 64 - klientVek) : 0;
  const prodKapPartner = partnerPrijem > 0 ? partnerPrijem * 12 * Math.max(0, 64 - partnerVek) : 0;
  const rezerva = (klientPrijem + (hasPartner ? partnerPrijem : 0)) * 6;
  const rInv = aofCiele.urokInvestovanie;

  const byvanieSplatka = calcPMT_loan(num(aofCiele.byvanieSumaUveru), num(aofCiele.byvanieSplatnost), num(aofCiele.byvanieUrok));

  type GoalRow = { nazov: string; horizont: number; suma: number; mesacne: number };
  const priorities = aofCiele.goalPriorities;

  const selectedGoals: GoalRow[] = [];
  const tryAdd = (id: string, nazov: string, horizont: number, suma: number, mesacneOverride?: number) => {
    if ((priorities[id] || 0) <= 0) return;
    const mes = mesacneOverride !== undefined ? mesacneOverride : calcPMT_fv(suma, horizont, rInv);
    selectedGoals.push({ nazov, horizont, suma, mesacne: mes });
  };

  // Zabezpečenie príjmu
  tryAdd('zabKlient', `${t('ciele.zabezpeceniePrijmu')} – ${klient.meno || t('aof.klient')}`, Math.max(0, 64 - klientVek), prodKapKlient);
  if (hasPartner) tryAdd('zabPartner', `${t('ciele.zabezpeceniePrijmu')} – ${partner.meno || t('aof.partner')}`, Math.max(0, 64 - partnerVek), prodKapPartner);
  // Rezerva
  tryAdd('rezerva', t('ciele.rezerva'), 5, rezerva);
  // Renta
  tryAdd('rentaKlient20', `${t('ciele.renta')} ${klient.meno || t('aof.klient')}`, Math.max(0, 64 - klientVek), prodKapKlient);
  if (hasPartner) tryAdd('rentaPartner20', `${t('ciele.renta')} ${partner.meno || t('aof.partner')}`, Math.max(0, 64 - partnerVek), prodKapPartner);
  // Predčasná renta
  if (aofCiele.predcasnaRentaKlientCheckbox) {
    const h = num(aofCiele.predcasnaRentaKlientVek) > 0 ? Math.max(0, num(aofCiele.predcasnaRentaKlientVek) - klientVek) : 0;
    tryAdd('predRentaKlient', `${t('ciele.predcasnaRenta')} – ${klient.meno}`, h, num(aofCiele.predcasnaRentaKlientVyska) * 12 * 20);
  }
  if (aofCiele.predcasnaRentaPartnerCheckbox) {
    const h = num(aofCiele.predcasnaRentaPartnerVek) > 0 ? Math.max(0, num(aofCiele.predcasnaRentaPartnerVek) - partnerVek) : 0;
    tryAdd('predRentaPartner', `${t('ciele.predcasnaRenta')} – ${partner.meno}`, h, num(aofCiele.predcasnaRentaPartnerVyska) * 12 * 20);
  }
  // Rezerva MD
  if (aofCiele.rezervaMDCheckbox) {
    tryAdd('rezervaMD', t('ciele.rezervaMD'), num(aofCiele.rezervaMDRoky) || 1, num(aofCiele.rezervaMDRenta) * num(aofCiele.rezervaMDDoba) * 12);
  }
  // Bývanie
  if (aofCiele.byvanieCheckbox) {
    tryAdd('byvanie', aofCiele.byvanieNazov || t('ciele.byvanie'), num(aofCiele.byvanieSplatnost), num(aofCiele.byvanieNesplatenyDiel), byvanieSplatka);
  }
  // Deti
  deti.filter(d => d.cielSuma).forEach(d => {
    const h = (d.cielDoVeku && d.vek) ? Number(d.cielDoVeku) - Number(d.vek) : 0;
    tryAdd(`dite_${d.id}`, d.meno || t('ciele.dieta'), h, num(d.cielSuma));
  });
  // Iné ciele
  aofCiele.ineCiele.filter(c => c.checked).forEach(c => {
    tryAdd(`ciel_${c.id}`, c.nazov, num(c.horizont), num(c.hodnota));
  });

  // Sort by priority
  selectedGoals.sort((a, b) => {
    const pA = Object.entries(priorities).find(([, v]) => v > 0 && selectedGoals.indexOf(a) >= 0)?.[1] || 999;
    const pB = Object.entries(priorities).find(([, v]) => v > 0 && selectedGoals.indexOf(b) >= 0)?.[1] || 999;
    return pA - pB;
  });

  const totalMesacne = selectedGoals.reduce((s, g) => s + g.mesacne, 0);
  const totalSuma = selectedGoals.reduce((s, g) => s + g.suma, 0);

  const fmt = (v: number) => v > 0 ? `${Math.round(v).toLocaleString('sk-SK')} €` : '0 €';

  // ── Ideálne finančné miery ───────────────────────────────────────────────
  const optSpotreba = 55; const optUvery = 10; const optMajetok = 15; const optRezerva = 20;
  const sucSpotreba = totalPrijmy > 0 ? Math.round((spotrebaMes / totalPrijmy) * 100) : 0;
  const sucUvery = totalPrijmy > 0 ? Math.round((num(cashFlow.uverySplatka) / totalPrijmy) * 100) : 0;
  const sucMajetok = totalPrijmy > 0 ? Math.round(((num(cashFlow.sporeniaSplatka) + num(cashFlow.investicieSplatka) + num(cashFlow.poistZivotSplatka)) / totalPrijmy) * 100) : 0;
  const sucRezerva = totalPrijmy > 0 ? Math.round((rozdiel / totalPrijmy) * 100) : 0;

  // ── Export / Import ──────────────────────────────────────────────────────
  const handleExportJSON = () => {
    const { setKlient, setPartner, setHasPartner, setHasDeti, setDeti, setMajetok, setCashFlow, setAofCiele, setJazyk, loadVzoroveData, resetNovyPlan, ...data } = state;
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
        // Validate required fields
        if (!data.klient || !data.cashFlow) {
          alert(t('vystup.importError') || 'Neplatný súbor – chýbajú povinné polia.');
          return;
        }
        // Load data while preserving current language
        const currentLang = state.jazyk;
        // Apply all data fields
        state.setKlient(data.klient);
        if (data.partner) state.setPartner(data.partner);
        if (data.hasPartner !== undefined) state.setHasPartner(data.hasPartner);
        if (data.hasDeti !== undefined) state.setHasDeti(data.hasDeti);
        if (data.deti) state.setDeti(data.deti);
        if (data.majetok) state.setMajetok(data.majetok);
        state.setCashFlow(data.cashFlow);
        if (data.aofCiele) state.setAofCiele(data.aofCiele);
        state.setJazyk(data.jazyk || currentLang);
        alert(t('vystup.importSuccess') || `Dáta "${data.klient.meno}" úspešne načítané.`);
      } catch (err) {
        alert(t('vystup.importError') || 'Chyba pri čítaní súboru.');
      }
    };
    inp.click();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-20 print:pb-2 print:gap-4">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-4 print:pb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3 flex items-center gap-2">
            {t('vystup.title')}
          </h2>
          <p className="text-sm font-bold text-[#4D4D4D] dark:text-[#989FA7] mt-2 ml-4">
            {t('vystup.subtitle')}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={handleImportJSON} className="bg-white dark:bg-[#2A2A2A] text-[#171717] dark:text-white border border-[#D1D1D1] dark:border-[#4D4D4D] px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-[#EAEAEA] dark:hover:bg-[#333] transition text-xs">
            <Upload size={14} /> {t('vystup.importJson')}
          </button>
          <button onClick={handleExportJSON} className="bg-white dark:bg-[#2A2A2A] text-[#171717] dark:text-white border border-[#D1D1D1] dark:border-[#4D4D4D] px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-[#EAEAEA] dark:hover:bg-[#333] transition text-xs">
            <Download size={14} /> {t('vystup.exportJson')}
          </button>
          <button onClick={() => window.print()} className="bg-[#AB0534] text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-[#8A042A] transition text-xs">
            <Printer size={14} /> {t('vystup.print')}
          </button>
        </div>
      </div>

      {/* ── PROFIL RODINY ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
        <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold text-sm px-4 py-2 uppercase tracking-wider">
          {t('vystup.profilRodiny')}
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 text-xs">
          {/* Klient */}
          <div className="space-y-1.5">
            <div className="font-extrabold text-[#AB0534] uppercase mb-1">{t('aof.klient')}</div>
            <div className="flex justify-between"><span className="text-[#4D4D4D] dark:text-[#989FA7]">{t('aof.meno')}</span><span className="font-bold">{klient.meno || '–'}</span></div>
            <div className="flex justify-between"><span className="text-[#4D4D4D] dark:text-[#989FA7]">{t('aof.vek')}</span><span className="font-bold">{klient.vekPos || '–'}</span></div>
            <div className="flex justify-between"><span className="text-[#4D4D4D] dark:text-[#989FA7]">{t('aof.cisty')}</span><span className="font-bold">{fmt(num(klient.cistyMesacne))} / {t('aof.mesacne')}</span></div>
            <div className="flex justify-between"><span className="text-[#4D4D4D] dark:text-[#989FA7]">{t('aof.pasivny')}</span><span className="font-bold">{fmt(num(klient.pasivnyMesacne))}</span></div>
          </div>
          {/* Partner */}
          {hasPartner && (
            <div className="space-y-1.5">
              <div className="font-extrabold text-[#AB0534] uppercase mb-1">{t('aof.partner')}</div>
              <div className="flex justify-between"><span className="text-[#4D4D4D] dark:text-[#989FA7]">{t('aof.meno')}</span><span className="font-bold">{partner.meno || '–'}</span></div>
              <div className="flex justify-between"><span className="text-[#4D4D4D] dark:text-[#989FA7]">{t('aof.vek')}</span><span className="font-bold">{partner.vekPos || '–'}</span></div>
              <div className="flex justify-between"><span className="text-[#4D4D4D] dark:text-[#989FA7]">{t('aof.cisty')}</span><span className="font-bold">{fmt(num(partner.cistyMesacne))} / {t('aof.mesacne')}</span></div>
              <div className="flex justify-between"><span className="text-[#4D4D4D] dark:text-[#989FA7]">{t('aof.pasivny')}</span><span className="font-bold">{fmt(num(partner.pasivnyMesacne))}</span></div>
            </div>
          )}
          {/* Deti */}
          {deti.length > 0 && (
            <div className="col-span-2 border-t border-[#D1D1D1] dark:border-[#333] pt-2 mt-1">
              <div className="font-extrabold text-[#AB0534] uppercase mb-1">{t('aof.deti')} ({deti.length})</div>
              <div className="flex gap-4 flex-wrap text-xs">
                {deti.map(d => (
                  <span key={d.id} className="bg-[#EAEAEA] dark:bg-[#222] px-2 py-1 rounded">{d.meno || '–'} ({d.vek || '?'}r)</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MESAČNÝ CASH FLOW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm p-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#989FA7] mb-1">{t('aof.prijmy')}</div>
          <div className="text-2xl font-extrabold text-[#166E36]">{fmt(totalPrijmy)}</div>
          <div className="text-[10px] text-[#989FA7]">/ {t('aof.mesacne')}</div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm p-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#989FA7] mb-1">{t('aof.vydavky')}</div>
          <div className="text-2xl font-extrabold text-[#AB0534]">{fmt(totalVydavky)}</div>
          <div className="text-[10px] text-[#989FA7]">/ {t('aof.mesacne')}</div>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 text-center ${rozdiel >= 0 ? 'bg-[#e8f5e9] dark:bg-[#0d2e0d] border-[#a5d6a7] dark:border-[#2e7d32]' : 'bg-[#ffebee] dark:bg-[#2e0d0d] border-[#ef9a9a] dark:border-[#c62828]'}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#989FA7] mb-1">{t('aof.rozdiel')}</div>
          <div className={`text-2xl font-extrabold ${rozdiel >= 0 ? 'text-[#166E36]' : 'text-[#AB0534]'}`}>{fmt(rozdiel)}</div>
          <div className="text-[10px] text-[#989FA7]">/ {t('aof.mesacne')}</div>
        </div>
      </div>

      {/* ── MAJETOK ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
        <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold text-sm px-4 py-2 uppercase tracking-wider">
          {t('aof.majetokTitle')}
        </div>
        <div className="p-4 grid grid-cols-4 gap-4 text-center text-xs">
          <div>
            <div className="text-[10px] font-bold text-[#989FA7] uppercase mb-1">{t('aof.fyzicky')}</div>
            <div className="text-lg font-extrabold">{fmt(fyzickyMajetok)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#989FA7] uppercase mb-1">{t('aof.financny')}</div>
            <div className="text-lg font-extrabold">{fmt(financnyMajetok)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#989FA7] uppercase mb-1">{t('aof.pasiva')}</div>
            <div className="text-lg font-extrabold text-[#AB0534]">{fmt(pasiva)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#989FA7] uppercase mb-1">{t('aof.cistaHodnota')}</div>
            <div className={`text-lg font-extrabold ${cistaMajetok >= 0 ? 'text-[#166E36]' : 'text-[#AB0534]'}`}>{fmt(cistaMajetok)}</div>
          </div>
        </div>
      </div>

      {/* ── IDEÁLNE FINANČNÉ MIERY ────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
        <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold text-sm px-4 py-2 uppercase tracking-wider">
          {t('aof.idealneMiery')}
        </div>
        <div className="p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-[#989FA7] uppercase">
                <th className="text-left py-1 w-1/3"></th>
                <th className="text-center">{t('aof.optimal')}</th>
                <th className="text-center">{t('aof.sucasne')}</th>
                <th className="text-center w-1/3"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: t('aof.spotrebaSpolu'), opt: optSpotreba, suc: sucSpotreba, color: '#4D4D4D' },
                { label: t('aof.uveroveSpolu'), opt: optUvery, suc: sucUvery, color: '#AB0534' },
                { label: t('aof.tvorbaSpolu'), opt: optMajetok, suc: sucMajetok, color: '#1E5083' },
                { label: t('aof.zostatokUcet'), opt: optRezerva, suc: sucRezerva, color: '#166E36' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#EAEAEA] dark:border-[#333]">
                  <td className="py-2 font-bold">{row.label}</td>
                  <td className="py-2 text-center font-bold">{row.opt} %</td>
                  <td className="py-2 text-center font-extrabold" style={{ color: row.color }}>{row.suc} %</td>
                  <td className="py-2 px-2">
                    <div className="w-full bg-[#EAEAEA] dark:bg-[#333] rounded-full h-3 relative">
                      <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: row.color, width: `${Math.min(100, row.opt)}%` }} />
                      <div className="h-3 rounded-full transition-all" style={{ backgroundColor: row.color, width: `${Math.min(100, Math.abs(row.suc))}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PRIORITNÉ CIELE ───────────────────────────────────────────── */}
      {selectedGoals.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm overflow-hidden">
          <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold text-sm px-4 py-2 uppercase tracking-wider">
            {t('vystup.prioritneCiele')}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#EAEAEA] dark:bg-[#222] text-[10px] font-bold uppercase text-[#4D4D4D] dark:text-[#989FA7]">
                <th className="px-3 py-2 text-left w-8">#</th>
                <th className="px-3 py-2 text-left">{t('ciele.ciel')}</th>
                <th className="px-3 py-2 text-center">{t('ciele.casovyHorizont')}</th>
                <th className="px-3 py-2 text-right">{t('ciele.potrebnaSuma')}</th>
                <th className="px-3 py-2 text-right">{t('ciele.mesacnaPlatba')}</th>
              </tr>
            </thead>
            <tbody>
              {selectedGoals.map((g, i) => (
                <tr key={i} className={`border-b border-[#EAEAEA] dark:border-[#333] ${i % 2 === 0 ? '' : 'bg-[#FAFAFA] dark:bg-[#151515]'}`}>
                  <td className="px-3 py-2 font-extrabold text-[#AB0534]">{i + 1}</td>
                  <td className="px-3 py-2 font-bold">{g.nazov}</td>
                  <td className="px-3 py-2 text-center">{g.horizont > 0 ? `${g.horizont} r.` : '–'}</td>
                  <td className="px-3 py-2 text-right font-bold">{g.suma > 0 ? fmt(g.suma) : '–'}</td>
                  <td className="px-3 py-2 text-right font-extrabold text-[#166E36]">{g.mesacne > 0 ? fmt(g.mesacne) : '–'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#DCDCDC] dark:bg-[#2A2A2A] font-extrabold text-sm">
                <td colSpan={3} className="px-3 py-2 text-right">{t('ciele.celkom')}</td>
                <td className="px-3 py-2 text-right">{fmt(totalSuma)}</td>
                <td className="px-3 py-2 text-right text-[#166E36]">{fmt(totalMesacne)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── ZÁVER ────────────────────────────────────────────────────── */}
      <div className="bg-[#FAFAFA] dark:bg-[#111111] p-6 rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] text-center text-xs text-[#989FA7] print:hidden">
        <p>{t('vystup.footer')}</p>
      </div>

    </div>
  );
}
