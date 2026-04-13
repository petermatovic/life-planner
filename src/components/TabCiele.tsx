'use client';
import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Plus, Trash2 } from 'lucide-react';

export default function TabCiele() {
  const [ciele, setCiele] = useState([
    { id: 1, nazov: 'Dôchodok Klient', suma: 150000, horizont: 25, vynos: 6, sucasnyStav: 0 },
    { id: 2, nazov: 'Rýchlejšie splatenie Hypo', suma: 50000, horizont: 10, vynos: 4, sucasnyStav: 5000 },
  ]);

  // Pomocna matika: Potrebná mesačná investícia (zjednodušený vzorec buducej hodnoty)
  const calculateMesacnaInvesticia = (suma: number, horizont: number, vynosPct: number, sucasnyStav: number) => {
    if (!suma || !horizont) return 0;
    const r = (vynosPct / 100) / 12; // mesacny urok
    const n = horizont * 12; // pocet mesiacov
    
    // Ak je urok 0, len to rovnomerne vydelime
    if (r === 0) return Math.max(0, (suma - sucasnyStav) / n);
    
    // Zohladnenie sucasneho stavu
    const fvSucasnehoStavu = sucasnyStav * Math.pow(1 + r, n);
    const zbytokNaDosporenie = Math.max(0, suma - fvSucasnehoStavu);
    
    // Potrebna splatka na dosporenie zbytku pmt = FV * (r / ((1+r)^n - 1))
    const pmt = zbytokNaDosporenie * (r / (Math.pow(1 + r, n) - 1));
    return pmt;
  };

  const pridatCiel = () => {
    setCiele([...ciele, { id: Date.now(), nazov: 'Nový cieľ', suma: 0, horizont: 10, vynos: 5, sucasnyStav: 0 }]);
  };

  const updateCiel = (id: number, field: string, value: any) => {
    setCiele(ciele.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const odstranitCiel = (id: number) => {
    setCiele(ciele.filter(c => c.id !== id));
  };

  const totalPotrebaInvestovat = ciele.reduce((acc, c) => acc + calculateMesacnaInvesticia(c.suma, c.horizont, c.vynos, c.sucasnyStav), 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      <div className="flex items-center justify-between mb-2 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3 flex items-center gap-2">
            Finančné Ciele
          </h2>
          <p className="text-sm font-bold text-[#4D4D4D] dark:text-[#989FA7] mt-2 ml-4">
            Definícia a matematický prepočet rentability cieľov rodiny
          </p>
        </div>
        <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-bold shadow-lg flex flex-col items-end">
           <span className="text-[10px] uppercase tracking-widest opacity-80">Nutné mesačne investovať</span>
           <span className="text-xl">{totalPotrebaInvestovat.toLocaleString('sk-SK', {maximumFractionDigits: 0})} €</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ciele.map((c, index) => {
          const pmt = calculateMesacnaInvesticia(c.suma, c.horizont, c.vynos, c.sucasnyStav);
          
          return (
            <div key={c.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm overflow-hidden flex flex-col lg:flex-row">
               
               {/* Left ID block */}
               <div className="bg-[#EAEAEA] dark:bg-[#222] w-full lg:w-16 flex lg:flex-col items-center justify-center p-2 border-b lg:border-b-0 lg:border-r border-[#D1D1D1] dark:border-[#333]">
                 <span className="text-xs font-bold text-[#989FA7]">Cieľ</span>
                 <span className="text-xl font-extrabold text-[#171717] dark:text-white">#{index + 1}</span>
               </div>
               
               {/* Main Input Block */}
               <div className="flex-1 p-5 lg:p-6 grid grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                  
                  <div className="col-span-2 lg:col-span-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-[#4D4D4D] dark:text-[#989FA7] tracking-wider">Názov cieľa</label>
                    <input type="text" value={c.nazov} onChange={e => updateCiel(c.id, 'nazov', e.target.value)} className="w-full bg-[#FAFAFA] dark:bg-[#111111] border border-[#D1D1D1] dark:border-[#4D4D4D] px-3 py-2 rounded focus:border-[#AB0534] outline-none font-bold text-sm" />
                  </div>
                  
                  <div className="col-span-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-[#4D4D4D] dark:text-[#989FA7] tracking-wider">Cieľová suma (€)</label>
                    <input type="number" value={c.suma || ''} onChange={e => updateCiel(c.id, 'suma', Number(e.target.value))} className="w-full bg-[#FAFAFA] dark:bg-[#111111] border border-[#D1D1D1] dark:border-[#4D4D4D] px-3 py-2 rounded focus:border-[#AB0534] outline-none font-bold text-sm text-right" />
                  </div>

                  <div className="col-span-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-[#4D4D4D] dark:text-[#989FA7] tracking-wider">Súčasný stav (€)</label>
                    <input type="number" value={c.sucasnyStav || ''} onChange={e => updateCiel(c.id, 'sucasnyStav', Number(e.target.value))} className="w-full bg-[#FAFAFA] dark:bg-[#111111] border border-[#D1D1D1] dark:border-[#4D4D4D] px-3 py-2 rounded focus:border-[#AB0534] outline-none font-bold text-sm text-right" />
                  </div>

                  <div className="col-span-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-[#4D4D4D] dark:text-[#989FA7] tracking-wider">Horizont (Roky)</label>
                    <input type="number" value={c.horizont || ''} onChange={e => updateCiel(c.id, 'horizont', Number(e.target.value))} className="w-full bg-[#FAFAFA] dark:bg-[#111111] border border-[#D1D1D1] dark:border-[#4D4D4D] px-3 py-2 rounded focus:border-[#AB0534] outline-none font-bold text-sm text-center" />
                  </div>

                  <div className="col-span-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-[#4D4D4D] dark:text-[#989FA7] tracking-wider">Očak. Výnos p.a.</label>
                    <div className="relative">
                       <input type="number" value={c.vynos || ''} onChange={e => updateCiel(c.id, 'vynos', Number(e.target.value))} className="w-full bg-[#FAFAFA] dark:bg-[#111111] border border-[#D1D1D1] dark:border-[#4D4D4D] px-3 py-2 pr-6 rounded focus:border-[#AB0534] outline-none font-bold text-sm text-center" />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-50">%</span>
                    </div>
                  </div>

               </div>

               {/* Right Results Block */}
               <div className="bg-[#FAFAFA] dark:bg-[#222] w-full lg:w-48 p-4 border-t lg:border-t-0 lg:border-l border-[#D1D1D1] dark:border-[#333] flex flex-col justify-center relative">
                  <button onClick={() => odstranitCiel(c.id)} className="absolute top-2 right-2 text-[#989FA7] hover:text-[#AB0534] p-1"><Trash2 size={14}/></button>
                  <span className="text-[10px] font-bold uppercase text-[#4D4D4D] dark:text-[#989FA7] tracking-wider mb-1">Mesačná Úložka</span>
                  <div className="text-xl font-extrabold text-[#AB0534] dark:text-[#ff4a7d]">{pmt.toLocaleString('sk-SK', {maximumFractionDigits: 0})} €</div>
               </div>
            </div>
          );
        })}

        <button onClick={pridatCiel} className="bg-white dark:bg-[#1A1A1A] border-2 border-dashed border-[#D1D1D1] dark:border-[#4D4D4D] rounded-xl p-4 flex items-center justify-center gap-2 text-[#4D4D4D] dark:text-[#989FA7] hover:text-[#171717] dark:hover:text-white hover:border-[#AB0534] transition font-bold text-sm">
           <Plus size={18} /> Pridať ďalší cieľ
        </button>

      </div>
    </div>
  );
}
