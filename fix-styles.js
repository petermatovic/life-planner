const fs = require('fs');

let store = fs.readFileSync('src/store/appStore.ts', 'utf8');
store = store.replace(
  /klient: \{\s*meno: '', vekPos: '', hruby: '', cistyMesacne: '', cistyRocne: '', pasivnyMesacne: '', pasivnyRocne: '', fajciar: false,\s*\}/,
  `klient: {\n    meno: 'Jozef', vekPos: 35, hruby: 2600, cistyMesacne: 2000, cistyRocne: 4900, pasivnyMesacne: 0, pasivnyRocne: 0, fajciar: false,\n  }`
);
store = store.replace(
  /partner: \{\s*meno: '', vekPos: '', hruby: '', cistyMesacne: '', cistyRocne: '', pasivnyMesacne: '', pasivnyRocne: '', fajciar: false,\s*\}/,
  `partner: {\n    meno: 'Mária', vekPos: 33, hruby: 1900, cistyMesacne: 1500, cistyRocne: 1000, pasivnyMesacne: 0, pasivnyRocne: 0, fajciar: false,\n  }`
);
store = store.replace(
  `byvanieSumaUveru: '', byvanieSplatnost: '', byvanieUrok: '', byvanieNesplatenyDiel: ''`,
  `byvanieSumaUveru: 80000, byvanieSplatnost: 20, byvanieUrok: 3.5, byvanieNesplatenyDiel: 80000`
);
store = store.replace(
  `zabezpecenieKlientRenta: '', zabezpeceniePartnerRenta: ''`,
  `zabezpecenieKlientRenta: 1500, zabezpeceniePartnerRenta: 1200`
);
store = store.replace(
  /cashFlow: \{\s*spotrebaMesacne: '', spotrebaRocne: '',\s*uverySplatka: '', uveryZostatok: '',\s*sporeniaSplatka: '', sporeniaZostatok: '',\s*investicieSplatka: '', investicieZostatok: '',\s*poistZivotSplatka: '', poistZivotZostatok: '',\s*poistNezivotMesacne: '', poistNezivotRocne: '',\s*zostatokUcet: '',\s*\}/,
  `cashFlow: {\n    spotrebaMesacne: 1200, spotrebaRocne: 1500,\n    uverySplatka: 464, uveryZostatok: 80000,\n    sporeniaSplatka: 150, sporeniaZostatok: 8500,\n    investicieSplatka: 200, investicieZostatok: 12400,\n    poistZivotSplatka: 60, poistZivotZostatok: 0,\n    poistNezivotMesacne: 15, poistNezivotRocne: 180,\n    zostatokUcet: 5000,\n  }`
);
fs.writeFileSync('src/store/appStore.ts', store);

let aof = fs.readFileSync('src/components/TabAOF.tsx', 'utf8');

// 1. All standalone inputs with border but no explicit bg become white
aof = aof.replace(/className="([^"]*\bborder\b[^"]*)"/g, (match, p1) => {
   if (p1.includes('bg-') || p1.includes('readOnly') || p1.includes('transparent')) {
      return match;
   }
   return `className="${p1} bg-white dark:bg-[#111]"`;
});

// 2. Fix the initial input rows
aof = aof.replace(/bg-white dark:bg-\[#2A2A2A\]/g, 'bg-white dark:bg-[#111]');

// 3. Make readOnly completely distinct (grayish)
aof = aof.replace(/bg-transparent cursor-default/g, 'bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA]');
aof = aof.replace(/readOnly className="border px-1 bg-white dark:bg-\[#111\]"/g, 'readOnly className="border px-1 bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA]"');

fs.writeFileSync('src/components/TabAOF.tsx', aof);
console.log('fixed styles and defaults');
