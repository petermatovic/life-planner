const XLSX = require('xlsx');
const fs = require('fs');

try {
  // Replace with the exact filename
  const filename = 'Fip 2025 na testovanie 3 SK verzia bez hesla.xlsx';
  const workbook = XLSX.readFile(filename);
  
  let summary = {};
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    // Convert to row arrays, limit to first 30 rows to understand the structure
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    summary[sheetName] = data.slice(0, 30); // get first 30 rows of each sheet
  }
  
  fs.writeFileSync('excel_summary.json', JSON.stringify(summary, null, 2));
  console.log('Successfully written summary to excel_summary.json');
} catch (error) {
  console.error("Error reading file:", error);
}
