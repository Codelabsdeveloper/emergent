/**
 * Escape CSV cells and neutralize spreadsheet formula injection.
 */
export function escapeCsvCell(value: string): string {
  let cell = value ?? '';
  if (/^[=+\-@\t\r]/.test(cell)) {
    cell = `'${cell}`;
  }
  cell = cell.replace(/"/g, '""');
  return `"${cell}"`;
}
