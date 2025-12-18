/**
 * Export utilities for CSV and Excel formats
 */

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | boolean | null);
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = typeof col.accessor === 'function'
        ? col.accessor(item)
        : item[col.accessor];
      return value?.toString() ?? '';
    })
  );

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to Excel format (XML-based)
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = typeof col.accessor === 'function'
        ? col.accessor(item)
        : item[col.accessor];
      return value?.toString() ?? '';
    })
  );

  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xmlContent += '<?mso-application progid="Excel.Sheet"?>\n';
  xmlContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
  xmlContent += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xmlContent += `<Worksheet ss:Name="${escapeXml(sheetName)}">\n<Table>\n`;

  // Header row with styling
  xmlContent += '<Row>\n';
  headers.forEach((h) => {
    xmlContent += `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
  });
  xmlContent += '</Row>\n';

  // Data rows
  rows.forEach((row) => {
    xmlContent += '<Row>\n';
    row.forEach((cell) => {
      const type = isNumeric(cell) ? 'Number' : 'String';
      xmlContent += `<Cell><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>\n`;
    });
    xmlContent += '</Row>\n';
  });

  xmlContent += '</Table>\n</Worksheet>\n</Workbook>';

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, `${filename}.xls`);
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Check if string is numeric
 */
function isNumeric(str: string): boolean {
  return !isNaN(parseFloat(str)) && isFinite(Number(str));
}

/**
 * Generate filename with date
 */
export function generateExportFilename(prefix: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}-${date}`;
}
