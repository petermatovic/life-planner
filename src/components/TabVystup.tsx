'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';
import { Download, Printer, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TabVystup() {
  const state = useAppStore();
  const { klient, partner, hasPartner, cashFlow } = state;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", \`vystup_\${klient.meno || 'klient'}.json\`);
    dlAnchorElem.click();
  };

  const prijmySpolu = Number(klient.cistyMesacne || 0) + Number(klient.pasivnyMesacne || 0) + (hasPartner ? Number(partner.cistyMesacne || 0) + Number(partner.pasivnyMesacne || 0) : 0);
  const vydavkySpolu = Number(cashFlow.spotrebaMesacne || 0) + Number(cashFlow.uverySplatka || 0) + Number(cashFlow.sporeniaSplatka || 0) + Number(cashFlow.investicieSplatka || 0) + Number(cashFlow.poistZivotSplatka || 0) + Number(cashFlow.poistNezivotMesacne || 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-20">
      
      <div className="flex items-center justify-between mb-4 border-b border-[#D1D1D1] dark:border-[#4D4D4D] pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3 flex items-center gap-2">
            Záverečný Výstup
          </h2>
          <p className="text-sm font-bold text-[#4D4D4D] dark:text-[#989FA7] mt-2 ml-4">
            Kompletný audit a manažérske zhrnutie pre klienta
          </p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.print()} className="bg-white dark:bg-[#2A2A2A] text-[#171717] dark:text-white border border-[#D1D1D1] dark:border-[#4D4D4D] px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-[#EAEAEA] dark:hover:bg-[#333] transition print:hidden">
              <Printer size={16}/> Tlačiť PDF
           </button>
           <button onClick={handleExportJSON} className="bg-[#AB0534] text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-[#8A042A] transition print:hidden">
              <Download size={16}/> JSON Dáta
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        {/* ZHRNUTIE RODINY */}
        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
          <h3 className="font-extrabold text-lg uppercase mb-4 tracking-wide text-[#AB0534]">Zhrnutie profilu</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b dark:border-[#333] pb-1"><span className="text-[#4D4D4D] dark:text-[#989FA7]">Klient:</span> <span className="font-bold text-[#171717] dark:text-white">{klient.meno || 'Nešpecifikovaný'} ({klient.vekPos || 0}r)</span></li>
            {hasPartner && <li className="flex justify-between border-b dark:border-[#333] pb-1"><span className="text-[#4D4D4D] dark:text-[#989FA7]">Partner:</span> <span className="font-bold text-[#171717] dark:text-white">{partner.meno || 'Nešpecifikovaný'} ({partner.vekPos || 0}r)</span></li>}
            <li className="flex justify-between border-b dark:border-[#333] pb-1"><span className="text-[#4D4D4D] dark:text-[#989FA7]">Počet detí:</span> <span className="font-bold text-[#171717] dark:text-white">{state.deti.length}</span></li>
            <li className="flex justify-between pt-2"><span className="text-[#4D4D4D] dark:text-[#989FA7]">Spoločný príjem:</span> <span className="font-extrabold text-lg text-green-600 dark:text-green-500">{prijmySpolu.toLocaleString('sk-SK')} €</span></li>
          </ul>
        </div>

        {/* ZHRNUTIE ZDRAVIA */}
        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-sm">
          <h3 className="font-extrabold text-lg uppercase mb-4 tracking-wide text-[#AB0534]">Finančné zdravie</h3>
          <div className="space-y-4 text-sm">
             <div className="flex items-center gap-3">
               {vydavkySpolu < prijmySpolu ? <CheckCircle size={24} className="text-green-500" /> : <AlertTriangle size={24} className="text-red-500" />}
               <div>
                 <p className="font-bold text-[#171717] dark:text-white">Cashflow rodiny</p>
                 <p className="text-[#4D4D4D] dark:text-[#989FA7] text-xs">Mesačne Vám zostáva {(prijmySpolu - vydavkySpolu).toLocaleString('sk-SK')} € voľných prostriedkov na investovanie a tvorenie rezervy.</p>
               </div>
             </div>
             
             <div className="flex items-center gap-3 mt-4">
               {Number(cashFlow.uverySplatka) / prijmySpolu > 0.30 ? <AlertTriangle size={24} className="text-orange-500" /> : <CheckCircle size={24} className="text-green-500" />}
               <div>
                 <p className="font-bold text-[#171717] dark:text-white">Úverové zaťaženie</p>
                 <p className="text-[#4D4D4D] dark:text-[#989FA7] text-xs">Aktuálne Vám úvery tvoria {((Number(cashFlow.uverySplatka) / (prijmySpolu || 1)) * 100).toFixed(1)}% z príjmov. Limit zdravých financií je 30%.</p>
               </div>
             </div>
          </div>
        </div>

      </div>

      <div className="bg-[#FAFAFA] dark:bg-[#111111] p-8 text-center rounded-xl border border-dashed border-[#D1D1D1] dark:border-[#4D4D4D] mt-4 print:hidden">
         <h4 className="font-bold text-[#171717] dark:text-white mb-2">Tento dokument je pripravený na prezentáciu!</h4>
         <p className="text-sm text-[#4D4D4D] dark:text-[#989FA7] max-w-lg mx-auto">
           Kliknutím na tlačidlo hore <strong>Tlačiť PDF</strong> premeníte túto stránku na formátovaný A4 dokument. 
           V budúcnosti tu bude nasadené dynamické generovanie plnohodnotného dokumentu z celej analýzy.
         </p>
      </div>

    </div>
  );
}
