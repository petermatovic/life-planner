'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Trash2, CheckSquare, Square } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const InputRow = ({ label, value, onChange, placeholder = "" }: any) => (
  <div className="flex justify-between items-center mb-1">
    <label className="text-[11px] font-bold text-[#171717] dark:text-[#ededed] whitespace-nowrap mr-2">{label}</label>
    <input type="text" value={value || ''} onChange={onChange} placeholder={placeholder} className="w-2/3 px-2 py-0.5 rounded bg-white dark:bg-[#111] border border-[#D1D1D1] dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-xs text-right text-[#171717] dark:text-[#ededed]" />
  </div>
);

const DualInputRow = ({ label, labelA, valA, onChangeA, labelB, valB, onChangeB }: any) => (
  <div className="mb-2">
    <label className="text-[11px] font-bold text-[#171717] dark:text-[#ededed] block">{label}</label>
    <div className="flex gap-2">
      <div className="flex-1 flex items-center justify-between"><span className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] mr-1">{labelA}</span><input type="number" value={valA || ''} onChange={onChangeA} className="w-2/3 px-2 py-0.5 rounded bg-white dark:bg-[#111] border border-[#D1D1D1] dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-xs text-right" /></div>
      <div className="flex-1 flex items-center justify-between"><span className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] mr-1">{labelB}</span><input type="number" value={valB || ''} onChange={onChangeB} className="w-2/3 px-2 py-0.5 rounded bg-white dark:bg-[#111] border border-[#D1D1D1] dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-xs text-right" /></div>
    </div>
  </div>
);

export default function TabAOF() {
  const { t } = useTranslation();
  const {
    klient, partner, hasPartner, deti, hasDeti, majetok, cashFlow,
    setKlient, setPartner, setHasPartner, setDeti, setHasDeti, setMajetok, setCashFlow,
    aofCiele, setAofCiele
  } = useAppStore();

  const num = (v: any) => Number(v) || 0;

  const prijemMesacne = num(klient.cistyMesacne) + num(klient.pasivnyMesacne) + (hasPartner ? num(partner.cistyMesacne) + num(partner.pasivnyMesacne) : 0);
  const prijemRocne = num(klient.cistyRocne) + num(klient.pasivnyRocne) + (hasPartner ? num(partner.cistyRocne) + num(partner.pasivnyRocne) : 0);
  const totalPrijmy = prijemMesacne + (prijemRocne / 12);

  const spotreba = num(cashFlow.spotrebaMesacne) + (num(cashFlow.spotrebaRocne) / 12);
  const uvery = num(cashFlow.uverySplatka);
  const sporenia = num(cashFlow.sporeniaSplatka);
  const investicie = num(cashFlow.investicieSplatka);
  const poistZivot = num(cashFlow.poistZivotSplatka);
  const poistNezivot = num(cashFlow.poistNezivotMesacne) + (num(cashFlow.poistNezivotRocne) / 12);
  const totalVydavky = spotreba + uvery + sporenia + investicie + poistZivot + poistNezivot;
  const rozdiel = totalPrijmy - totalVydavky;

  const majetokFyzicky = majetok.reduce((sum, m) => sum + num(m.hodnota), 0);
  const majetokFinancny = num(cashFlow.sporeniaZostatok) + num(cashFlow.investicieZostatok) + num(cashFlow.poistZivotZostatok);
  const majetokPasiva = num(cashFlow.uveryZostatok);
  const cistaHodnota = majetokFyzicky + majetokFinancny - majetokPasiva;

  // ZĂˇkladnĂ© ciele vĂ˝poÄŤty
  const vypocitanaRezerva = totalPrijmy * 6;
  const klientPrijemSpolu = num(klient.cistyMesacne) + num(klient.cistyRocne) / 12;
  const partnerPrijemSpolu = num(partner.cistyMesacne) + num(partner.cistyRocne) / 12;
  const klientVek = num(klient.vekPos);
  const partnerVek = num(partner.vekPos);
  const vypocitanyProdukcnyKapitalKlient = klientPrijemSpolu > 0 ? klientPrijemSpolu * 12 * Math.max(0, 64 - klientVek) : 0;
  const vypocitanyProdukcnyKapitalPartner = partnerPrijemSpolu > 0 ? partnerPrijemSpolu * 12 * Math.max(0, 64 - partnerVek) : 0;
  const vypocitanaDavkaSofiKlient = klientPrijemSpolu * 0.40;
  const vypocitanaDavkaSofiPartner = partnerPrijemSpolu * 0.40;

  const optSpotreba = totalPrijmy * 0.40;
  const optUvery = totalPrijmy * 0.30;
  const optMajetok = totalPrijmy * 0.20;
  const optRezerva = totalPrijmy * 0.10;
  const sucSpotreba = spotreba;
  const sucUvery = uvery;
  const sucMajetok = sporenia + investicie + poistZivot;
  const sucRezerva = rozdiel;

  const calcPmt = (suma: number | '', rocky: number | '', urok: number | '') => {
    if (!suma || !rocky || !urok) return 0;
    const r = (Number(urok) / 100) / 12;
    const n = Number(rocky) * 12;
    return (Number(suma) * r) / (1 - Math.pow(1 + r, -n));
  };
  const byvanieSplatka = calcPmt(aofCiele.byvanieSumaUveru, aofCiele.byvanieSplatnost, aofCiele.byvanieUrok);

  const chartData = [
    { name: t('aof.optimal'), Spotreba: optSpotreba, 'Ăšvery': optUvery, Tvorba: optMajetok, Rezerva: optRezerva },
    { name: t('aof.sucasne'), Spotreba: sucSpotreba, 'Ăšvery': sucUvery, Tvorba: sucMajetok, Rezerva: sucRezerva },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">

      {/* TOP ROW: Klient / Partner / Deti + Majetok */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

        {/* KLIENT */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-3 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
          <h2 className="font-extrabold text-xs uppercase mb-2 tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 text-[#171717] dark:text-white">{t('aof.klient')}</h2>
          <div className="flex gap-2">
            <div className="flex-[3]"><InputRow label={t('aof.meno')} value={klient.meno} onChange={(e: any) => setKlient({ meno: e.target.value })} /></div>
            <div className="flex-1"><InputRow label={t('aof.vek')} value={klient.vekPos} onChange={(e: any) => setKlient({ vekPos: Number(e.target.value) || '' })} /></div>
          </div>
          <InputRow label={t('aof.hruby')} value={klient.hruby} onChange={(e: any) => setKlient({ hruby: Number(e.target.value) || '' })} />
          <DualInputRow label={t('aof.cisty')} labelA={t('aof.mesacne')} valA={klient.cistyMesacne} onChangeA={(e: any) => setKlient({ cistyMesacne: Number(e.target.value) || '' })} labelB={t('aof.rocne')} valB={klient.cistyRocne} onChangeB={(e: any) => setKlient({ cistyRocne: Number(e.target.value) || '' })} />
          <DualInputRow label={t('aof.pasivny')} labelA={t('aof.mesacne')} valA={klient.pasivnyMesacne} onChangeA={(e: any) => setKlient({ pasivnyMesacne: Number(e.target.value) || '' })} labelB={t('aof.rocne')} valB={klient.pasivnyRocne} onChangeB={(e: any) => setKlient({ pasivnyRocne: Number(e.target.value) || '' })} />
        </div>

        {/* PARTNER */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-3 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
          <div className="flex items-center gap-2 mb-2 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 cursor-pointer" onClick={() => setHasPartner(!hasPartner)}>
            {hasPartner ? <CheckSquare size={14} className="text-[#171717] dark:text-white" /> : <Square size={14} className="text-[#989FA7]" />}
            <h2 className={`font-extrabold text-xs uppercase tracking-wide ${!hasPartner && 'text-[#989FA7]'}`}>{t('aof.partner')}</h2>
          </div>
          <div className={`transition-opacity ${!hasPartner && 'opacity-50 pointer-events-none'}`}>
            <div className="flex gap-2">
              <div className="flex-[3]"><InputRow label={t('aof.meno')} value={partner.meno} onChange={(e: any) => setPartner({ meno: e.target.value })} /></div>
              <div className="flex-1"><InputRow label={t('aof.vek')} value={partner.vekPos} onChange={(e: any) => setPartner({ vekPos: Number(e.target.value) || '' })} /></div>
            </div>
            <InputRow label={t('aof.hruby')} value={partner.hruby} onChange={(e: any) => setPartner({ hruby: Number(e.target.value) || '' })} />
            <DualInputRow label={t('aof.cisty')} labelA={t('aof.mesacne')} valA={partner.cistyMesacne} onChangeA={(e: any) => setPartner({ cistyMesacne: Number(e.target.value) || '' })} labelB={t('aof.rocne')} valB={partner.cistyRocne} onChangeB={(e: any) => setPartner({ cistyRocne: Number(e.target.value) || '' })} />
            <DualInputRow label={t('aof.pasivny')} labelA={t('aof.mesacne')} valA={partner.pasivnyMesacne} onChangeA={(e: any) => setPartner({ pasivnyMesacne: Number(e.target.value) || '' })} labelB={t('aof.rocne')} valB={partner.pasivnyRocne} onChangeB={(e: any) => setPartner({ pasivnyRocne: Number(e.target.value) || '' })} />
          </div>
        </div>

        {/* DETI + MAJETOK */}
        <div className="flex flex-col gap-3">
          <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded p-2 border border-[#ECEDED] dark:border-[#2A2A2A] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => setHasDeti(!hasDeti)}>
                {hasDeti ? <CheckSquare size={12} className="text-[#171717] dark:text-white" /> : <Square size={12} className="text-[#989FA7]" />}
                <h2 className="font-extrabold text-[10px] uppercase tracking-wide">{t('aof.deti')}</h2>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">{t('aof.pocet')} <span className="bg-white px-1.5 py-0.5 border rounded">{deti.length}</span></div>
            </div>
            <div className={`transition-opacity text-[10px] ${!hasDeti && 'opacity-50 pointer-events-none'}`}>
              <div className="space-y-1 overflow-auto max-h-[70px] mb-1">
                {deti.map((d) => (
                  <div key={d.id} className="flex gap-1 items-center">
                    <input type="text" value={d.meno || ''} onChange={(e) => setDeti(deti.map(x => x.id === d.id ? { ...x, meno: e.target.value } : x))} placeholder={t('aof.meno')} className="w-1/2 p-0.5 px-1 border bg-white dark:bg-[#111]" />
                    <input type="number" value={d.vek || ''} placeholder={t('aof.vek')} onChange={(e: any) => setDeti(deti.map(x => x.id === d.id ? { ...x, vek: Number(e.target.value) || '' } : x))} className="w-1/3 p-0.5 px-1 border bg-white dark:bg-[#111]" />
                    <button onClick={() => setDeti(deti.filter(x => x.id !== d.id))} className="text-[#AB0534]"><Trash2 size={10} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setDeti([...deti, { id: Date.now(), vek: '' }])} className="w-full text-center border-dashed border py-0.5 text-[#989FA7] bg-white dark:bg-[#111]">{t('aof.pridat')}</button>
            </div>
          </div>

          <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded p-2 border border-[#ECEDED] dark:border-[#2A2A2A] shadow-sm flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-extrabold text-[10px] uppercase tracking-wide">{t('aof.majetok')}</h2>
              <button className="text-[9px] font-bold" onClick={() => setMajetok([...majetok, { id: Date.now(), nazov: 'Byt', typ: 'FyzickĂ˝', hodnota: '' }])}>{t('aof.pridat')}</button>
            </div>
            <div className="space-y-1 overflow-auto max-h-[80px]">
              {majetok.map(m => (
                <div key={m.id} className="flex gap-1 items-center">
                  <select value={m.nazov} onChange={(e) => setMajetok(majetok.map(x => x.id === m.id ? { ...x, nazov: e.target.value } : x))} className="w-1/2 text-[10px] border px-1 bg-white dark:bg-[#111]">
                    <option>Byt</option><option>Dom</option><option>Auto</option><option>InĂ©</option>
                  </select>
                  <input type="number" value={m.hodnota} placeholder={t('aof.aktualnaHodnota')} onChange={(e) => setMajetok(majetok.map(x => x.id === m.id ? { ...x, hodnota: Number(e.target.value) || '' } : x))} className="w-1/3 text-[10px] border px-1 text-right bg-white dark:bg-[#111]" />
                  <button onClick={() => setMajetok(majetok.filter(x => x.id !== m.id))} className="text-[#AB0534]"><Trash2 size={10} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CASH FLOW + SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* INPUTS CASHFLOW */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm text-xs">
          <h2 className="font-extrabold text-sm uppercase tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 mb-2">{t('aof.cashflow')}</h2>
          <div className="flex justify-between font-bold text-[10px] text-center mb-1 pr-[10px]"><div className="w-[30%]"></div><div className="w-[30%]">{t('aof.mesacne')}</div><div className="w-[30%]">{t('aof.rocne')}</div></div>
          <div className="flex justify-between items-center mb-2"><div className="w-[30%] font-bold">{t('aof.spotreba')}</div><input value={cashFlow.spotrebaMesacne} onChange={(e) => setCashFlow({ spotrebaMesacne: Number(e.target.value) || '' })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /><input value={cashFlow.spotrebaRocne} onChange={(e) => setCashFlow({ spotrebaRocne: Number(e.target.value) || '' })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /></div>

          <div className="flex justify-between font-bold text-[10px] text-center mb-1 pr-[10px] mt-3"><div className="w-[30%]">{t('aof.financneVydavky')}</div><div className="w-[30%]">{t('aof.mesacnaSplatka')}</div><div className="w-[30%]">{t('aof.zostatok')}</div></div>
          <div className="flex justify-between items-center mb-1"><div className="w-[30%]">{t('aof.uvery')}</div><input type="number" value={cashFlow.uverySplatka} onChange={e => setCashFlow({ uverySplatka: Number(e.target.value) })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /><input type="number" value={cashFlow.uveryZostatok} onChange={e => setCashFlow({ uveryZostatok: Number(e.target.value) })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /></div>

          <div className="flex justify-between font-bold text-[10px] text-center mb-1 pr-[10px] mt-2"><div className="w-[30%]"></div><div className="w-[30%]">{t('aof.mesacnaSplatka')}</div><div className="w-[30%]">{t('aof.aktualnaHodnota')}</div></div>
          <div className="flex justify-between items-center mb-1"><div className="w-[30%]">{t('aof.sporenia')}</div><input type="number" value={cashFlow.sporeniaSplatka} onChange={e => setCashFlow({ sporeniaSplatka: Number(e.target.value) })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /><input type="number" value={cashFlow.sporeniaZostatok} onChange={e => setCashFlow({ sporeniaZostatok: Number(e.target.value) })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /></div>
          <div className="flex justify-between items-center mb-1"><div className="w-[30%]">{t('aof.investicie')}</div><input type="number" value={cashFlow.investicieSplatka} onChange={e => setCashFlow({ investicieSplatka: Number(e.target.value) })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /><input type="number" value={cashFlow.investicieZostatok} onChange={e => setCashFlow({ investicieZostatok: Number(e.target.value) })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /></div>
          <div className="flex justify-between items-center mb-2"><div className="w-[30%]">{t('aof.poistenieZivot')}</div><input type="number" value={cashFlow.poistZivotSplatka} onChange={e => setCashFlow({ poistZivotSplatka: Number(e.target.value) })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /><input type="number" value={cashFlow.poistZivotZostatok} onChange={e => setCashFlow({ poistZivotZostatok: Number(e.target.value) })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /></div>

          <div className="flex justify-between font-bold text-[10px] text-center mb-1 pr-[10px] mt-2"><div className="w-[30%]"></div><div className="w-[30%]">{t('aof.mesacne')}</div><div className="w-[30%]">{t('aof.rocne')}</div></div>
          <div className="flex justify-between items-center mb-3"><div className="w-[30%]">{t('aof.poistenieNezivot')}</div><input value={cashFlow.poistNezivotMesacne} onChange={(e) => setCashFlow({ poistNezivotMesacne: Number(e.target.value) || '' })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /><input value={cashFlow.poistNezivotRocne} onChange={(e) => setCashFlow({ poistNezivotRocne: Number(e.target.value) || '' })} className="w-[30%] px-1 border text-right bg-white dark:bg-[#111]" /></div>

          <div className="flex justify-between items-center font-bold pb-2 pt-2 border-t border-[#D1D1D1] dark:border-[#4D4D4D]">
            <div className="w-[30%]">{t('aof.zostatokUcet')}</div>
            <div className="w-[50%] flex justify-end"><input type="number" value={cashFlow.zostatokUcet} onChange={(e) => setCashFlow({ zostatokUcet: Number(e.target.value) })} className="w-[60%] px-2 border text-right bg-white dark:bg-[#111]" /></div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm text-xs font-bold">
            <h2 className="font-extrabold text-sm uppercase tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 mb-2">{t('aof.mesacnyCashflowTitle')}</h2>
            <div className="flex justify-between py-1"><span>{t('aof.prijmy')}</span> <span className="bg-white dark:bg-[#333] px-2 border">{totalPrijmy.toFixed(0)} â‚¬</span></div>
            <div className="flex justify-between py-1"><span>{t('aof.vydavky')}</span> <span className="bg-white dark:bg-[#333] px-2 border">{totalVydavky.toFixed(0)} â‚¬</span></div>
            <div className="flex justify-between py-1"><span>{t('aof.rozdiel')}</span> <span className="bg-white dark:bg-[#333] px-2 border">{rozdiel.toFixed(0)} â‚¬</span></div>
            <h2 className="font-extrabold text-sm uppercase tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 mt-4 mb-2">{t('aof.majetokTitle')}</h2>
            <div className="flex justify-between py-1"><span>{t('aof.fyzicky')}</span> <span className="bg-white dark:bg-[#333] px-2 border">{majetokFyzicky.toFixed(0)} â‚¬</span></div>
            <div className="flex justify-between py-1"><span>{t('aof.financny')}</span> <span className="bg-white dark:bg-[#333] px-2 border">{majetokFinancny.toFixed(0)} â‚¬</span></div>
            <div className="flex justify-between py-1"><span>{t('aof.pasiva')}</span> <span className="bg-white dark:bg-[#333] px-2 border">{majetokPasiva.toFixed(0)} â‚¬</span></div>
            <div className="flex justify-between py-2 mt-2 border-t border-[#D1D1D1] dark:border-[#4D4D4D] text-sm font-extrabold"><span>{t('aof.cistaHodnota')}</span> <span className="bg-white dark:bg-[#333] px-2 border">{cistaHodnota.toFixed(0)} â‚¬</span></div>
          </div>

          <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm text-xs relative flex flex-col xl:flex-row gap-6">
            <div className="flex-1 min-h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#989FA7' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `${val} â‚¬`} tick={{ fontSize: 10, fill: '#989FA7' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff' }} formatter={(value: any) => `${Number(value).toFixed(0)} â‚¬`} />
                  <Bar dataKey="Spotreba" stackId="a" fill="#1E5083" />
                  <Bar dataKey="Ăšvery" stackId="a" fill="#E06138" />
                  <Bar dataKey="Tvorba" stackId="a" fill="#166E36" />
                  <Bar dataKey="Rezerva" stackId="a" fill="#009EDC"><LabelList dataKey="name" position="insideTop" fill="#fff" fontSize={0} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-[1.5] flex flex-col justify-center">
              <h2 className="font-extrabold text-sm uppercase tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 mb-2">{t('aof.idealneMiery')}</h2>
              <div className="grid grid-cols-4 text-[10px] font-bold text-center mb-1"><div></div><div>{t('aof.optimal')}</div><div>{t('aof.sucasne')}</div><div>{t('aof.rozdiel')}</div></div>
              <div className="space-y-1">
                {[
                  { pct: '40%', label: t('aof.spotrebaSpolu').replace('Spolu ', ''), color: '#1E5083', opt: optSpotreba, suc: sucSpotreba },
                  { pct: '30%', label: t('aof.uveroveSpolu').replace('Spolu ', ''), color: '#E06138', opt: optUvery, suc: sucUvery },
                  { pct: '20%', label: t('aof.tvorbaSpolu').replace('Spolu ', ''), color: '#166E36', opt: optMajetok, suc: sucMajetok },
                  { pct: '10%', label: 'Rezerva', color: '#009EDC', opt: optRezerva, suc: sucRezerva },
                ].map(row => (
                  <div key={row.pct} className="grid grid-cols-4 items-center bg-white dark:bg-[#333] border p-1 rounded font-bold">
                    <div className="flex items-center gap-1"><span className="border text-[9px] px-0.5 bg-white dark:bg-[#111]" style={{ borderColor: row.color }}>{row.pct}</span> {row.label}</div>
                    <div className="text-right px-1">{row.opt.toFixed(0)} â‚¬</div>
                    <div className="text-right px-1">{row.suc.toFixed(0)} â‚¬</div>
                    <div className="text-right px-1 text-[#AB0534]">{(row.opt - row.suc).toFixed(0)} â‚¬</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CIELE */}
      <div className="mt-8 flex flex-col gap-4 text-xs">
        <div className="bg-[#808080] dark:bg-[#4D4D4D] text-white text-center font-bold py-1 uppercase tracking-wider">{t('aof.zakladneCiele')}</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ZĂKLADNĂ‰ CIELE - Ä˝AVĂť STÄąPEC */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-[#EAEAEA] dark:bg-[#1A1A1A] p-2 rounded shadow-sm border border-[#D1D1D1] dark:border-[#333]">
              <span className="font-extrabold w-1/3">{t('aof.rezerva')}</span>
              <input type="text" readOnly value={vypocitanaRezerva > 0 ? `${vypocitanaRezerva.toFixed(0)} â‚¬` : ''} className="w-2/3 border px-2 text-center bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA]" placeholder="23 950 â‚¬" />
            </div>

            <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] p-2 rounded shadow-sm border border-[#D1D1D1] dark:border-[#333]">
              <div className="grid grid-cols-3 font-extrabold mb-1"><div className="col-span-1">{t('aof.zabezpeceniePrijmu')}</div><div className="text-center">{t('aof.klient')}</div><div className="text-center">{t('aof.partner')}</div></div>
              <div className="grid grid-cols-3 items-center mb-1">
                <div className="font-bold">{t('aof.produkcnyKapital')}</div>
                <input type="text" readOnly value={vypocitanyProdukcnyKapitalKlient > 0 ? `${vypocitanyProdukcnyKapitalKlient.toFixed(0)} â‚¬` : ''} className="border mx-1 px-1 text-center bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA]" />
                <input type="text" readOnly value={vypocitanyProdukcnyKapitalPartner > 0 ? `${vypocitanyProdukcnyKapitalPartner.toFixed(0)} â‚¬` : ''} className="border mx-1 px-1 text-center bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA]" />
              </div>
              <div className="grid grid-cols-3 items-center mb-1">
                <div className="font-bold">{t('aof.renta')}</div>
                <input type="number" value={aofCiele.zabezpecenieKlientRenta || ''} onChange={e => setAofCiele({ zabezpecenieKlientRenta: Number(e.target.value) })} className="border mx-1 px-1 text-center bg-white dark:bg-[#111]" />
                <input type="number" value={aofCiele.zabezpeceniePartnerRenta || ''} onChange={e => setAofCiele({ zabezpeceniePartnerRenta: Number(e.target.value) })} className="border mx-1 px-1 text-center bg-white dark:bg-[#111]" />
              </div>
              <div className="grid grid-cols-3 items-center mb-2">
                <div className="text-right pr-2">{t('aof.naDobu')}</div>
                <div className="mx-1"><select value={aofCiele.zabezpecenieKlientRentaRoky} onChange={e => setAofCiele({ zabezpecenieKlientRentaRoky: e.target.value })} className="border w-full px-1 text-center bg-white dark:bg-[#111] py-1"><option value="20-roÄŤnĂˇ">20-roÄŤnĂˇ</option><option value="doĹľivotnĂˇ">doĹľivotnĂˇ</option></select></div>
                <div className="mx-1"><select value={aofCiele.zabezpeceniePartnerRentaRoky} onChange={e => setAofCiele({ zabezpeceniePartnerRentaRoky: e.target.value })} className="border w-full px-1 text-center bg-white dark:bg-[#111] py-1"><option value="20-roÄŤnĂˇ">20-roÄŤnĂˇ</option><option value="doĹľivotnĂˇ">doĹľivotnĂˇ</option></select></div>
              </div>
              <div className="grid grid-cols-3 items-center mt-3 pt-2 border-t border-[#D1D1D1] dark:border-[#333]">
                <div className="font-bold">DĂˇvka zo sociĂˇlnej poisĹĄovne</div>
                <div className={`mx-1 flex items-center gap-2 border px-2 py-0.5 bg-[#D6D6D6] dark:bg-[#333] ${!aofCiele.sociCheckboxKlient && 'opacity-60'}`}>
                  <input type="checkbox" checked={aofCiele.sociCheckboxKlient} onChange={e => setAofCiele({ sociCheckboxKlient: e.target.checked })} className="cursor-pointer" />
                  <span className="text-[#555] dark:text-[#AAA]">{aofCiele.sociCheckboxKlient && vypocitanaDavkaSofiKlient > 0 ? `${vypocitanaDavkaSofiKlient.toFixed(0)} â‚¬` : ''}</span>
                </div>
                <div className={`mx-1 flex items-center gap-2 border px-2 py-0.5 bg-[#D6D6D6] dark:bg-[#333] ${!aofCiele.sociCheckboxPartner && 'opacity-60'}`}>
                  <input type="checkbox" checked={aofCiele.sociCheckboxPartner} onChange={e => setAofCiele({ sociCheckboxPartner: e.target.checked })} className="cursor-pointer" />
                  <span className="text-[#555] dark:text-[#AAA]">{aofCiele.sociCheckboxPartner && vypocitanaDavkaSofiPartner > 0 ? `${vypocitanaDavkaSofiPartner.toFixed(0)} â‚¬` : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DETI CIELE - PRAVĂť STÄąPEC */}
          <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] p-2 rounded shadow-sm border border-[#D1D1D1] dark:border-[#333] h-min">
            <div className="grid grid-cols-4 font-extrabold mb-2 pb-1 border-b border-[#D1D1D1] dark:border-[#333]">
              <div>{t('aof.deti')}</div><div className="text-center">{t('aof.suma')}</div><div className="text-center">{t('aof.doVeku')}</div><div className="text-center">{t('aof.oKolkoRokov')}</div>
            </div>
            <div className="space-y-1">
              {deti.map(d => (
                <div className="grid grid-cols-4 items-center gap-1" key={d.id}>
                  <input value={d.meno || ''} readOnly className="border px-1 bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA]" placeholder={t('aof.meno')} />
                  <input type="number" value={d.cielSuma || ''} onChange={e => setDeti(deti.map(x => x.id === d.id ? { ...x, cielSuma: Number(e.target.value) } : x))} className="border px-1 text-center bg-white dark:bg-[#111]" />
                  <input type="number" value={d.cielDoVeku || ''} onChange={e => setDeti(deti.map(x => x.id === d.id ? { ...x, cielDoVeku: Number(e.target.value) } : x))} className="border px-1 text-center bg-white dark:bg-[#111]" />
                  <div className="border px-1 text-center bg-[#D6D6D6] dark:bg-[#333] text-[#555] dark:text-[#AAA]">{(d.cielDoVeku && d.vek) ? Number(d.cielDoVeku) - Number(d.vek) : ''}</div>
                </div>
              ))}
              {deti.length === 0 && <div className="text-center text-[#989FA7] py-2">{t('aof.ziadneDeti')}</div>}
            </div>
          </div>
        </div>

        <div className="bg-[#808080] dark:bg-[#4D4D4D] text-white text-center font-bold py-1 mt-4 uppercase tracking-wider">{t('aof.cieleKlienta')}</div>

        {/* GOALS INPUT SECTION */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] p-4 rounded shadow-sm border border-[#D1D1D1] dark:border-[#333]">
          {/* BĂ˝vanie */}
          <div className="flex items-start gap-4 mb-4 pb-4 border-b border-[#D1D1D1] dark:border-[#333]">
            <div className="w-1/4 font-extrabold flex flex-col gap-2">
              <div className="flex justify-between">{t('aof.byvanie')} <input type="checkbox" checked={aofCiele.byvanieCheckbox} onChange={e => setAofCiele({ byvanieCheckbox: e.target.checked })} /></div>
              <input type="text" value={aofCiele.byvanieNazov} onChange={e => setAofCiele({ byvanieNazov: e.target.value })} className="border font-normal px-1 w-full bg-white dark:bg-[#111]" />
            </div>
            <div className={`flex-1 flex flex-col gap-1 transition-opacity ${!aofCiele.byvanieCheckbox && 'opacity-50 pointer-events-none'}`}>
              <div className="grid grid-cols-3 text-center mb-1"><div className="font-bold">{t('aof.sumaUveru')}</div><div className="font-bold">{t('aof.splatnost')}</div><div className="font-bold">{t('aof.urok')}</div></div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={aofCiele.byvanieSumaUveru} onChange={e => setAofCiele({ byvanieSumaUveru: Number(e.target.value) })} className="border text-center px-1 bg-white dark:bg-[#111]" />
                <input type="number" value={aofCiele.byvanieSplatnost} onChange={e => setAofCiele({ byvanieSplatnost: Number(e.target.value) })} className="border text-center px-1 bg-white dark:bg-[#111]" />
                <div className="relative"><input type="number" step="0.1" value={aofCiele.byvanieUrok} onChange={e => setAofCiele({ byvanieUrok: Number(e.target.value) })} className="border text-center px-1 w-full bg-white dark:bg-[#111]" /><span className="absolute right-2 top-0">%</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="col-span-2 flex items-center gap-2"><span className="w-1/2 text-right">{t('aof.splatkaUveru')}</span> <span className="border text-center px-1 bg-[#D6D6D6] dark:bg-[#333] text-[#555] dark:text-[#AAA] flex-1 min-h-[22px] font-bold">{byvanieSplatka > 0 ? `${byvanieSplatka.toFixed(0)} â‚¬` : ''}</span></div>
              </div>
            </div>
            <div className={`w-1/4 flex flex-col gap-1 text-center transition-opacity ${!aofCiele.byvanieCheckbox && 'opacity-50 pointer-events-none'}`}>
              <div className="font-bold">{t('aof.nesplatenyUver')}</div>
              <input type="number" value={aofCiele.byvanieNesplatenyDiel} onChange={e => setAofCiele({ byvanieNesplatenyDiel: Number(e.target.value) })} className="border text-center px-1 bg-white dark:bg-[#111]" />
            </div>
          </div>

          {/* Rezerva na materskĂş dovolenku */}
          <div className="flex items-start gap-4 mb-4 pb-4 border-b border-[#D1D1D1] dark:border-[#333]">
            <div className="w-1/4 font-extrabold flex justify-between items-center">Rezerva na materskĂş dovolenku <input type="checkbox" checked={aofCiele.rezervaMDCheckbox} onChange={e => setAofCiele({ rezervaMDCheckbox: e.target.checked })} /></div>
            {aofCiele.rezervaMDCheckbox && (
              <div className="flex-1 flex flex-col gap-1">
                <div className="grid grid-cols-4 text-center mb-1"><div className="font-bold">PotrebnĂˇ suma</div><div className="font-bold">VĂ˝Ĺˇka renty / mes.</div><div className="font-bold">Doba na MD (roky)</div><div className="font-bold">O koÄľko rokov</div></div>
                <div className="grid grid-cols-4 gap-2">
                  <input type="text" readOnly value={(aofCiele.rezervaMDRenta && aofCiele.rezervaMDDoba) ? `${(Number(aofCiele.rezervaMDRenta) * Number(aofCiele.rezervaMDDoba) * 12).toFixed(0)} â‚¬` : ''} className="border text-center px-1 bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA]" />
                  <input type="number" value={aofCiele.rezervaMDRenta} onChange={e => setAofCiele({ rezervaMDRenta: Number(e.target.value) || '' })} className="border text-center px-1 bg-white dark:bg-[#111]" />
                  <input type="number" value={aofCiele.rezervaMDDoba} onChange={e => setAofCiele({ rezervaMDDoba: Number(e.target.value) || '' })} className="border text-center px-1 bg-white dark:bg-[#111]" />
                  <input type="number" value={aofCiele.rezervaMDRoky} onChange={e => setAofCiele({ rezervaMDRoky: Number(e.target.value) || '' })} className="border text-center px-1 bg-white dark:bg-[#111]" />
                </div>
              </div>
            )}
          </div>

          {/* PredÄŤasnĂˇ renta klient */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-1/4 font-extrabold flex justify-between items-center">{t('aof.predcasnaRenta')} <input type="checkbox" checked={aofCiele.predcasnaRentaKlientCheckbox} onChange={e => setAofCiele({ predcasnaRentaKlientCheckbox: e.target.checked })} /></div>
            <div className={`flex-1 grid grid-cols-3 gap-2 transition-opacity ${!aofCiele.predcasnaRentaKlientCheckbox && 'opacity-50 pointer-events-none'}`}>
              <div className="flex flex-col text-center"><span className="font-bold">{t('aof.vyskaRenty')}</span><input type="number" value={aofCiele.predcasnaRentaKlientVyska} onChange={e => setAofCiele({ predcasnaRentaKlientVyska: Number(e.target.value) })} className="border text-center px-1 bg-white dark:bg-[#111]" /></div>
              <div className="flex flex-col text-center"><span className="font-bold">{t('aof.vAkomVeku')}</span><input type="number" value={aofCiele.predcasnaRentaKlientVek} onChange={e => setAofCiele({ predcasnaRentaKlientVek: Number(e.target.value) })} className="border text-center px-1 bg-white dark:bg-[#111]" /></div>
            </div>
          </div>

          {/* PredÄŤasnĂˇ renta partner */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#D1D1D1] dark:border-[#333]">
            <div className="w-1/4 font-extrabold flex justify-between items-center">{t('aof.predcasnaRentaPartner')} <input type="checkbox" checked={aofCiele.predcasnaRentaPartnerCheckbox} onChange={e => setAofCiele({ predcasnaRentaPartnerCheckbox: e.target.checked })} /></div>
            <div className={`flex-1 grid grid-cols-3 gap-2 transition-opacity ${!aofCiele.predcasnaRentaPartnerCheckbox && 'opacity-50 pointer-events-none'}`}>
              <div className="flex flex-col text-center"><span className="font-bold mb-1 opacity-0">.</span><input type="number" value={aofCiele.predcasnaRentaPartnerVyska} onChange={e => setAofCiele({ predcasnaRentaPartnerVyska: Number(e.target.value) })} className="border text-center px-1 bg-white dark:bg-[#111]" /></div>
              <div className="flex flex-col text-center"><span className="font-bold mb-1 opacity-0">.</span><input type="number" value={aofCiele.predcasnaRentaPartnerVek} onChange={e => setAofCiele({ predcasnaRentaPartnerVek: Number(e.target.value) })} className="border text-center px-1 bg-white dark:bg-[#111]" /></div>
            </div>
          </div>

          {/* InĂ© ciele */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-1/4 font-extrabold flex justify-between items-center">
              {t('aof.ineCiele')}
              <div className="flex items-center gap-2">
                <button onClick={() => setAofCiele({ ineCiele: [...aofCiele.ineCiele, { id: Date.now(), nazov: 'Auto', hodnota: '', horizont: '', checked: true }], ineCieleExpand: true })} className="text-[10px] bg-white dark:bg-[#333] px-1 border rounded">{t('aof.pridat')} +</button>
                <input type="checkbox" checked={aofCiele.ineCieleExpand} onChange={e => setAofCiele({ ineCieleExpand: e.target.checked })} />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="text-center font-bold">{t('aof.hodnota')}</div>
              <div className="text-center font-bold">{t('aof.oKolkoRokov')}</div>
            </div>
          </div>
          {aofCiele.ineCieleExpand && aofCiele.ineCiele.map(c => (
            <div key={c.id} className="flex items-center gap-4 mb-1">
              <div className="w-1/4 flex justify-between items-center gap-1">
                <select value={c.nazov} onChange={e => setAofCiele({ ineCiele: aofCiele.ineCiele.map(x => x.id === c.id ? { ...x, nazov: e.target.value } : x) })} className="flex-1 border px-1 bg-white dark:bg-[#111] text-[11px]">
                  <option value="Auto">đźš— {t('aof.cielAuto')}</option>
                  <option value="Dovolenka">âśď¸Ź {t('aof.cielDovolenka')}</option>
                  <option value="Vzdelanie">đźŽ“ {t('aof.cielVzdelanie')}</option>
                  <option value="Rekonstructia">đźŹ  {t('aof.cielRekonstrukcia')}</option>
                  <option value="Ine">{t('aof.cielIne')}</option>
                </select>
                <input type="checkbox" checked={c.checked} onChange={e => setAofCiele({ ineCiele: aofCiele.ineCiele.map(x => x.id === c.id ? { ...x, checked: e.target.checked } : x) })} />
              </div>
              <div className={`flex-1 grid grid-cols-3 gap-2 transition-opacity ${!c.checked && 'opacity-50'}`}>
                <input type="number" value={c.hodnota} onChange={e => setAofCiele({ ineCiele: aofCiele.ineCiele.map(x => x.id === c.id ? { ...x, hodnota: Number(e.target.value) } : x) })} className="border text-center px-1 bg-white dark:bg-[#111]" />
                <input type="number" value={c.horizont} onChange={e => setAofCiele({ ineCiele: aofCiele.ineCiele.map(x => x.id === c.id ? { ...x, horizont: Number(e.target.value) } : x) })} className="border text-center px-1 bg-white dark:bg-[#111]" />
                <button onClick={() => setAofCiele({ ineCiele: aofCiele.ineCiele.filter(x => x.id !== c.id) })} className="text-[#AB0534] w-min px-4"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/* PRIORITNĂ TABUÄ˝KA CIEÄ˝OV                                     */}
        {/* ============================================================ */}
        <div className="bg-[#808080] dark:bg-[#4D4D4D] text-white text-center font-bold py-1 mt-6 uppercase tracking-wider">PrioritnĂˇ tabuÄľka cieÄľov</div>

        {(() => {
          // Build the full goal catalogue
          const num = (v: any) => Number(v) || 0;
          const pmt = (pv: number, rPa: number, n: number) => {
            if (!pv || !n) return 0;
            const r = rPa / 100 / 12;
            if (r === 0) return pv / n;
            return pv * r / (1 - Math.pow(1 + r, -n));
          };

          type GoalRow = {
            id: string;
            nazov: string;
            casovyHorizont: number | string;
            potrebnaSuma: number | string;
            urokInvest?: number | string;
            urokVyplata?: number | string;
            mesacnaPlatba?: number | string;
          };

          const allGoals: GoalRow[] = [
            // ZabezpeÄŤenie prĂ­jmu â€“ produkÄŤnĂ˝ kapitĂˇl klienta
            { id: 'zabKlient', nazov: `ZabezpeÄŤenie prĂ­jmu â€“ ${klient.meno || 'Klient'}`, casovyHorizont: Math.max(0, 64 - klientVek) || '', potrebnaSuma: vypocitanyProdukcnyKapitalKlient || '' },
            // ZabezpeÄŤenie prĂ­jmu â€“ produkÄŤnĂ˝ kapitĂˇl partnera
            ...(hasPartner ? [{ id: 'zabPartner', nazov: `ZabezpeÄŤenie prĂ­jmu â€“ ${partner.meno || 'Partner'}`, casovyHorizont: Math.max(0, 64 - partnerVek) || '', potrebnaSuma: vypocitanyProdukcnyKapitalPartner || '' }] : []),
            // Rezerva
            { id: 'rezerva', nazov: 'Rezerva', casovyHorizont: '', potrebnaSuma: vypocitanaRezerva || '' },
            // Renta klient 20-roÄŤnĂˇ
            { id: 'rentaKlient20', nazov: `Renta ${klient.meno || 'Klient'} â€“ ${aofCiele.zabezpecenieKlientRentaRoky}`, casovyHorizont: Math.max(0, 64 - klientVek) || '', potrebnaSuma: vypocitanyProdukcnyKapitalKlient || '' },
            // Renta partner 20-roÄŤnĂˇ
            ...(hasPartner ? [{ id: 'rentaPartner20', nazov: `Renta ${partner.meno || 'Partner'} â€“ ${aofCiele.zabezpeceniePartnerRentaRoky}`, casovyHorizont: Math.max(0, 64 - partnerVek) || '', potrebnaSuma: vypocitanyProdukcnyKapitalPartner || '' }] : []),
            // PredÄŤasnĂˇ renta klient
            ...(aofCiele.predcasnaRentaKlientCheckbox ? [{ id: 'predRentaKlient', nazov: `PredÄŤasnĂˇ renta â€“ ${klient.meno || 'Klient'}`, casovyHorizont: num(aofCiele.predcasnaRentaKlientVek) > 0 ? Math.max(0, num(aofCiele.predcasnaRentaKlientVek) - klientVek) : '', potrebnaSuma: num(aofCiele.predcasnaRentaKlientVyska) > 0 ? num(aofCiele.predcasnaRentaKlientVyska) * 12 * 20 : '' }] : []),
            // PredÄŤasnĂˇ renta partner
            ...(aofCiele.predcasnaRentaPartnerCheckbox ? [{ id: 'predRentaPartner', nazov: `PredÄŤasnĂˇ renta â€“ ${partner.meno || 'Partner'}`, casovyHorizont: num(aofCiele.predcasnaRentaPartnerVek) > 0 ? Math.max(0, num(aofCiele.predcasnaRentaPartnerVek) - partnerVek) : '', potrebnaSuma: num(aofCiele.predcasnaRentaPartnerVyska) > 0 ? num(aofCiele.predcasnaRentaPartnerVyska) * 12 * 20 : '' }] : []),
            // Rezerva na MD
            ...(aofCiele.rezervaMDCheckbox ? [{ id: 'rezervaMD', nazov: 'Rezerva na materskĂş dovolenku', casovyHorizont: aofCiele.rezervaMDRoky || '', potrebnaSuma: (aofCiele.rezervaMDRenta && aofCiele.rezervaMDDoba) ? num(aofCiele.rezervaMDRenta) * num(aofCiele.rezervaMDDoba) * 12 : '' }] : []),
            // BĂ˝vanie / Refinancovanie
            ...(aofCiele.byvanieCheckbox ? [{ id: 'byvanie', nazov: aofCiele.byvanieNazov || 'BĂ˝vanie', casovyHorizont: aofCiele.byvanieSplatnost || '', potrebnaSuma: aofCiele.byvanieNesplatenyDiel || '', mesacnaPlatba: byvanieSplatka > 0 ? byvanieSplatka : '' }] : []),
            // Deti
            ...deti.filter(d => d.cielSuma).map(d => ({ id: `dite_${d.id}`, nazov: d.meno || 'DieĹĄa', casovyHorizont: (d.cielDoVeku && d.vek) ? Number(d.cielDoVeku) - Number(d.vek) : '', potrebnaSuma: d.cielSuma || '' })),
            // InĂ© ciele
            ...aofCiele.ineCiele.filter(c => c.checked).map(c => ({ id: `ciel_${c.id}`, nazov: c.nazov, casovyHorizont: c.horizont || '', potrebnaSuma: c.hodnota || '' })),
          ];

          const priorities = aofCiele.goalPriorities;
          
          const togglePriority = (goalId: string) => {
            const current = priorities[goalId] || 0;
            if (current > 0) {
              // Remove â€“ shift others down
              const newP: Record<string, number> = {};
              Object.entries(priorities).forEach(([k, v]) => {
                if (k === goalId) return;
                newP[k] = v > current ? v - 1 : v;
              });
              setAofCiele({ goalPriorities: newP });
            } else {
              // Add at next slot
              const maxP = Object.values(priorities).reduce((m, v) => Math.max(m, v), 0);
              setAofCiele({ goalPriorities: { ...priorities, [goalId]: maxP + 1 } });
            }
          };

          const selectedGoals = allGoals
            .filter(g => (priorities[g.id] || 0) > 0)
            .sort((a, b) => (priorities[a.id] || 0) - (priorities[b.id] || 0));

          return (
            <div className="flex gap-4 mt-2">
              {/* LEFT: Goal selection list */}
              <div className="w-[280px] flex-shrink-0 bg-[#EAEAEA] dark:bg-[#1A1A1A] border border-[#D1D1D1] dark:border-[#333] rounded shadow-sm text-xs">
                <div className="bg-[#5C5C5C] dark:bg-[#333] text-white font-bold px-3 py-1.5">Zoznam cieÄľov</div>
                <div className="divide-y divide-[#D1D1D1] dark:divide-[#333]">
                  {allGoals.map(g => {
                    const p = priorities[g.id] || 0;
                    return (
                      <div key={g.id} className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors hover:bg-[#D8D8D8] dark:hover:bg-[#222] ${p > 0 ? 'bg-white dark:bg-[#111] font-bold' : ''}`} onClick={() => togglePriority(g.id)}>
                        <span className={p > 0 ? 'text-[#171717] dark:text-white' : 'text-[#555] dark:text-[#777]'}>{g.nazov}</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 ml-2 transition-all ${p > 0 ? 'bg-[#AB0534] border-[#AB0534] text-white' : 'border-[#999] text-[#999]'}`}>
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
                    <tr className="bg-[#5C5C5C] dark:bg-[#333] text-white">
                      <th className="px-1 py-1 text-left w-6">#</th>
                      <th className="px-2 py-1 text-left">CieÄľ</th>
                      <th className="px-2 py-1 text-center">ÄŚasovĂ˝<br/>horizont</th>
                      <th className="px-2 py-1 text-center">PotrebnĂˇ<br/>suma</th>
                      <th className="px-2 py-1 text-center bg-[#3a3a3a] dark:bg-[#222]" colSpan={2}>
                        Ăšrok
                        <div className="grid grid-cols-2 font-normal text-[10px] mt-0.5">
                          <span>investovanie</span><span>vĂ˝plata / splĂˇtka</span>
                        </div>
                      </th>
                      <th className="px-2 py-1 text-center">JednorazovĂ˝<br/>vklad</th>
                      <th className="px-2 py-1 text-center">MesaÄŤnĂˇ<br/>platba</th>
                    </tr>
                    <tr className="bg-[#DCDCDC] dark:bg-[#2A2A2A] text-[10px]">
                      <td colSpan={4} className="px-2 py-1 font-bold text-[#555] dark:text-[#AAA]">ĂšrokovĂ© sadzby (globĂˇlne)</td>
                      <td className="px-1 py-1"><input type="number" step="0.1" value={aofCiele.urokInvestovanie} onChange={e => setAofCiele({ urokInvestovanie: Number(e.target.value) || 0 })} className="w-full border text-center bg-white dark:bg-[#111] px-1" /><span className="text-[9px] text-center block">% p.a.</span></td>
                      <td className="px-1 py-1"><input type="number" step="0.1" value={aofCiele.urokVyplata} onChange={e => setAofCiele({ urokVyplata: Number(e.target.value) || 0 })} className="w-full border text-center bg-white dark:bg-[#111] px-1" /><span className="text-[9px] text-center block">% p.a.</span></td>
                      <td colSpan={2} />
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGoals.length === 0 && (
                      <tr><td colSpan={8} className="text-center text-[#989FA7] py-6 bg-white dark:bg-[#111]">Vyberte ciele zo zoznamu vÄľavo kliknutĂ­m</td></tr>
                    )}
                    {selectedGoals.map((g, i) => {
                      const pSuma = num(g.potrebnaSuma);
                      const horizont = num(g.casovyHorizont);
                      const mesacnaPlatba = g.mesacnaPlatba !== undefined
                        ? num(g.mesacnaPlatba)
                        : pSuma > 0 && horizont > 0
                          ? pmt(pSuma, aofCiele.urokInvestovanie, horizont * 12)
                          : 0;
                      const jednorazovyVklad = pSuma > 0 && horizont > 0 && aofCiele.urokInvestovanie > 0
                        ? pSuma / Math.pow(1 + aofCiele.urokInvestovanie / 100, horizont)
                        : pSuma > 0 && horizont === 0 ? pSuma : 0;

                      return (
                        <tr key={g.id} className={`border-b border-[#D1D1D1] dark:border-[#333] ${i % 2 === 0 ? 'bg-white dark:bg-[#111]' : 'bg-[#F5F5F5] dark:bg-[#181818]'}`}>
                          <td className="px-1 py-1 text-center font-extrabold text-[#AB0534]">{priorities[g.id]}</td>
                          <td className="px-2 py-1 font-bold">{g.nazov}</td>
                          <td className="px-2 py-1 text-center">{horizont > 0 ? horizont : 'â€“'}</td>
                          <td className="px-2 py-1 text-center font-bold">{pSuma > 0 ? `${pSuma.toLocaleString('sk-SK')} â‚¬` : 'â€“'}</td>
                          <td className="px-1 py-1 text-center text-[#555] dark:text-[#AAA]">{aofCiele.urokInvestovanie} %</td>
                          <td className="px-1 py-1 text-center text-[#555] dark:text-[#AAA]">{aofCiele.urokVyplata} %</td>
                          <td className="px-2 py-1 text-center font-bold text-[#1E5083]">{jednorazovyVklad > 0 ? `${Math.round(jednorazovyVklad).toLocaleString('sk-SK')} â‚¬` : 'â€“'}</td>
                          <td className="px-2 py-1 text-center font-bold text-[#166E36]">{mesacnaPlatba > 0 ? `${Math.round(mesacnaPlatba).toLocaleString('sk-SK')} â‚¬` : 'â€“'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {selectedGoals.length > 0 && (
                    <tfoot>
                      <tr className="bg-[#DCDCDC] dark:bg-[#2A2A2A] font-extrabold text-xs">
                        <td colSpan={6} className="px-2 py-1.5 text-right">CELKOM:</td>
                        <td className="px-2 py-1.5 text-center text-[#1E5083]">
                          {(() => {
                            const total = selectedGoals.reduce((sum, g) => {
                              const pSuma = num(g.potrebnaSuma);
                              const horizont = num(g.casovyHorizont);
                              const jv = pSuma > 0 && horizont > 0 && aofCiele.urokInvestovanie > 0
                                ? pSuma / Math.pow(1 + aofCiele.urokInvestovanie / 100, horizont)
                                : pSuma > 0 && horizont === 0 ? pSuma : 0;
                              return sum + jv;
                            }, 0);
                            return total > 0 ? `${Math.round(total).toLocaleString('sk-SK')} â‚¬` : '';
                          })()}
                        </td>
                        <td className="px-2 py-1.5 text-center text-[#166E36]">
                          {(() => {
                            const pv = (pSuma: number, rPa: number, n: number) => {
                              if (!pSuma || !n) return 0;
                              const r = rPa / 100 / 12;
                              if (r === 0) return pSuma / n;
                              return pSuma * r / (1 - Math.pow(1 + r, -n));
                            };
                            const total = selectedGoals.reduce((sum, g) => {
                              const mp = g.mesacnaPlatba !== undefined ? num(g.mesacnaPlatba) : pv(num(g.potrebnaSuma), aofCiele.urokInvestovanie, num(g.casovyHorizont) * 12);
                              return sum + mp;
                            }, 0);
                            return total > 0 ? `${Math.round(total).toLocaleString('sk-SK')} â‚¬` : '';
                          })()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
