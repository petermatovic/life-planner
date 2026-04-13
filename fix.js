const fs = require('fs');
const file = 'src/components/TabAOF.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. ADD calcPmt
content = content.replace(
  'const sucRezerva = rozdiel; // Assigning leftover cash space to res',
  `const sucRezerva = rozdiel; // Assigning leftover cash space to res

  // Hypotekarna matematika
  const calcPmt = (suma, rocky, urok) => {
    if (!suma || !rocky || !urok) return 0;
    const r = (Number(urok) / 100) / 12;
    const n = Number(rocky) * 12;
    return (Number(suma) * r) / (1 - Math.pow(1 + r, -n));
  };
  const byvanieSplatka = calcPmt(aofCiele.byvanieSumaUveru, aofCiele.byvanieSplatnost, aofCiele.byvanieUrok);`
);

// 2. Fix rezerva binding
content = content.replace(
  `value={aofCiele.byvanieSumaUveru /* using dummy tmp variable */} \r
                       onChange={() => {}}`,
  `value={aofCiele.zakladnaRezerva || ''} 
                       onChange={(e) => setAofCiele({zakladnaRezerva: Number(e.target.value) || ''})}`
);
content = content.replace(
  `value={aofCiele.byvanieSumaUveru /* using dummy tmp variable */} \n                       onChange={() => {}}`,
  `value={aofCiele.zakladnaRezerva || ''} \n                       onChange={(e) => setAofCiele({zakladnaRezerva: Number(e.target.value) || ''})}`
);


// 3. Fix Byvanie block
let byvanieTarget = `<div className="w-1/4 font-extrabold flex justify-between items-center">{t('aof.byvanie')} <input type="checkbox" checked={aofCiele.byvanieCheckbox} onChange={e=>setAofCiele({byvanieCheckbox: e.target.checked})} /></div>`;
let byvanieRep = `<div className="w-1/4 font-extrabold flex flex-col gap-2">{t('aof.byvanie')} <input type="checkbox" checked={aofCiele.byvanieCheckbox} onChange={e=>setAofCiele({byvanieCheckbox: e.target.checked})} className="self-end" /><input type="text" value={aofCiele.byvanieNazov} onChange={e=>setAofCiele({byvanieNazov: e.target.value})} className="border font-normal px-1 w-full mt-2 bg-white dark:bg-[#111]" /></div>`;
content = content.replace(byvanieTarget, byvanieRep);

let splatkaTarget = `<span className="border text-center px-1 bg-white dark:bg-[#111] flex-1 min-h-[22px]"></span></div>`;
let splatkaRep = `<span className="border text-center px-1 bg-white dark:bg-[#111] flex-1 min-h-[22px] font-bold text-[#AB0534]">{byvanieSplatka > 0 ? \`\${byvanieSplatka.toFixed(0)} €\` : ''}</span></div>`;
content = content.replace(splatkaTarget, splatkaRep);

fs.writeFileSync(file, content);
console.log('Fixed');
