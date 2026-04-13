'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { Trash2, Plus, CheckSquare, Square } from 'lucide-react';

const InputRow = ({ label, value, onChange, placeholder = "" }: any) => (
  <div className="flex flex-col gap-1 mb-3">
    <label className="text-xs font-bold text-[#171717] dark:text-[#ededed]">{label}</label>
    <input type="text" value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full px-2 py-1.5 rounded bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-sm text-[#171717] dark:text-[#ededed]" />
  </div>
);

const DualInputRow = ({ label, labelA, valA, onChangeA, labelB, valB, onChangeB }: any) => (
  <div className="mb-3">
    <label className="text-xs font-bold text-[#171717] dark:text-[#ededed] mb-1 block">{label}</label>
    <div className="flex gap-2">
      <div className="flex-1 flex flex-col"><span className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] mb-0.5">{labelA}</span><input type="number" value={valA || ''} onChange={onChangeA} className="w-full px-2 py-1.5 rounded bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-sm" /></div>
      <div className="flex-1 flex flex-col"><span className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] mb-0.5">{labelB}</span><input type="number" value={valB || ''} onChange={onChangeB} className="w-full px-2 py-1.5 rounded bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-sm" /></div>
    </div>
  </div>
);

export default function TabAOF() {
  const { 
    klient, partner, hasPartner, deti, hasDeti, majetok, cashFlow,
    setKlient, setPartner, setHasPartner, setDeti, setHasDeti, setMajetok, setCashFlow
  } = useAppStore();

  const totalPrijmy = Number(klient.cistyMesacne || 0) + Number(klient.pasivnyMesacne || 0) + 
                     (hasPartner ? (Number(partner.cistyMesacne || 0) + Number(partner.pasivnyMesacne || 0)) : 0);

  const totalSpotreba = Number(cashFlow.spotrebaMesacne || 0);
  const totalUvery = Number(cashFlow.uverySplatka || 0);
  const totalUspory = Number(cashFlow.sporeniaSplatka || 0) + Number(cashFlow.investicieSplatka || 0);
  const totalRezerva = 0; // to do: add logic
  
  const pctSpotreba = totalPrijmy > 0 ? (totalSpotreba / totalPrijmy) * 100 : 0;
  const pctUvery = totalPrijmy > 0 ? (totalUvery / totalPrijmy) * 100 : 0;
  const pctUspory = totalPrijmy > 0 ? (totalUspory / totalPrijmy) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">AOF (Analýza Osobných Financií)</h2>
        <div className="bg-[#AB0534] text-white px-4 py-1 rounded-full font-bold shadow animate-pulse">Spoločný rodinný príjem: {totalPrijmy} €</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {/* KLIENT */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
          <h2 className="font-extrabold text-sm uppercase mb-4 tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 text-[#171717] dark:text-white">K L I E N T :</h2>
          <div className="flex gap-2">
            <div className="flex-[3]"><InputRow label="Meno:" value={klient.meno} onChange={(e:any)=>setKlient({meno: e.target.value})} /></div>
            <div className="flex-1"><InputRow label="Vek:" value={klient.vekPos} onChange={(e:any)=>setKlient({vekPos: Number(e.target.value) || ''})} /></div>
          </div>
          <InputRow label="Hrubý príjem:" value={klient.hruby} onChange={(e:any)=>setKlient({hruby: Number(e.target.value) || ''})} />
          <DualInputRow label="Príjem čistý:" labelA="mesačne" valA={klient.cistyMesacne} onChangeA={(e:any)=>setKlient({cistyMesacne: Number(e.target.value) || ''})} labelB="ročne:" valB={klient.cistyRocne} onChangeB={(e:any)=>setKlient({cistyRocne: Number(e.target.value) || ''})} />
          <DualInputRow label="Pasívny príjem:" labelA="mesačne" valA={klient.pasivnyMesacne} onChangeA={(e:any)=>setKlient({pasivnyMesacne: Number(e.target.value) || ''})} labelB="ročne:" valB={klient.pasivnyRocne} onChangeB={(e:any)=>setKlient({pasivnyRocne: Number(e.target.value) || ''})} />
        </div>

        {/* PARTNER */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 cursor-pointer" onClick={() => setHasPartner(!hasPartner)}>
            {hasPartner ? <CheckSquare size={16} className="text-[#171717] dark:text-white" /> : <Square size={16} className="text-[#989FA7]" />}
            <h2 className={`font-extrabold text-sm uppercase tracking-wide ${!hasPartner && 'text-[#989FA7]'}`}>P A R T N E R :</h2>
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

        <div className="flex flex-col gap-4">
          {/* DETI */}
          <div className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded p-4 border border-[#ECEDED] dark:border-[#2A2A2A] flex-1 shadow-sm">
            <div className="flex items-center justify-between mb-4 bg-[#EAEAEA] dark:bg-[#222] p-1.5 rounded">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setHasDeti(!hasDeti)}>
                {hasDeti ? <CheckSquare size={16} className="text-[#171717] dark:text-white" /> : <Square size={16} className="text-[#989FA7]" />}
                <h2 className="font-extrabold text-sm uppercase tracking-wide">D E T I</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#4D4D4D] dark:text-[#989FA7]">Počet</span>
                <input type="number" readOnly value={deti.length} className="w-12 px-2 py-1 rounded bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] text-sm text-center font-bold text-[#171717] dark:text-[#ededed]" />
              </div>
            </div>
            <div className={`transition-opacity ${!hasDeti && 'opacity-50 pointer-events-none'}`}>
              <button onClick={() => setDeti([...deti, {id: Date.now(), vek: ''}])} className="w-full flex items-center justify-center gap-2 py-2 mb-3 border border-dashed border-[#D1D1D1] dark:border-[#4D4D4D] rounded text-xs font-bold text-[#989FA7] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                <Plus size={14} /> Pridať dieťa
              </button>
              <div className="space-y-2 overflow-auto max-h-[150px]">
                {deti.map((d, i) => (
                  <div key={d.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#989FA7] w-6">{i+1}.</span>
                    <div className="flex-1"><InputRow label="" placeholder={`Vek dieťaťa`} value={d.vek} onChange={(e:any) => setDeti(deti.map(x => x.id === d.id ? {...x, vek: Number(e.target.value) || ''} : x))} /></div>
                    <button onClick={() => setDeti(deti.filter(x => x.id !== d.id))} className="text-[#AB0534] p-1.5 hover:bg-red-50 rounded dark:hover:bg-red-900/30 mb-3"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAJETOK MINI PANEL */}
          <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm flex flex-col h-1/2">
            <div className="flex justify-between items-center mb-2 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1">
              <h2 className="font-extrabold text-sm uppercase tracking-wide">Majetok</h2>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => setMajetok([...majetok, {id: Date.now(), nazov: 'Byt', typ: 'Fyzický', hodnota: ''}])}>
                <span className="text-[10px] font-bold">pridať</span>
                <CheckSquare size={14} className="text-[#171717] dark:text-white" />
              </div>
            </div>
            <div className="space-y-2 overflow-auto flex-1 h-[100px]">
               {majetok.map(m => (
                  <div key={m.id} className="flex gap-2 items-center">
                    <select value={m.nazov} onChange={(e) => setMajetok(majetok.map(x => x.id === m.id ? {...x, nazov: e.target.value} : x))} className="flex-[2] px-2 py-1 rounded bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] text-[10px] sm:text-xs">
                      <option>Byt</option><option>Dom</option><option>Chata</option><option>Auto</option>
                    </select>
                    <input type="number" value={m.hodnota} placeholder="Hodnota" onChange={(e) => setMajetok(majetok.map(x => x.id === m.id ? {...x, hodnota: Number(e.target.value) || ''} : x))} className="flex-[2] px-2 py-1 rounded bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] text-xs text-right" />
                    <button onClick={() => setMajetok(majetok.filter(x => x.id !== m.id))} className="text-[#AB0534] p-1"><Trash2 size={12} /></button>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>

      {/* CASH FLOW BOTTOM WIDE PANEL */}
      <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-5 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
        <h2 className="font-extrabold text-sm uppercase mb-4 tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1">C A S H F L O W & M I E R Y</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prijmy a vydavky stlpy */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-x-8 gap-y-4">
             <div>
                <div className="grid grid-cols-3 gap-2 items-end mb-1"><div className="col-span-1 text-xs font-bold text-[#171717] dark:text-[#ededed]">Spotreba:</div><div className="col-span-1 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Mesačne</div><div className="col-span-1 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Ročne</div></div>
                <div className="grid grid-cols-3 gap-2"><div className="col-span-1"></div><input value={cashFlow.spotrebaMesacne} onChange={(e)=>setCashFlow({spotrebaMesacne: Number(e.target.value)||''})} className="col-span-1 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input value={cashFlow.spotrebaRocne} onChange={(e)=>setCashFlow({spotrebaRocne: Number(e.target.value)||''})} className="col-span-1 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] text-sm text-center rounded" /></div>
             </div>
             <div>
                <div className="grid grid-cols-3 gap-2 items-end mb-1"><div className="col-span-1 text-xs font-bold text-[#171717] dark:text-[#ededed]">Poiste. neživot:</div><div className="col-span-1 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Mesačne</div><div className="col-span-1 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Ročne</div></div>
                <div className="grid grid-cols-3 gap-2"><div className="col-span-1"></div><input value={cashFlow.poistNezivotMesacne} onChange={(e)=>setCashFlow({poistNezivotMesacne: Number(e.target.value)||''})} className="col-span-1 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input value={cashFlow.poistNezivotRocne} onChange={(e)=>setCashFlow({poistNezivotRocne: Number(e.target.value)||''})} className="col-span-1 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] text-sm text-center rounded" /></div>
             </div>

             <div className="col-span-2 mt-2 pt-4 border-t border-[#D1D1D1] dark:border-[#4D4D4D]">
               <div className="grid grid-cols-7 gap-2 items-end mb-1">
                 <div className="col-span-2 text-xs font-bold text-[#171717] dark:text-[#ededed]">Výdavky & Produkty:</div>
                 <div className="col-span-2 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Mesačná splátka</div>
                 <div className="col-span-3 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Aktuálna hodnota (Zostatok)</div>
               </div>
               <div className="space-y-2">
                 <div className="grid grid-cols-7 gap-2 items-center"><div className="col-span-2 text-xs">Úvery</div><input type="number" value={cashFlow.uverySplatka} onChange={e => setCashFlow({uverySplatka: Number(e.target.value)})} className="col-span-2 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input type="number" value={cashFlow.uveryZostatok} onChange={e => setCashFlow({uveryZostatok: Number(e.target.value)})} className="col-span-3 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /></div>
                 <div className="grid grid-cols-7 gap-2 items-center"><div className="col-span-2 text-xs">Sporenia</div><input type="number" value={cashFlow.sporeniaSplatka} onChange={e => setCashFlow({sporeniaSplatka: Number(e.target.value)})} className="col-span-2 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input type="number" value={cashFlow.sporeniaZostatok} onChange={e => setCashFlow({sporeniaZostatok: Number(e.target.value)})} className="col-span-3 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /></div>
                 <div className="grid grid-cols-7 gap-2 items-center"><div className="col-span-2 text-xs">Investície</div><input type="number" value={cashFlow.investicieSplatka} onChange={e => setCashFlow({investicieSplatka: Number(e.target.value)})} className="col-span-2 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input type="number" value={cashFlow.investicieZostatok} onChange={e => setCashFlow({investicieZostatok: Number(e.target.value)})} className="col-span-3 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /></div>
                 <div className="grid grid-cols-7 gap-2 items-center"><div className="col-span-2 text-xs">Poistenie životné</div><input type="number" value={cashFlow.poistZivotSplatka} onChange={e => setCashFlow({poistZivotSplatka: Number(e.target.value)})} className="col-span-2 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input type="number" value={cashFlow.poistZivotZostatok} onChange={e => setCashFlow({poistZivotZostatok: Number(e.target.value)})} className="col-span-3 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /></div>
               </div>
             </div>
          </div>

          {/* IDEALNE MIERY */}
          <div className="bg-[#FAFAFA] dark:bg-[#222222] rounded p-4 border border-[#ECEDED] dark:border-[#4D4D4D] flex flex-col justify-center relative shadow-inner">
             
            <h3 className="font-extrabold text-sm mb-3">Ideálne finančné miery <span className="absolute top-4 right-4 bg-[#AB0534]/10 text-[#AB0534] px-2 py-1 rounded text-xs">Live</span></h3>
            <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold text-[#4D4D4D] dark:text-[#989FA7] mb-1"><div></div><div>Optimal</div><div>Súčasné</div><div>Rozdiel</div></div>
            <div className="space-y-1.5">
              <div className="grid grid-cols-5 gap-1 items-center bg-white dark:bg-[#111111] p-1.5 rounded border border-[#ECEDED] dark:border-[#4D4D4D]">
                <div className="col-span-1 text-xs font-bold text-center border-r dark:border-[#4D4D4D] text-green-600">40%</div><div className="col-span-1 text-[10px] px-1 font-semibold">Spotreba</div>
                <div className="col-span-1 text-xs text-right px-1">{(totalPrijmy * 0.4).toFixed(0)}</div>
                <div className="col-span-1 text-xs text-right px-1 text-blue-600">{totalSpotreba}</div>
                <div className={`col-span-1 text-xs text-right px-1 font-bold ${pctSpotreba > 40 ? 'text-red-500' : 'text-green-500'}`}>{pctSpotreba.toFixed(1)}%</div>
              </div>
              <div className="grid grid-cols-5 gap-1 items-center bg-white dark:bg-[#111111] p-1.5 rounded border border-[#ECEDED] dark:border-[#4D4D4D]">
                <div className="col-span-1 text-xs font-bold text-center border-r dark:border-[#4D4D4D] text-green-600">30%</div><div className="col-span-1 text-[10px] px-1 font-semibold leading-none">Úvery</div>
                <div className="col-span-1 text-xs text-right px-1">{(totalPrijmy * 0.3).toFixed(0)}</div>
                <div className="col-span-1 text-xs text-right px-1 text-blue-600">{totalUvery}</div>
                <div className={`col-span-1 text-xs text-right px-1 font-bold ${pctUvery > 30 ? 'text-red-500' : 'text-green-500'}`}>{pctUvery.toFixed(1)}%</div>
              </div>
              <div className="grid grid-cols-5 gap-1 items-center bg-white dark:bg-[#111111] p-1.5 rounded border border-[#ECEDED] dark:border-[#4D4D4D]">
                <div className="col-span-1 text-xs font-bold text-center border-r dark:border-[#4D4D4D] text-green-600">20%</div><div className="col-span-1 text-[10px] px-1 font-semibold leading-none">Úspory</div>
                <div className="col-span-1 text-xs text-right px-1">{(totalPrijmy * 0.2).toFixed(0)}</div>
                <div className="col-span-1 text-xs text-right px-1 text-blue-600">{totalUspory}</div>
                <div className={`col-span-1 text-xs text-right px-1 font-bold ${pctUspory < 20 ? 'text-orange-500' : 'text-green-500'}`}>{pctUspory.toFixed(1)}%</div>
              </div>
              <div className="grid grid-cols-5 gap-1 items-center bg-white dark:bg-[#111111] p-1.5 rounded border border-[#ECEDED] dark:border-[#4D4D4D]">
                <div className="col-span-1 text-xs font-bold text-center border-r dark:border-[#4D4D4D] text-green-600">10%</div><div className="col-span-1 text-[10px] px-1 font-semibold leading-none">Rezerva</div>
                <div className="col-span-1 text-xs text-right px-1">{(totalPrijmy * 0.1).toFixed(0)}</div>
                <div className="col-span-1 text-xs text-right px-1 text-blue-600">{totalRezerva}</div>
                <div className="col-span-1 text-xs text-right px-1">0%</div>
              </div>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
}
