'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { Trash2, Plus, CheckSquare, Square } from 'lucide-react';

const InputRow = ({ label, value, onChange, placeholder = "" }: any) => (
  <div className="flex justify-between items-center mb-1">
    <label className="text-[11px] font-bold text-[#171717] dark:text-[#ededed] whitespace-nowrap mr-2">{label}</label>
    <input type="text" value={value || ''} onChange={onChange} placeholder={placeholder} className="w-2/3 px-2 py-0.5 rounded bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-xs text-right text-[#171717] dark:text-[#ededed]" />
  </div>
);

const DualInputRow = ({ label, labelA, valA, onChangeA, labelB, valB, onChangeB }: any) => (
  <div className="mb-2">
    <label className="text-[11px] font-bold text-[#171717] dark:text-[#ededed] block">{label}</label>
    <div className="flex gap-2">
      <div className="flex-1 flex items-center justify-between"><span className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] mr-1">{labelA}</span><input type="number" value={valA || ''} onChange={onChangeA} className="w-2/3 px-2 py-0.5 rounded bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-xs text-right" /></div>
      <div className="flex-1 flex items-center justify-between"><span className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] mr-1">{labelB}</span><input type="number" value={valB || ''} onChange={onChangeB} className="w-2/3 px-2 py-0.5 rounded bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-xs text-right" /></div>
    </div>
  </div>
);

export default function TabAOF() {
  const { 
    klient, partner, hasPartner, deti, hasDeti, majetok, cashFlow,
    setKlient, setPartner, setHasPartner, setDeti, setHasDeti, setMajetok, setCashFlow
  } = useAppStore();

  // CALCULATIONS
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

  // Majetok Zostatky
  const majetokFyzicky = majetok.reduce((sum, m) => sum + num(m.hodnota), 0);
  const majetokFinancny = num(cashFlow.sporeniaZostatok) + num(cashFlow.investicieZostatok) + num(cashFlow.poistZivotZostatok); // ignoring ucet exactly as in excel
  const majetokPasiva = num(cashFlow.uveryZostatok);
  const cistaHodnota = majetokFyzicky + majetokFinancny - majetokPasiva;

  // IDEALNE MIERY
  const optSpotreba = totalPrijmy * 0.40;
  const optUvery = totalPrijmy * 0.30;
  const optMajetok = totalPrijmy * 0.20;
  const optRezerva = totalPrijmy * 0.10;

  const sucSpotreba = spotreba;
  const sucUvery = uvery;
  const sucMajetok = sporenia + investicie + poistZivot;
  const sucRezerva = rozdiel; // Assigning leftover cash space to res

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
         {/* KLIENT */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-3 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
          <h2 className="font-extrabold text-xs uppercase mb-2 tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 text-[#171717] dark:text-white">KLIENT:</h2>
          <div className="flex gap-2">
            <div className="flex-[3]"><InputRow label="Meno:" value={klient.meno} onChange={(e:any)=>setKlient({meno: e.target.value})} /></div>
            <div className="flex-1"><InputRow label="Vek:" value={klient.vekPos} onChange={(e:any)=>setKlient({vekPos: Number(e.target.value) || ''})} /></div>
          </div>
          <InputRow label="Hrubý príjem:" value={klient.hruby} onChange={(e:any)=>setKlient({hruby: Number(e.target.value) || ''})} />
          <DualInputRow label="Príjem čistý:" labelA="mesačne" valA={klient.cistyMesacne} onChangeA={(e:any)=>setKlient({cistyMesacne: Number(e.target.value) || ''})} labelB="ročne:" valB={klient.cistyRocne} onChangeB={(e:any)=>setKlient({cistyRocne: Number(e.target.value) || ''})} />
          <DualInputRow label="Pasívny príjem:" labelA="mesačne" valA={klient.pasivnyMesacne} onChangeA={(e:any)=>setKlient({pasivnyMesacne: Number(e.target.value) || ''})} labelB="ročne:" valB={klient.pasivnyRocne} onChangeB={(e:any)=>setKlient({pasivnyRocne: Number(e.target.value) || ''})} />
        </div>

        {/* PARTNER */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-3 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
          <div className="flex items-center gap-2 mb-2 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 cursor-pointer" onClick={() => setHasPartner(!hasPartner)}>
            {hasPartner ? <CheckSquare size={14} className="text-[#171717] dark:text-white" /> : <Square size={14} className="text-[#989FA7]" />}
            <h2 className={`font-extrabold text-xs uppercase tracking-wide ${!hasPartner && 'text-[#989FA7]'}`}>PARTNER:</h2>
          </div>
          <div className={`transition-opacity ${!hasPartner && 'opacity-50 pointer-events-none'}`}>
            <div className="flex gap-2">
              <div className="flex-[3]"><InputRow label="Meno:" value={partner.meno} onChange={(e:any)=>setPartner({meno: e.target.value})} /></div>
              <div className="flex-1"><InputRow label="Vek:" value={partner.vekPos} onChange={(e:any)=>setPartner({vekPos: Number(e.target.value) || ''})} /></div>
            </div>
            <InputRow label="Hrubý príjem:" value={partner.hruby} onChange={(e:any)=>setPartner({hruby: Number(e.target.value) || ''})} />
            <DualInputRow label="Príjem čistý:" labelA="mesačne" valA={partner.cistyMesacne} onChangeA={(e:any)=>setPartner({cistyMesacne: Number(e.target.value) || ''})} labelB="ročne:" valB={partner.cistyRocne} onChangeB={(e:any)=>setPartner({cistyRocne: Number(e.target.value) || ''})} />
            <DualInputRow label="Pasívny príjem:" labelA="mesačne" valA={partner.pasivnyMesacne} onChangeA={(e:any)=>setPartner({pasivnyMesacne: Number(e.target.value) || ''})} labelB="ročne:" valB={partner.pasivnyRocne} onChangeB={(e:any)=>setPartner({pasivnyRocne: Number(e.target.value) || ''})} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* DETI */}
          <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded p-2 border border-[#ECEDED] dark:border-[#2A2A2A] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => setHasDeti(!hasDeti)}>
                {hasDeti ? <CheckSquare size={12} className="text-[#171717] dark:text-white" /> : <Square size={12} className="text-[#989FA7]" />}
                <h2 className="font-extrabold text-[10px] uppercase tracking-wide">DETI</h2>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">Počet: <span className="bg-white px-1.5 py-0.5 border rounded">{deti.length}</span></div>
            </div>
            <div className={`transition-opacity text-[10px] ${!hasDeti && 'opacity-50 pointer-events-none'}`}>
               <div className="space-y-1 overflow-auto max-h-[70px] mb-1">
                {deti.map((d, i) => (
                  <div key={d.id} className="flex gap-1 items-center">
                    <input type="text" placeholder="Meno" className="w-1/2 p-0.5 px-1 border" />
                    <input type="number" value={d.vek || ''} placeholder="Vek" onChange={(e:any) => setDeti(deti.map(x => x.id === d.id ? {...x, vek: Number(e.target.value) || ''} : x))} className="w-1/3 p-0.5 px-1 border" />
                    <button onClick={() => setDeti(deti.filter(x => x.id !== d.id))} className="text-[#AB0534]"><Trash2 size={10} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setDeti([...deti, {id: Date.now(), vek: ''}])} className="w-full text-center border-dashed border py-0.5 text-[#989FA7]">+ Pridať</button>
            </div>
          </div>

          {/* MAJETOK */}
          <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded p-2 border border-[#ECEDED] dark:border-[#2A2A2A] shadow-sm flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-extrabold text-[10px] uppercase tracking-wide">Majetok</h2>
              <button className="text-[9px] font-bold" onClick={() => setMajetok([...majetok, {id: Date.now(), nazov: 'Byt', typ: 'Fyzický', hodnota: ''}])}>pridať +</button>
            </div>
            <div className="space-y-1 overflow-auto max-h-[80px]">
               {majetok.map(m => (
                  <div key={m.id} className="flex gap-1 items-center">
                    <select value={m.nazov} onChange={(e) => setMajetok(majetok.map(x => x.id === m.id ? {...x, nazov: e.target.value} : x))} className="w-1/2 text-[10px] border px-1">
                      <option>Byt</option><option>Dom</option><option>Auto</option><option>Iné</option>
                    </select>
                    <input type="number" value={m.hodnota} placeholder="Hodnota" onChange={(e) => setMajetok(majetok.map(x => x.id === m.id ? {...x, hodnota: Number(e.target.value) || ''} : x))} className="w-1/3 text-[10px] border px-1 text-right" />
                    <button onClick={() => setMajetok(majetok.filter(x => x.id !== m.id))} className="text-[#AB0534]"><Trash2 size={10} /></button>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>

      {/* CASH FLOW AND CALCULATIONS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* INPUTS CASHFLOW */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm text-xs">
          <h2 className="font-extrabold text-sm uppercase tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 mb-2">CASH FLOW</h2>
          
          <div className="flex justify-between font-bold text-[10px] text-center mb-1 pr-[10px]"><div className="w-[30%]"></div><div className="w-[30%]">Mesačne</div><div className="w-[30%]">Ročne</div></div>
          <div className="flex justify-between items-center mb-2"><div className="w-[30%] font-bold">Spotreba:</div><input value={cashFlow.spotrebaMesacne} onChange={(e)=>setCashFlow({spotrebaMesacne: Number(e.target.value)||''})} className="w-[30%] px-1 border text-right" /><input value={cashFlow.spotrebaRocne} onChange={(e)=>setCashFlow({spotrebaRocne: Number(e.target.value)||''})} className="w-[30%] px-1 border text-right" /></div>
          
          <div className="flex justify-between font-bold text-[10px] text-center mb-1 pr-[10px] mt-3"><div className="w-[30%]">Finančné výdavky:</div><div className="w-[30%]">Mesačná splátka</div><div className="w-[30%]">Zostatok</div></div>
          <div className="flex justify-between items-center mb-1"><div className="w-[30%]">Úvery</div><input type="number" value={cashFlow.uverySplatka} onChange={e => setCashFlow({uverySplatka: Number(e.target.value)})} className="w-[30%] px-1 border text-right" /><input type="number" value={cashFlow.uveryZostatok} onChange={e => setCashFlow({uveryZostatok: Number(e.target.value)})} className="w-[30%] px-1 border text-right" /></div>

          <div className="flex justify-between font-bold text-[10px] text-center mb-1 pr-[10px] mt-2"><div className="w-[30%]"></div><div className="w-[30%]">Mesačná splátka</div><div className="w-[30%]">Aktuálna hodnota</div></div>
          <div className="flex justify-between items-center mb-1"><div className="w-[30%]">Sporenia</div><input type="number" value={cashFlow.sporeniaSplatka} onChange={e => setCashFlow({sporeniaSplatka: Number(e.target.value)})} className="w-[30%] px-1 border text-right" /><input type="number" value={cashFlow.sporeniaZostatok} onChange={e => setCashFlow({sporeniaZostatok: Number(e.target.value)})} className="w-[30%] px-1 border text-right" /></div>
          <div className="flex justify-between items-center mb-1"><div className="w-[30%]">Investície</div><input type="number" value={cashFlow.investicieSplatka} onChange={e => setCashFlow({investicieSplatka: Number(e.target.value)})} className="w-[30%] px-1 border text-right" /><input type="number" value={cashFlow.investicieZostatok} onChange={e => setCashFlow({investicieZostatok: Number(e.target.value)})} className="w-[30%] px-1 border text-right" /></div>
          <div className="flex justify-between items-center mb-2"><div className="w-[30%]">Poistenie životné</div><input type="number" value={cashFlow.poistZivotSplatka} onChange={e => setCashFlow({poistZivotSplatka: Number(e.target.value)})} className="w-[30%] px-1 border text-right" /><input type="number" value={cashFlow.poistZivotZostatok} onChange={e => setCashFlow({poistZivotZostatok: Number(e.target.value)})} className="w-[30%] px-1 border text-right" /></div>
          
          <div className="flex justify-between font-bold text-[10px] text-center mb-1 pr-[10px] mt-2"><div className="w-[30%]"></div><div className="w-[30%]">Mesačne</div><div className="w-[30%]">Ročne</div></div>
          <div className="flex justify-between items-center mb-3"><div className="w-[30%]">Poistenie neživotné</div><input value={cashFlow.poistNezivotMesacne} onChange={(e)=>setCashFlow({poistNezivotMesacne: Number(e.target.value)||''})} className="w-[30%] px-1 border text-right" /><input value={cashFlow.poistNezivotRocne} onChange={(e)=>setCashFlow({poistNezivotRocne: Number(e.target.value)||''})} className="w-[30%] px-1 border text-right" /></div>

          <div className="flex justify-between items-center font-bold pb-2 pt-2 border-t border-[#D1D1D1] dark:border-[#4D4D4D]">
            <div className="w-[30%]">Zostatok na účte</div>
            <div className="w-[50%] flex justify-end"><input type="number" value={cashFlow.zostatokUcet} onChange={(e)=>setCashFlow({zostatokUcet: Number(e.target.value)})} className="w-[60%] px-2 border text-right bg-white dark:bg-[#333]" /></div>
          </div>
        </div>

        {/* SUMMARY REPORTS */}
        <div className="flex flex-col gap-4">
           {/* MESAČNÝ CASH FLOW CALC */}
           <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm text-xs font-bold">
             <h2 className="font-extrabold text-sm uppercase tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 mb-2">MESAČNÝ CASH FLOW</h2>
             <div className="flex justify-between py-1"><span>Príjmy:</span> <span className="bg-white dark:bg-[#333] px-2 border">{totalPrijmy.toFixed(0)} €</span></div>
             <div className="flex justify-between py-1"><span>Výdavky:</span> <span className="bg-white dark:bg-[#333] px-2 border">{totalVydavky.toFixed(0)} €</span></div>
             <div className="flex justify-between py-1"><span>Rozdiel:</span> <span className="bg-white dark:bg-[#333] px-2 border">{rozdiel.toFixed(0)} €</span></div>
             <h2 className="font-extrabold text-sm uppercase tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 mt-4 mb-2">Majetok:</h2>
             <div className="flex justify-between py-1"><span>Fyzický</span> <span className="bg-white dark:bg-[#333] px-2 border">{majetokFyzicky.toFixed(0)} €</span></div>
             <div className="flex justify-between py-1"><span>Finančný</span> <span className="bg-white dark:bg-[#333] px-2 border">{majetokFinancny.toFixed(0)} €</span></div>
             <div className="flex justify-between py-1"><span>Pasíva</span> <span className="bg-white dark:bg-[#333] px-2 border">{majetokPasiva.toFixed(0)} €</span></div>
             <div className="flex justify-between py-2 mt-2 border-t border-[#D1D1D1] dark:border-[#4D4D4D] text-sm font-extrabold"><span>ČISTÁ HODNOTA MAJETKU:</span> <span className="bg-white dark:bg-[#333] px-2 border">{cistaHodnota.toFixed(0)} €</span></div>
           </div>

           {/* IDEALNE FINANCNE MIERY */}
           <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm text-xs relative">
             <h2 className="font-extrabold text-sm uppercase tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 mb-2">Ideálne finančné miery</h2>
             <div className="grid grid-cols-4 text-[10px] font-bold text-center mb-1"><div></div><div>Optimal</div><div>Súčasné</div><div>Rozdiel</div></div>
             <div className="space-y-1">
               <div className="grid grid-cols-4 items-center bg-white dark:bg-[#333] border p-1 rounded font-bold">
                 <div className="flex items-center gap-1"><span className="border text-[9px] px-0.5">40%</span> Spotreba</div>
                 <div className="text-right px-1">{optSpotreba.toFixed(0)} €</div><div className="text-right px-1">{sucSpotreba.toFixed(0)} €</div>
                 <div className="text-right px-1 text-[#AB0534]">{(optSpotreba - sucSpotreba).toFixed(0)} €</div>
               </div>
               <div className="grid grid-cols-4 items-center bg-white dark:bg-[#333] border p-1 rounded font-bold">
                 <div className="flex items-center gap-1"><span className="border text-[9px] px-0.5">30%</span> Úverové</div>
                 <div className="text-right px-1">{optUvery.toFixed(0)} €</div><div className="text-right px-1">{sucUvery.toFixed(0)} €</div>
                 <div className="text-right px-1 text-[#AB0534]">{(optUvery - sucUvery).toFixed(0)} €</div>
               </div>
               <div className="grid grid-cols-4 items-center bg-white dark:bg-[#333] border p-1 rounded font-bold">
                 <div className="flex items-center gap-1"><span className="border text-[9px] px-0.5">20%</span> Tvorba</div>
                 <div className="text-right px-1">{optMajetok.toFixed(0)} €</div><div className="text-right px-1">{sucMajetok.toFixed(0)} €</div>
                 <div className="text-right px-1 text-[#AB0534]">{(optMajetok - sucMajetok).toFixed(0)} €</div>
               </div>
               <div className="grid grid-cols-4 items-center bg-white dark:bg-[#333] border p-1 rounded font-bold">
                 <div className="flex items-center gap-1"><span className="border text-[9px] px-0.5">10%</span> Rezerva</div>
                 <div className="text-right px-1">{optRezerva.toFixed(0)} €</div><div className="text-right px-1">{sucRezerva.toFixed(0)} €</div>
                 <div className="text-right px-1 text-[#AB0534]">{(optRezerva - sucRezerva).toFixed(0)} €</div>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
