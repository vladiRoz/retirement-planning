const XLSX = require('xlsx');
const fs = require('fs');

/**
 * Analyzes an Excel file and returns information about its structure
 * @param {string} filePath - Path to the Excel file
 * @returns {Object} - Information about the Excel file structure
 */
function analyzeExcelFile(filePath) {
  // Read the Excel file
  const workbook = XLSX.readFile(filePath);

  // Get the sheet names
  const sheetNames = workbook.SheetNames;
  console.log('Sheet Names:', sheetNames);

  const sheetsInfo = [];

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

    sheetsInfo.push({
      name: sheetName,
      rows: range.e.r - range.s.r + 1,
      columns: range.e.c - range.s.c + 1,
      sampleData: data.slice(0, 10)
    });
  });

  return sheetsInfo;
}

/**
 * Runs the Excel analyzer on a specified file
 * @param {string} filePath - Path to the Excel file
 */
function runAnalyzer(filePath) {
  try {
    const sheetsInfo = analyzeExcelFile(filePath);
    console.log('\nAnalysis complete. Sheet information:', JSON.stringify(sheetsInfo, null, 2));
    return sheetsInfo;
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
    return null;
  }
}

// Export the functions for use in other files
module.exports = {
  analyzeExcelFile,
  runAnalyzer
};

// If this file is run directly (not imported), run the analyzer on the specified file
if (require.main === module) {
  const filePath = process.argv[2] || './public/Retirement-planning-tool.xlsx';
  runAnalyzer(filePath);
} 