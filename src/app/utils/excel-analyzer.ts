import * as XLSX from 'xlsx';

export interface SheetInfo {
  name: string;
  rows: number;
  columns: number;
  sampleData: any[][];
}

export const analyzeExcelFile = async (filePath: string): Promise<SheetInfo[]> => {
  // Read the Excel file
  const workbook = XLSX.read(await (await fetch(filePath)).arrayBuffer());
  
  // Get the sheet names
  const sheetNames = workbook.SheetNames;
  console.log('Sheet Names:', sheetNames);
  
  const sheetsInfo: SheetInfo[] = [];

  // For each sheet, get some basic information
  sheetNames.forEach((sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    
    // Get a sample of the data (first 10 rows)
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0 });
    const sampleData = data.slice(0, 10).map((row: any) => Array.isArray(row) ? row : [row]);
    
    sheetsInfo.push({
      name: sheetName,
      rows: range.e.r - range.s.r + 1,
      columns: range.e.c - range.s.c + 1,
      sampleData
    });
  });
  
  return sheetsInfo;
}; 