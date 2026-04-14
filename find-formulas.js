const XLSX = require('xlsx');
const wb = XLSX.readFile('Fip 2025 na testovanie 3 SK verzia bez hesla.xlsx', {cellFormula: true});

for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn];
    if(!ws) continue;
    let found = [];
    for (const c in ws) {
        if(c[0]==='!')continue;
        const v = String(ws[c].v || '');
        if (v.toLowerCase().includes('rezerva') || v.toLowerCase().includes('kapitál') || v.toLowerCase().includes('sociálnej') || v.includes('23950')) {
             found.push(c);
        }
    }
    
    for(let addr of found) {
       let cellInfo = XLSX.utils.decode_cell(addr);
       console.log(`\n--- Sheet: ${sn}, match at ${addr} ---`);
       let rowStr = '';
       for(let c=-2; c<5; c++) {
          let cc = cellInfo.c + c;
          if(cc < 0) continue;
          let a = XLSX.utils.encode_cell({r: cellInfo.r, c: cc});
          if(ws[a]) {
             rowStr += `\n[${a}] v: ${ws[a].v}` + (ws[a].f ? ` | f: ${ws[a].f}` : '');
          }
       }
       console.log(rowStr);
    }
}
