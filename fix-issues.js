const fs = require('fs');
let code = fs.readFileSync('src/components/TabAOF.tsx', 'utf8');

// 1. Remove font-bold text-[#AB0534] from Rezerva input
code = code.replace(
  `value={vypocitanaRezerva > 0 ? \`\${vypocitanaRezerva.toFixed(0)} €\` : ''} className="w-2/3 border px-2 text-center bg-transparent cursor-default font-bold text-[#AB0534]" placeholder="23 950 €" />`, 
  `value={vypocitanaRezerva > 0 ? \`\${vypocitanaRezerva.toFixed(0)} €\` : ''} className="w-2/3 border px-2 text-center bg-transparent cursor-default" placeholder="23 950 €" />`
);

// 2. Fix the name input mapping
code = code.replace(
  `<input type="text" placeholder={t('aof.meno')} className="w-1/2 p-0.5 px-1 border" />`,
  `<input type="text" value={d.meno || ''} onChange={(e) => setDeti(deti.map(x => x.id === d.id ? {...x, meno: e.target.value} : x))} placeholder={t('aof.meno')} className="w-1/2 p-0.5 px-1 border" />`
);

// 3. Remove && klientVek > 0 condition from capital logic
code = code.replace(
  `const vypocitanyProdukcnyKapitalKlient = klientPrijemSpolu > 0 && klientVek > 0 ? klientPrijemSpolu * 12 * Math.max(0, 64 - klientVek) : 0;`,
  `const vypocitanyProdukcnyKapitalKlient = klientPrijemSpolu > 0 ? klientPrijemSpolu * 12 * Math.max(0, 64 - klientVek) : 0;`
);

code = code.replace(
  `const vypocitanyProdukcnyKapitalPartner = partnerPrijemSpolu > 0 && partnerVek > 0 ? partnerPrijemSpolu * 12 * Math.max(0, 64 - partnerVek) : 0;`,
  `const vypocitanyProdukcnyKapitalPartner = partnerPrijemSpolu > 0 ? partnerPrijemSpolu * 12 * Math.max(0, 64 - partnerVek) : 0;`
);

fs.writeFileSync('src/components/TabAOF.tsx', code);
console.log('Fixed');
