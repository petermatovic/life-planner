const XLSX = require('xlsx');
const wb = XLSX.readFile('Fip 2025 na testovanie 3 SK verzia bez hesla.xlsx', {cellFormula: true});
const ws = wb.Sheets['AOF'];
for (let c in ws) {
  if (c[0] === '!') continue;
  const cell = ws[c];
  if (cell && (cell.v || cell.f)) {
    console.log(`${c} | v: ${cell.v} | f: ${cell.f}`);
  }
}
