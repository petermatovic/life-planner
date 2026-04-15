'use client';
import React from 'react';
import { useAppStore } from '@/store/appStore';

export default function TabPrepocty() {
  const { klient, partner, hasPartner } = useAppStore();

  const renderOsoba = (osobaName: string, osobaData: any) => {
    const hruby = Number(osobaData.hruby) || 0;
    const cisty = Number(osobaData.cistyMesacne) || 0;
    
    // Vzorce - Priblizne na zaklade percent pre PN atd.
    const pohrebne = 4000;
    const socDavkaMesacna = hruby > 0 ? Math.min(hruby * 0.55, 1551.45) : 0;
    const socDavkaDenna = socDavkaMesacna / 30;
    const znizeniePrijmu = Math.max(0, cisty - socDavkaMesacna);
    const optimalnaPNnaDen = znizeniePrijmu / 30;

    const invaliditaSocOd41 = cisty * 0.4;
    const optimalnaInvalOd41 = Math.max(0, cisty - invaliditaSocOd41);
    
    const invaliditaSocOd71 = cisty * 0.7;
    const optimalnaInvalOd71 = Math.max(0, cisty - invaliditaSocOd71);

    return (
      <div key={osobaName} className="bg-white dark:bg-[#111111] p-0 rounded-lg border border-[#D1D1D1] dark:border-[#2A2A2A] shadow-md overflow-hidden flex flex-col gap-0 mb-6">
        {/* Osoba Header Block */}
        <div className="bg-[#EAEAEA] dark:bg-[#1A1A1A] px-4 py-2 border-b border-[#D1D1D1] dark:border-[#2A2A2A] flex flex-wrap lg:flex-nowrap items-center gap-4">
          <h3 className="font-extrabold text-sm uppercase w-24 text-[#171717] dark:text-white">{osobaName}:</h3>
          <div className="flex flex-1 gap-4 items-center">
            <div className="flex items-center gap-2 text-xs"><span className="font-bold">Hrubý príjem:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded text-right min-w-[80px]">{hruby.toFixed(2)} €</span></div>
            <div className="flex items-center gap-2 text-xs"><span className="font-bold">Príjem čistý:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded text-right min-w-[80px]">{cisty.toFixed(2)} €</span></div>
            <div className="flex items-center gap-2 text-xs ml-auto"><span className="font-bold">Vek:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded text-center w-12">{osobaData.vekPos || 0}</span></div>
            <div className="flex items-center gap-2 text-xs"><span className="font-bold">Fajčiar:</span><span className="bg-orange-100/50 dark:bg-[#333] px-2 py-0.5 border border-orange-200 dark:border-[#4D4D4D] rounded italic text-center min-w-[50px]">{osobaData.fajciar ? 'áno' : 'nie'}</span></div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-8 bg-[#FAFAFA] dark:bg-[#111111]">
          {/* LEFT COLUMN: Riziká a Úmrtie */}
          <div className="flex flex-col gap-4">
            
            {/* Úmrtie */}
            <div className="border border-[#AB0534]/30 rounded overflow-hidden">
              <div className="bg-[#AB0534] text-white font-bold text-xs px-3 py-1.5 uppercase tracking-wider shadow-sm">Úmrtie / Úmrtie úrazom</div>
              <div className="p-3 bg-white dark:bg-[#1A1A1A] flex flex-col gap-2 border-t border-[#AB0534]/20">
                <div className="flex justify-between items-center text-xs"><span className="font-semibold text-[#4D4D4D] dark:text-[#ededed]">Konštantná suma na zabezpečenie pohrebných nákladov:</span><span className="bg-white dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4D4D4D] px-2 py-1 font-bold text-right w-24">{pohrebne.toLocaleString()} €</span></div>
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
                
                <div className="col-span-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D] p-1">Mesačná dávka*</div>
                <div className="col-span-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D] p-1">Denná dávka*</div>
                <div className="col-span-1 border-r border-[#D1D1D1] dark:border-[#4D4D4D] p-1">Zníženie príjmu</div>
                <div className="col-span-1 p-1">Optimálna PS/deň</div>
              </div>
              <div className="grid grid-cols-5 text-xs text-center bg-white dark:bg-[#1A1A1A]">
                <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D]"></div>
                <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">{socDavkaMesacna.toFixed(2)} €</div>
                <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A] text-[#171717] dark:text-white font-bold">{socDavkaDenna.toFixed(2)} €</div>
                <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-orange-100/30 dark:bg-[#333] text-red-500 font-semibold">{znizeniePrijmu.toFixed(2)} €</div>
                <div className="col-span-1 p-1.5 font-bold text-[#AB0534] dark:text-[#ff4a7d]">{optimalnaPNnaDen.toFixed(2)} €</div>
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
                <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">{invaliditaSocOd41.toFixed(2)} €</div>
                <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-[#FAFAFA] dark:bg-[#2A2A2A]">{invaliditaSocOd71.toFixed(2)} €</div>
                <div className="col-span-1 p-1.5 border-r border-[#D1D1D1] dark:border-[#4D4D4D] bg-orange-100/30 dark:bg-[#333] text-[#AB0534] font-bold">{optimalnaInvalOd41.toFixed(2)} €</div>
                <div className="col-span-1 p-1.5 bg-orange-100/30 dark:bg-[#333] text-[#AB0534] font-bold">{optimalnaInvalOd71.toFixed(2)} €</div>
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
                       <th className="p-1 border-r border-gray-600 bg-[#171717]">Nové (test)</th>
                       <th className="p-1 border-r border-gray-600">% pokrytia</th>
                       <th className="p-1 border-r border-gray-600">Aktuálne</th>
                       <th className="p-1">% pokrytia</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white dark:bg-[#1A1A1A] text-xs">
                     <tr className="border-b border-[#D1D1D1] dark:border-[#4D4D4D]">
                       <td className="p-1.5 text-left border-r dark:border-[rgba(255,255,255,0.1)] font-semibold">Úmrtie</td>
                       <td className="p-1.5 border-r font-bold">{pohrebne} €</td>
                       <td className="p-1.5 border-r bg-orange-50 dark:bg-[#2A2A2A]">0%</td>
                       <td className="p-1.5 border-r bg-gray-100 dark:bg-[#222]"></td>
                       <td className="p-1.5 border-r bg-orange-50 dark:bg-[#2A2A2A]">0%</td>
                       <td className="p-1.5"></td>
                     </tr>
                     {/* Empty placeholder rows to simulate the giant matrix */}
                     {[
                       { name: 'Úmrtie s klesajúcou poistnou', opt: 0 },
                       { name: 'Krytie renty v prípade invalidity', opt: optimalnaInvalOd71 * 12 * 20 }, // rough estimate
                       { name: 'Poistenie PN', opt: optimalnaPNnaDen },
                       { name: 'Trvalé následky úrazu', opt: Math.min(2 * cisty * 12, 50000) },
                       { name: 'Závažné ochorenia', opt: Math.min(cisty * 12 * 2, 30000) }
                     ].map((row, idx) => (
                       <tr key={idx} className="border-b border-[#D1D1D1] dark:border-[#4D4D4D]">
                         <td className="p-1.5 text-left border-r dark:border-[rgba(255,255,255,0.1)] text-[10px] text-[#4D4D4D] dark:text-[#989FA7]">{row.name}</td>
                         <td className="p-1.5 border-r bg-[#FAFAFA] dark:bg-[#222] font-semibold">{row.opt.toLocaleString('sk-SK', {maximumFractionDigits:0})} €</td>
                         <td className="p-1.5 border-r bg-green-50 dark:bg-green-900/10">---</td>
                         <td className="p-1.5 border-r">0%</td>
                         <td className="p-1.5 border-r bg-green-50 dark:bg-green-900/10">---</td>
                         <td className="p-1.5">0%</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Jednorazove odskodnenie & Vysvetlivky */}
          <div className="flex flex-col gap-6">
            <div className="text-[#AB0534] dark:text-[#ff4a7d] font-bold text-center uppercase tracking-wide border-b border-[#AB0534] pb-2">
              JEDNORÁZOVÉ ODŠKODNENIE
            </div>
            
            <div className="flex flex-col gap-4">
               {/* Invalidita box */}
               <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
                 <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl text-[#AB0534]">{(optimalnaInvalOd71 * 12 * 20).toLocaleString('sk-SK', {maximumFractionDigits:0})} €</div>
                 <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Invalidita</h4> <span className="text-[10px] uppercase font-bold ml-2 text-[#4D4D4D] dark:text-[#ededed]">Odporúčaná suma</span>
                 <p className="text-[10px] text-[#4D4D4D] dark:text-[#989FA7] leading-tight">V prípade uznania invalidity je klientovi vyplatená jednorazovo poistná suma.</p>
               </div>
               {/* Trvale nasledky */}
               <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
                 <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl text-[#AB0534]">{(Math.min(2 * cisty * 12, 50000)).toLocaleString('sk-SK')} €</div>
                 <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Trvalé následky úrazu</h4> <span className="text-[10px] uppercase font-bold ml-2 text-[#4D4D4D] dark:text-[#ededed]">Odporúčaná suma</span>
               </div>
               {/* Zavazne ochorenia */}
               <div className="border border-[#7A8C99] rounded p-3 bg-white dark:bg-[#1A1A1A] relative shadow-sm">
                 <div className="absolute top-0 right-0 bg-[#EAEAEA] dark:bg-[#333] px-4 py-1 text-xs font-bold border-l border-b border-[#7A8C99] rounded-bl text-[#AB0534]">{(Math.min(cisty * 12 * 2, 30000)).toLocaleString('sk-SK')} €</div>
                 <h4 className="font-bold text-xs bg-[#7A8C99] text-white inline-block px-2 py-0.5 mb-2 uppercase">Závažné ochorenia</h4> <span className="text-[10px] uppercase font-bold ml-2 text-[#4D4D4D] dark:text-[#ededed]">Odporúčaná suma</span>
               </div>
            </div>

            <div className="text-[9px] text-[#4D4D4D] dark:text-[#989FA7] leading-relaxed border-t border-[#D1D1D1] dark:border-[#4D4D4D] pt-4 mt-2">
              * Hodnota je orientačná. Presný výpočet závisí od aktuálnych podmienok Sociálnej poisťovne...
            </div>
            
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white border-l-4 border-[#AB0534] pl-3">Prepočty Zabezpečenia Príjmu</h2>
        <div className="bg-[#AB0534]/10 text-[#AB0534] px-3 py-1 rounded border border-[#AB0534]/30 font-bold text-xs">Aktivované živé výpočty (odhad)</div>
      </div>
      
      {renderOsoba('KLIENT', klient)}
      {hasPartner && renderOsoba('PARTNER', partner)}
    </div>
  );
}
