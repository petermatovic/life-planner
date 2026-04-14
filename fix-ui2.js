const fs = require('fs');

let store = fs.readFileSync('src/store/appStore.ts', 'utf8');

// 1. Update AofCieleSetup interface
store = store.replace(
  `  sociCheckbox: boolean;\n  sociSuma: number | '';`,
  `  sociCheckboxKlient: boolean;\n  sociCheckboxPartner: boolean;\n  sociSuma: number | '';`
);
store = store.replace(
  `  rezervaMDCheckbox: boolean;`,
  `  rezervaMDCheckbox: boolean;\n  rezervaMDRenta: number | '';\n  rezervaMDDoba: number | '';\n  rezervaMDRoky: number | '';\n  ineCieleExpand: boolean;`
);

// 2. Update initial state
store = store.replace(
  `sociCheckbox: false, sociSuma: '',`,
  `sociCheckboxKlient: false, sociCheckboxPartner: false, sociSuma: '',`
);
store = store.replace(
  `rezervaMDCheckbox: false,`,
  `rezervaMDCheckbox: false, rezervaMDRenta: '', rezervaMDDoba: '', rezervaMDRoky: '', ineCieleExpand: false,`
);
fs.writeFileSync('src/store/appStore.ts', store);

let aof = fs.readFileSync('src/components/TabAOF.tsx', 'utf8');

// 1. Add vypocitanaDavkaSofiPartner
aof = aof.replace(
  `const vypocitanaDavkaSofiKlient = klientPrijemSpolu * 0.40;`,
  `const vypocitanaDavkaSofiKlient = klientPrijemSpolu * 0.40;\n  const vypocitanaDavkaSofiPartner = partnerPrijemSpolu * 0.40;`
);

// 2. Fix Sociálna poisťovňa
const sociHtml = `
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#D1D1D1] dark:border-[#333]">
                  <span className="flex-1">{t('aof.davkaSofi')}</span>
                  <input type="checkbox" checked={aofCiele.sociCheckbox} onChange={e=>setAofCiele({sociCheckbox: e.target.checked})} className="mx-2" />
                  <input type="text" readOnly value={aofCiele.sociCheckbox && vypocitanaDavkaSofiKlient > 0 ? \`\${vypocitanaDavkaSofiKlient.toFixed(0)} €\` : ''} className={\`border px-1 text-center w-1/3 bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA] \${!aofCiele.sociCheckbox && 'opacity-50'}\`} />
                </div>
`;
const sociNewHtml = `
                <div className="grid grid-cols-3 items-center mt-3 pt-2 border-t border-[#D1D1D1] dark:border-[#333]">
                  <div className="font-bold">Dávka zo sociálnej poisťovne</div>
                  <div className={\`mx-1 flex items-center justify-between border px-2 py-0.5 bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA] \${!aofCiele.sociCheckboxKlient && 'opacity-50'}\`}>
                     <input type="checkbox" checked={aofCiele.sociCheckboxKlient} onChange={e=>setAofCiele({sociCheckboxKlient: e.target.checked})} className="cursor-pointer" />
                     <span className="text-center w-full">{aofCiele.sociCheckboxKlient && vypocitanaDavkaSofiKlient > 0 ? \`\${vypocitanaDavkaSofiKlient.toFixed(0)} €\` : ''}</span>
                  </div>
                  <div className={\`mx-1 flex items-center justify-between border px-2 py-0.5 bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA] \${!aofCiele.sociCheckboxPartner && 'opacity-50'}\`}>
                     <input type="checkbox" checked={aofCiele.sociCheckboxPartner} onChange={e=>setAofCiele({sociCheckboxPartner: e.target.checked})} className="cursor-pointer" />
                     <span className="text-center w-full">{aofCiele.sociCheckboxPartner && vypocitanaDavkaSofiPartner > 0 ? \`\${vypocitanaDavkaSofiPartner.toFixed(0)} €\` : ''}</span>
                  </div>
                </div>
`;
aof = aof.replace(sociHtml.trim(), sociNewHtml.trim());

// 3. Fix MD
const mdHtml = `
           {/* Rezerva MD */}
           <div className="flex items-center gap-4 mb-4">
             <div className="w-1/4 font-extrabold flex justify-between items-center">{t('aof.rezervaMD')} <input type="checkbox" checked={aofCiele.rezervaMDCheckbox} onChange={e=>setAofCiele({rezervaMDCheckbox: e.target.checked})} /></div>
           </div>
`;
const mdNewHtml = `
           {/* Rezerva MD */}
           <div className="flex items-start gap-4 mb-4 pb-4 border-b border-[#D1D1D1] dark:border-[#333]">
             <div className="w-1/4 font-extrabold flex justify-between items-center">Rezerva na materskú dovolenku <input type="checkbox" checked={aofCiele.rezervaMDCheckbox} onChange={e=>setAofCiele({rezervaMDCheckbox: e.target.checked})} /></div>
             <div className={\`flex-1 flex flex-col gap-1 transition-opacity \${!aofCiele.rezervaMDCheckbox && 'opacity-50 pointer-events-none'}\`}>
                <div className="grid grid-cols-4 text-center mb-1"><div className="font-bold">Potrebná suma</div><div className="font-bold">Výška renty</div><div className="font-bold">Doba na MD</div><div className="font-bold">O koľko rokov</div></div>
                <div className="grid grid-cols-4 gap-2">
                   <input type="text" readOnly value={(aofCiele.rezervaMDRenta && aofCiele.rezervaMDDoba) ? \`\${(Number(aofCiele.rezervaMDRenta) * Number(aofCiele.rezervaMDDoba)).toFixed(0)} €\` : ''} className="border text-center px-1 bg-[#D6D6D6] dark:bg-[#333] cursor-not-allowed text-[#555] dark:text-[#AAA]" />
                   <input type="number" value={aofCiele.rezervaMDRenta} onChange={e=>setAofCiele({rezervaMDRenta: Number(e.target.value) || ''})} className="border text-center px-1 bg-white dark:bg-[#111]" />
                   <input type="number" value={aofCiele.rezervaMDDoba} onChange={e=>setAofCiele({rezervaMDDoba: Number(e.target.value) || ''})} className="border text-center px-1 bg-white dark:bg-[#111]" />
                   <input type="number" value={aofCiele.rezervaMDRoky} onChange={e=>setAofCiele({rezervaMDRoky: Number(e.target.value) || ''})} className="border text-center px-1 bg-white dark:bg-[#111]" />
                </div>
             </div>
           </div>
`;
aof = aof.replace(mdHtml.trim(), mdNewHtml.trim());


// 4. Fix Ine Ciele Expansion
aof = aof.replace(
  \`{t('aof.ineCiele')} <button onClick={()=>setAofCiele({ineCiele: [...aofCiele.ineCiele, {id: Date.now(), nazov: 'Auto', hodnota: '', horizont: '', checked: false}]})} className="text-[10px] bg-white dark:bg-[#111] px-1 border rounded">{t('aof.pridat')} +</button>\`,
  \`{t('aof.ineCiele')} <div className="flex items-center gap-2"><button onClick={()=>setAofCiele({ineCiele: [...aofCiele.ineCiele, {id: Date.now(), nazov: 'Auto', hodnota: '', horizont: '', checked: true}]})} className="text-[10px] bg-white dark:bg-[#111] px-1 border rounded">{t('aof.pridat')} +</button><input type="checkbox" checked={aofCiele.ineCieleExpand} onChange={e=>setAofCiele({ineCieleExpand: e.target.checked})} /></div>\`
);

// We need to wrap the ineCiele map
const mapStart = '{aofCiele.ineCiele.map(c => (';
const mapEnd = '</div>\n           ))}';
if(aof.includes(mapStart) && aof.includes(mapEnd)) {
  aof = aof.replace(mapStart, '{aofCiele.ineCieleExpand && aofCiele.ineCiele.map(c => (');
}

fs.writeFileSync('src/components/TabAOF.tsx', aof);
console.log('done fixing ui 2');
