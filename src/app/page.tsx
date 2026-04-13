'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Target, ShieldCheck, TrendingUp, Presentation, Moon, Sun, Download, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('AOF');

  // STATE: AOF - Klient
  const [klient, setKlient] = useState({ meno: '', vek: '', hruby: '', cistyMesacne: '', cistyRocne: '', pasivnyMesacne: '', pasivnyRocne: '' });
  const [hasPartner, setHasPartner] = useState(true);
  const [partner, setPartner] = useState({ meno: '', vek: '', hruby: '', cistyMesacne: '', cistyRocne: '', pasivnyMesacne: '', pasivnyRocne: '' });
  const [hasDeti, setHasDeti] = useState(true);
  const [deti, setDeti] = useState<{id: number, vek: string}[]>([]);
  
  // STATE: AOF - Cash Flow & Majetok
  const [cashFlow, setCashFlow] = useState({ spotrebaMesacne: '', spotrebaRocne: '', uvery: { splatka: '', zostatok: '' }, sporenia: { splatka: '', aktualnaHodnota: '' }, investicie: { splatka: '', aktualnaHodnota: '' }, poistZivot: { splatka: '', aktualnaHodnota: '' }, poistNezivot: { mesacne: '', rocne: '' }, zostatokNaUcte: '0' });
  const [majetok, setMajetok] = useState<{id: number, nazov: string, hodnota: string}[]>([{ id: 1, nazov: 'Byt', hodnota: '' }]);

  // Dark mode hook
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Vizuálne komponenty pre AOF
  const InputRow = ({ label, value, onChange, placeholder = "" }: any) => (
    <div className="flex flex-col gap-1 mb-3">
      <label className="text-xs font-bold text-[#171717] dark:text-[#ededed]">{label}</label>
      <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full px-2 py-1.5 rounded bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-sm text-[#171717] dark:text-[#ededed]" />
    </div>
  );

  const DualInputRow = ({ label, labelA, valA, onChangeA, labelB, valB, onChangeB }: any) => (
    <div className="mb-3">
      <label className="text-xs font-bold text-[#171717] dark:text-[#ededed] mb-1 block">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col"><span className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] mb-0.5">{labelA}</span><input type="text" value={valA} onChange={onChangeA} className="w-full px-2 py-1.5 rounded bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-sm" /></div>
        <div className="flex-1 flex flex-col"><span className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] mb-0.5">{labelB}</span><input type="text" value={valB} onChange={onChangeB} className="w-full px-2 py-1.5 rounded bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] focus:outline-none focus:border-[#AB0534] text-sm" /></div>
      </div>
    </div>
  );

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all w-full text-left ${activeTab === id ? 'bg-[#AB0534] text-white shadow-md' : 'text-[#4D4D4D] dark:text-[#989FA7] hover:bg-[#ECEDED] dark:hover:bg-[#1A1A1A]'}`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] dark:bg-[var(--background)] font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-[#ECEDED] dark:border-[#2A2A2A] bg-white dark:bg-[#111111] flex flex-col justify-between sticky top-0 h-screen overflow-y-auto hidden md:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-[#AB0534] flex items-center justify-center text-white font-bold text-xl shadow-md">P</div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#171717] dark:text-[#ededed]">Planner</h1>
          </div>
          
          <nav className="flex flex-col gap-1.5">
            <SidebarItem id="AOF" label="AOF" icon={LayoutDashboard} />
            <SidebarItem id="Ciele" label="Ciele" icon={Target} />
            <SidebarItem id="Prepocty" label="Prepočty zabezpečenia príjmu" icon={ShieldCheck} />
            <SidebarItem id="FinancnyPlan" label="Finančný plán" icon={TrendingUp} />
            <div className="h-px bg-[#ECEDED] dark:bg-[#4D4D4D] my-2"></div>
            <SidebarItem id="Vystup" label="Výstup" icon={Presentation} />
          </nav>
        </div>

        <div className="p-6 border-t border-[#ECEDED] dark:border-[#2A2A2A] space-y-2">
          <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-3 px-4 py-3 hover:bg-[#ECEDED] dark:hover:bg-[#1A1A1A] rounded-xl font-medium text-sm text-[#4D4D4D] dark:text-[#989FA7] transition-colors w-full">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />} {darkMode ? 'Svetlý režim' : 'Tmavý režim'}
          </button>
          <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#ECEDED] dark:hover:bg-[#1A1A1A] rounded-xl font-medium text-sm text-[#4D4D4D] dark:text-[#989FA7] transition-colors w-full">
            <Download size={18} /> Uložiť JSON
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#FAFAFA] dark:bg-[var(--background)]">
        
        {/* Mobile Header (Fallback) */}
        <header className="md:hidden bg-white dark:bg-[#111111] border-b border-[#ECEDED] dark:border-[#4D4D4D] p-4 flex justify-between">
           <h1 className="font-bold text-[#AB0534]">Partners Planner</h1>
           <select 
             value={activeTab} 
             onChange={(e) => setActiveTab(e.target.value)}
             className="bg-[#FAFAFA] dark:bg-[#2A2A2A] px-2 border rounded"
            >
             <option value="AOF">AOF</option>
             <option value="Ciele">Ciele</option>
             <option value="Prepocty">Prepočty</option>
             <option value="FinancnyPlan">Finančný plán</option>
             <option value="Vystup">Výstup</option>
           </select>
        </header>

        {/* View Router */}
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
          
          {/* =====================
                AOF VSTUP TAB
             ===================== */}
          {activeTab === 'AOF' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">AOF (Analýza Osobných Financií)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* KLIENT */}
                <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
                  <h2 className="font-extrabold text-sm uppercase mb-4 tracking-wide border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 text-[#171717] dark:text-white">K L I E N T :</h2>
                  <div className="flex gap-2">
                    <div className="flex-[3]"><InputRow label="Meno:" value={klient.meno} onChange={(e:any)=>setKlient({...klient, meno: e.target.value})} /></div>
                    <div className="flex-1"><InputRow label="Vek:" value={klient.vek} onChange={(e:any)=>setKlient({...klient, vek: e.target.value})} /></div>
                  </div>
                  <InputRow label="Hrubý príjem:" value={klient.hruby} onChange={(e:any)=>setKlient({...klient, hruby: e.target.value})} />
                  <DualInputRow label="Príjem čistý:" labelA="mesačne" valA={klient.cistyMesacne} onChangeA={(e:any)=>setKlient({...klient, cistyMesacne: e.target.value})} labelB="ročne:" valB={klient.cistyRocne} onChangeB={(e:any)=>setKlient({...klient, cistyRocne: e.target.value})} />
                  <DualInputRow label="Pasívny príjem:" labelA="mesačne" valA={klient.pasivnyMesacne} onChangeA={(e:any)=>setKlient({...klient, pasivnyMesacne: e.target.value})} labelB="ročne:" valB={klient.pasivnyRocne} onChangeB={(e:any)=>setKlient({...klient, pasivnyRocne: e.target.value})} />
                </div>

                {/* PARTNER */}
                <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1 cursor-pointer" onClick={() => setHasPartner(!hasPartner)}>
                    {hasPartner ? <CheckSquare size={16} className="text-[#171717] dark:text-white" /> : <Square size={16} className="text-[#989FA7]" />}
                    <h2 className={`font-extrabold text-sm uppercase tracking-wide ${!hasPartner && 'text-[#989FA7]'}`}>P A R T N E R :</h2>
                  </div>
                  <div className={`transition-opacity ${!hasPartner && 'opacity-50 pointer-events-none'}`}>
                    <div className="flex gap-2">
                      <div className="flex-[3]"><InputRow label="Meno:" value={partner.meno} onChange={(e:any)=>setPartner({...partner, meno: e.target.value})} /></div>
                      <div className="flex-1"><InputRow label="Vek:" value={partner.vek} onChange={(e:any)=>setPartner({...partner, vek: e.target.value})} /></div>
                    </div>
                    <InputRow label="Hrubý príjem:" value={partner.hruby} onChange={(e:any)=>setPartner({...partner, hruby: e.target.value})} />
                    <DualInputRow label="Príjem čistý:" labelA="mesačne" valA={partner.cistyMesacne} onChangeA={(e:any)=>setPartner({...partner, cistyMesacne: e.target.value})} labelB="ročne:" valB={partner.cistyRocne} onChangeB={(e:any)=>setPartner({...partner, cistyRocne: e.target.value})} />
                    <DualInputRow label="Pasívny príjem:" labelA="mesačne" valA={partner.pasivnyMesacne} onChangeA={(e:any)=>setPartner({...partner, pasivnyMesacne: e.target.value})} labelB="ročne:" valB={partner.pasivnyRocne} onChangeB={(e:any)=>setPartner({...partner, pasivnyRocne: e.target.value})} />
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
                            <div className="flex-1"><InputRow label="" placeholder={`Vek dieťaťa`} value={d.vek} onChange={(e:any) => setDeti(deti.map(x => x.id === d.id ? {...x, vek: e.target.value} : x))} /></div>
                            <button onClick={() => setDeti(deti.filter(x => x.id !== d.id))} className="text-[#AB0534] p-1.5 hover:bg-red-50 rounded dark:hover:bg-red-900/30 mb-3"><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* MAJETOK MINI PANEL (Moved here for better grid) */}
                  <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] rounded p-4 border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm flex flex-col h-1/2">
                    <div className="flex justify-between items-center mb-2 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-1">
                      <h2 className="font-extrabold text-sm uppercase tracking-wide">Majetok</h2>
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => setMajetok([...majetok, {id: Date.now(), nazov: 'Byt', hodnota: ''}])}>
                        <span className="text-[10px] font-bold">pridať</span>
                        <CheckSquare size={14} className="text-[#171717] dark:text-white" />
                      </div>
                    </div>
                    <div className="space-y-2 overflow-auto flex-1">
                       {majetok.map(m => (
                          <div key={m.id} className="flex gap-2 items-center">
                            <select value={m.nazov} onChange={(e) => setMajetok(majetok.map(x => x.id === m.id ? {...x, nazov: e.target.value} : x))} className="flex-[2] px-2 py-1 rounded bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] text-[10px] sm:text-xs">
                              <option>Byt</option><option>Dom</option><option>Chata</option><option>Auto</option>
                            </select>
                            <input type="text" value={m.hodnota} placeholder="Hodnota" onChange={(e) => setMajetok(majetok.map(x => x.id === m.id ? {...x, hodnota: e.target.value} : x))} className="flex-[2] px-2 py-1 rounded bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] text-xs text-right" />
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
                        <div className="grid grid-cols-3 gap-2"><div className="col-span-1"></div><input value={cashFlow.spotrebaMesacne} onChange={(e)=>setCashFlow({...cashFlow, spotrebaMesacne: e.target.value})} className="col-span-1 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input value={cashFlow.spotrebaRocne} onChange={(e)=>setCashFlow({...cashFlow, spotrebaRocne: e.target.value})} className="col-span-1 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] text-sm text-center rounded" /></div>
                     </div>
                     <div>
                        <div className="grid grid-cols-3 gap-2 items-end mb-1"><div className="col-span-1 text-xs font-bold text-[#171717] dark:text-[#ededed]">Poiste. neživot:</div><div className="col-span-1 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Mesačne</div><div className="col-span-1 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Ročne</div></div>
                        <div className="grid grid-cols-3 gap-2"><div className="col-span-1"></div><input value={cashFlow.poistNezivot.mesacne} onChange={(e)=>setCashFlow({...cashFlow, poistNezivot: {...cashFlow.poistNezivot, mesacne: e.target.value}})} className="col-span-1 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input value={cashFlow.poistNezivot.rocne} onChange={(e)=>setCashFlow({...cashFlow, poistNezivot: {...cashFlow.poistNezivot, rocne: e.target.value}})} className="col-span-1 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] text-sm text-center rounded" /></div>
                     </div>

                     <div className="col-span-2 mt-2 pt-4 border-t border-[#D1D1D1] dark:border-[#4D4D4D]">
                       <div className="grid grid-cols-7 gap-2 items-end mb-1">
                         <div className="col-span-2 text-xs font-bold text-[#171717] dark:text-[#ededed]">Výdavky & Produkty:</div>
                         <div className="col-span-2 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Mesačná splátka</div>
                         <div className="col-span-3 text-center text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">Aktuálna hodnota (Zostatok)</div>
                       </div>
                       <div className="space-y-2">
                         <div className="grid grid-cols-7 gap-2 items-center"><div className="col-span-2 text-xs">Úvery</div><input className="col-span-2 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input className="col-span-3 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /></div>
                         <div className="grid grid-cols-7 gap-2 items-center"><div className="col-span-2 text-xs">Sporenia</div><input className="col-span-2 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input className="col-span-3 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /></div>
                         <div className="grid grid-cols-7 gap-2 items-center"><div className="col-span-2 text-xs">Investície</div><input className="col-span-2 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input className="col-span-3 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /></div>
                         <div className="grid grid-cols-7 gap-2 items-center"><div className="col-span-2 text-xs">Poistenie životné</div><input className="col-span-2 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /><input className="col-span-3 w-full px-2 py-1.5 bg-orange-100/50 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] rounded text-sm text-center" /></div>
                       </div>
                     </div>
                  </div>

                  {/* IDEALNE MIERY */}
                  <div className="bg-[#FAFAFA] dark:bg-[#222222] rounded p-4 border border-[#ECEDED] dark:border-[#4D4D4D] flex flex-col justify-center">
                    <h3 className="font-extrabold text-sm mb-3">Ideálne finančné miery</h3>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold text-[#4D4D4D] dark:text-[#989FA7] mb-1"><div></div><div>Optimal</div><div>Súčasné</div><div>Rozdiel</div></div>
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-5 gap-1 items-center bg-white dark:bg-[#111111] p-1.5 rounded border border-[#ECEDED] dark:border-[#4D4D4D]">
                        <div className="col-span-1 text-xs font-bold text-center border-r dark:border-[#4D4D4D]">40%</div><div className="col-span-1 text-[10px] px-1 font-semibold">Spotreba</div><div className="col-span-1 text-xs text-right px-1">0 €</div><div className="col-span-1 text-xs text-right px-1">0 €</div><div className="col-span-1 text-xs text-right px-1">0 €</div>
                      </div>
                      <div className="grid grid-cols-5 gap-1 items-center bg-white dark:bg-[#111111] p-1.5 rounded border border-[#ECEDED] dark:border-[#4D4D4D]">
                        <div className="col-span-1 text-xs font-bold text-center border-r dark:border-[#4D4D4D]">30%</div><div className="col-span-1 text-[10px] px-1 font-semibold leading-none">Úvery</div><div className="col-span-1 text-xs text-right px-1">0 €</div><div className="col-span-1 text-xs text-right px-1">0 €</div><div className="col-span-1 text-xs text-right px-1">0 €</div>
                      </div>
                      <div className="grid grid-cols-5 gap-1 items-center bg-white dark:bg-[#111111] p-1.5 rounded border border-[#ECEDED] dark:border-[#4D4D4D]">
                        <div className="col-span-1 text-xs font-bold text-center border-r dark:border-[#4D4D4D]">20%</div><div className="col-span-1 text-[10px] px-1 font-semibold leading-none">Úspory</div><div className="col-span-1 text-xs text-right px-1">0 €</div><div className="col-span-1 text-xs text-right px-1">0 €</div><div className="col-span-1 text-xs text-right px-1">0 €</div>
                      </div>
                      <div className="grid grid-cols-5 gap-1 items-center bg-white dark:bg-[#111111] p-1.5 rounded border border-[#ECEDED] dark:border-[#4D4D4D]">
                        <div className="col-span-1 text-xs font-bold text-center border-r dark:border-[#4D4D4D]">10%</div><div className="col-span-1 text-[10px] px-1 font-semibold leading-none">Rezerva</div><div className="col-span-1 text-xs text-right px-1">0 €</div><div className="col-span-1 text-xs text-right px-1">0 €</div><div className="col-span-1 text-xs text-right px-1">0 €</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================
                 PREPOČTY TAB (Zabezpečenie príjmu)
             ===================== */}
          {activeTab === 'Prepocty' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">Prepočty Zabezpečenia Príjmu</h2>
              </div>
              
              {['KLIENT', 'PARTNER'].map((osoba) => (
                <div key={osoba} className="bg-white dark:bg-[#111111] p-0 rounded-lg border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-md overflow-hidden flex flex-col gap-0 mb-6">
                  
                  {/* Osoba Header Block */}
                  <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] px-4 py-2 border-b border-[#D1D1D1] dark:border-[#2A2A2A] flex flex-wrap lg:flex-nowrap items-center gap-4">
                    <h3 className="font-extrabold text-sm uppercase w-24 text-[#171717] dark:text-white">{osoba}:</h3>
                    <div className="flex flex-1 gap-4 items-center">
                      <div className="flex items-center gap-2 text-xs"><span className="font-bold">Hrubý príjem:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded text-right min-w-[80px]">0 €</span></div>
                      <div className="flex items-center gap-2 text-xs"><span className="font-bold">Príjem čistý:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded text-right min-w-[80px]">0 €</span></div>
                      <div className="flex items-center gap-2 text-xs ml-auto"><span className="font-bold">Vek:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded text-center w-12">0</span></div>
                      <div className="flex items-center gap-2 text-xs"><span className="font-bold">Fajčiar:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded italic text-center min-w-[50px]">nie</span></div>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-8 bg-[#FAFAFA] dark:bg-[#111111]">
                    
                    {/* LEFT COLUMN: Riziká a Úmrtie */}
                    <div className="flex flex-col gap-4">
                      
                      {/* Úmrtie */}
                      <div className="border border-[#AB0534]/30 rounded overflow-hidden">
                        <div className="bg-[#AB0534] text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider shadow-sm">Úmrtie / Úmrtie úrazom</div>
                        <div className="p-3 bg-white dark:bg-[#1A1A1A] flex flex-col gap-2 border-t border-[#AB0534]/20">
                          <div className="flex justify-between items-center text-xs"><span className="font-semibold text-[#4D4D4D] dark:text-[#ededed]">Konštantná suma na zabezpečenie pohrebných nákladov:</span><span className="bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] px-2 py-1 font-bold text-right w-24">4 000 €</span></div>
                          <div className="flex justify-between items-center text-xs"><span className="font-semibold text-[#4D4D4D] dark:text-[#ededed]">Klesajúca suma na zabezpečenie renty:</span><span className="bg-orange-100/30 dark:bg-[#2A2A2A] border border-orange-200 dark:border-[#4D4D4D] px-2 py-1 font-bold text-right w-24">0 €</span></div>
                        </div>
                      </div>

                      {/* Práceneschopnosť */}
                      <div className="border border-[#AB0534]/30 rounded overflow-hidden">
                        <div className="bg-[#AB0534] text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider shadow-sm">Práceneschopnosť (resp.: Denné odškodné v prípade úrazu + Hospitalizácia)</div>
                        <div className="grid grid-cols-5 text-[10px] text-center font-bold bg-[#EAEAEA] dark:bg-[#222]">
                          <div className="col-span-1 p-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D] flex items-center justify-center row-span-2">Dávky od 2. mes. na PN:</div>
                          <div className="col-span-2 p-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D] border-b">Sociálne zabezpečenie</div>
                          <div className="col-span-2 p-1 border-b border-[#D1D1D1] dark:border-[#4D4D4D]">Súkromné zabezpečenie</div>
                          {/* Sub headers */}
                          <div className="col-span-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D] p-1">Mesačná dávka*</div>
                          <div className="col-span-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D] p-1">Denná dávka*</div>
                          <div className="col-span-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D] p-1">Zníženie príjmu</div>
                          <div className="col-span-1 p-1">Optimálna PS/deň</div>
                        </div>
                        <div className="grid grid-cols-5 text-xs text-center bg-white dark:bg-[#1A1A1A]">
                          <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                          <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">0 €</div>
                          <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A] text-[#171717] dark:text-white font-bold">0,00 €</div>
                          <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-orange-100/30 dark:bg-[#333]">0 €</div>
                          <div className="col-span-1 p-1.5 font-bold text-[#AB0534] dark:text-[#ff4a7d]">0,00 €</div>
                        </div>
                      </div>

                      {/* Invalidita */}
                      <div className="border border-[#7A8C99]/50 dark:border-[#4D4D4D] rounded overflow-hidden">
                        <div className="bg-[#EAEAEA] dark:bg-[#2A2A2A] text-[#171717] dark:text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider shadow-sm border-b border-[#D1D1D1] dark:border-[#4D4D4D]">Invalidita - zabezpečenie náhrady príjmu</div>
                        <div className="grid grid-cols-5 text-[10px] text-center font-bold bg-[#FAFAFA] dark:bg-[#222]">
                          <div className="col-span-1 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] flex items-center justify-center row-span-2">Krytie renty v prípade invalidity:</div>
                          <div className="col-span-2 p-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D]">Invalidný dôchodok zo soc. poist.</div>
                          <div className="col-span-2 p-1 border-b border-[#D1D1D1] dark:border-[#4D4D4D]">Optimálne nastavenie z poistenia</div>
                          
                          <div className="col-span-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] p-1 bg-[#4D4D4D] text-white">od 41% do 70%*</div>
                          <div className="col-span-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] p-1 bg-[#4D4D4D] text-white">od 71%*</div>
                          <div className="col-span-1 border-r border-b border-[#D1D1D1] dark:border-[#4D4D4D] p-1 bg-[#7A8C99] text-white">od 41% do 70%</div>
                          <div className="col-span-1 p-1 border-b border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#7A8C99] text-white">od 71%</div>
                        </div>
                        <div className="grid grid-cols-5 text-xs text-center bg-white dark:bg-[#1A1A1A]">
                          <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                          <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">0,00 €</div>
                          <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">0,00 €</div>
                          <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-orange-100/30 dark:bg-[#333]">0 €</div>
                          <div className="col-span-1 p-1.5 bg-orange-100/30 dark:bg-[#333]">0 €</div>
                        </div>
                      </div>

                      {/* HUGE TABLE: Poistna Suma */}
                      <div className="mt-4 border border-[#AB0534]/30 rounded overflow-hidden shadow-sm">
                        <div className="bg-[#AB0534] text-white font-bold text-xs px-3 py-2 text-center uppercase tracking-wider relative">
                           Poistná suma
                        </div>
                        <div className="bg-white dark:bg-[#111111] overflow-x-auto text-[10px]">
                           <table className="w-full text-center">
                             <thead>
                               <tr className="bg-[#4D4D4D] text-white font-bold">
                                 <th className="p-1 border-r border-gray-600 w-1/3"></th>
                                 <th className="p-1 border-r border-gray-600 bg-[#7A8C99]">Optimálna</th>
                                 <th className="p-1 border-r border-gray-600 bg-[#171717]">Nové</th>
                                 <th className="p-1 border-r border-gray-600">% pokrytia</th>
                                 <th className="p-1 border-r border-gray-600">Aktuálne</th>
                                 <th className="p-1">% pokrytia</th>
                               </tr>
                             </thead>
                             <tbody className="bg-white dark:bg-[#1A1A1A] text-xs">
                               <tr className="border-b border-[#D1D1D1] dark:border-[#4D4D4D]">
                                 <td className="p-1.5 text-left border-r dark:border-[rgba(255,255,255,0.1)] font-semibold">Úmrtie</td>
                                 <td className="p-1.5 border-r font-bold">4 000 €</td>
                                 <td className="p-1.5 border-r bg-orange-50 dark:bg-[#2A2A2A]">0%</td>
                                 <td className="p-1.5 border-r bg-gray-100 dark:bg-[#222]"></td>
                                 <td className="p-1.5 border-r bg-orange-50 dark:bg-[#2A2A2A]">0%</td>
                                 <td className="p-1.5"></td>
                               </tr>
                               {/* Empty placeholder rows to simulate the giant matrix */}
                               {[
                                 { name: 'Úmrtie s klesajúcou poistnou' },
                                 { name: 'Krytie renty v prípade invalidity' },
                                 { name: 'Poistenie PN' },
                                 { name: 'Invalidita s konštantnou' },
                                 { name: 'Trvalé následky úrazu' },
                                 { name: 'Závažné ochorenia' }
                               ].map((row, idx) => (
                                 <tr key={idx} className="border-b border-[#D1D1D1] dark:border-[#4D4D4D]">
                                   <td className="p-1.5 text-left border-r dark:border-[rgba(255,255,255,0.1)] text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">{row.name}</td>
                                   <td className="p-1.5 border-r bg-[#FAFAFA] dark:bg-[#222]">0 €</td>
                                   <td className="p-1.5 border-r bg-green-50 dark:bg-green-900/10">---</td>
                                   <td className="p-1.5 border-r">100%</td>
                                   <td className="p-1.5 border-r bg-green-50 dark:bg-green-900/10">---</td>
                                   <td className="p-1.5">100%</td>
                                 </tr>
                               ))}
                             </tbody>
                             <tfoot className="bg-[#EAEAEA] dark:bg-[#222]">
                               <tr>
                                  <td colSpan={2} className="p-2 text-right font-bold text-xs uppercase">Spolu mesačne</td>
                                  <td className="p-2 font-bold border-r dark:border-[rgba(255,255,255,0.1)] bg-black text-white text-right">0,00 €</td>
                                  <td colSpan={3}></td>
                               </tr>
                             </tfoot>
                           </table>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Jednorazove odskodnenie & Vysvetlivky */}
                    <div className="flex flex-col gap-6">
                      <div className="text-[#AB0534] dark:text-[#ff4a7d] font-bold text-center uppercase tracking-wide border-b border-[#AB0534] pb-2">
                        JEDNORÁZOVÉ ODŠKODNENIE V PRÍPADE ZÁVAŽNÝCH ZDRAVOTNÝCH PROBLÉMOV
                      </div>
                      
                      <div className="flex flex-col gap-4">
                         {/* Invalidita box */}
                         <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
                           <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl">0 €</div>
                           <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Invalidita</h4> <span className="text-[10px] uppercase font-bold ml-2 text-[#4D4D4D] dark:text-[#ededed]">Odporúčaná suma</span>
                           <p className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] leading-tight">V prípade uznania invalidity je klientovi vyplatená jednorazovo poistná suma.</p>
                         </div>
                         {/* Trvale nasledky */}
                         <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
                           <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl">0 €</div>
                           <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Trvalé následky úrazu</h4> <span className="text-[10px] uppercase font-bold ml-2 text-[#4D4D4D] dark:text-[#ededed]">Odporúčaná suma</span>
                           <p className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] leading-tight">V prípade trvalého poškodenia následkom úrazu bude vyplatená časť poistnej sumy s ohľadom na percento poškodenia a na dojednanú progresiu.</p>
                         </div>
                         {/* Zavazne ochorenia */}
                         <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
                           <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl">0 €</div>
                           <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Závažné ochorenia</h4> <span className="text-[10px] uppercase font-bold ml-2 text-[#4D4D4D] dark:text-[#ededed]">Odporúčaná suma</span>
                           <p className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] leading-tight">V prípade vzniku ťažkej choroby (rakovina, infarkt myokardu, cievna mozgová príhoda...) poistenej osobe vyplatená dojednaná poistná suma.</p>
                         </div>
                      </div>

                      <div className="text-[9px] text-[#4D4D4D] dark:text-[#989FA7] leading-relaxed border-t border-[#D1D1D1] dark:border-[#4D4D4D] pt-4 mt-2">
                        * Hodnota je orientačná. Presný výpočet závisí od aktuálnych podmienok Sociálnej poisťovne a výšky odvodov do Sociálnej poisťovne.<br/><br/>
                        - Náhrada mzdy zo Sociálnej poisťovne v prípade PN sa rovná 55% vymeriavacieho základu (maximálne 55% z 94,0274 € na deň a teda maximálna mesačná suma je 1 551,45 €).<br/>
                        - Predpokladaný maximálny invalidný dôchodok vyplácaný Sociálnou poisťovňou za ideálnych podmienok je 2 012 €. Po zohľadnení zníženia za obdobie kedy klient nepracoval.
                      </div>
                      
                      <div className="mt-auto flex items-center gap-3 pt-4 border-t border-[#D1D1D1] dark:border-[#4D4D4D]">
                        <span className="font-bold text-sm text-[#171717] dark:text-[#ededed]">Bude riešené v Partners poisťovni?</span>
                        <div className="border border-[#171717] dark:border-white px-4 py-1 rounded bg-white dark:bg-black font-bold text-sm">
                          áno
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =====================
                 INÉ TABY (Zatial prazdne)
             ===================== */}
          {activeTab !== 'AOF' && activeTab !== 'Prepocty' && (

            <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-[#ECEDED] dark:bg-[#1A1A1A] flex items-center justify-center mb-6">
                <Target size={40} className="text-[#AB0534]" />
              </div>
              <h2 className="text-2xl font-extrabold mb-2">Záložka: {activeTab}</h2>
              <p className="text-[#989FA7] max-w-md">Túto časť prepojím priamo na logiku z doručených excelovských screenshotov v ďalšom kroku.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
