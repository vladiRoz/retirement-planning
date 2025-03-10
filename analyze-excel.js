const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('./public/Retirement-planning-tool.xlsx');

// Get the sheet names
const sheetNames = workbook.SheetNames;
console.log('Sheet Names:', sheetNames);

// For each sheet, get some basic information
sheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  console.log(`\nSheet: ${sheetName}`);
  console.log(`  Range: ${worksheet['!ref']}`);
  console.log(`  Rows: ${range.e.r - range.s.r + 1}`);
  console.log(`  Columns: ${range.e.c - range.s.c + 1}`);
  
  // Get a sample of the data (first 5 rows)
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0 });
  console.log('  Sample data (first 5 rows):');
  data.slice(0, 5).forEach((row, i) => {
    console.log(`    Row ${i + 1}:`, row.slice(0, 5));
  });
}); 