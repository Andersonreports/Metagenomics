// Shared parsing for the Short Read vs Long Read Comparison sheet tab, used by
// both the Taxonomy tracker (for the stat count) and the dedicated comparison
// page (for the full sample table).
import { norm, parseCsvRows, classifyRemark, escapeHtml } from './ontValidation.js';

export { classifyRemark, escapeHtml };

export const COMPARISON_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=151165205';

// The sheet has multiple "SHORT READ vs LONG READ COMPARISON - ONT VALIDATION
// RUN-N" sections stacked vertically, each with its own header row.
export function parseComparisonRecords(csvText) {
  const rows = parseCsvRows(csvText);
  const records = [];
  let colMap = null;
  let currentRun = '';

  for (const row of rows) {
    if (!row.some(c => c && c.trim())) continue;

    if (norm(row[0]).includes('short read') && norm(row[0]).includes('long read')) {
      currentRun = row[0].trim()
        .replace(/^short read\s*vs\s*long read comparison\s*-?\s*/i, '')
        .replace(/^ont validation\s*/i, '')
        .trim();
      colMap = null;
      continue;
    }

    if (norm(row[0]) === 'barcode') {
      colMap = {};
      row.forEach((h, idx) => {
        const hn = norm(h);
        if (!hn) return;
        if (hn.includes('barcode')) colMap.barcode = idx;
        else if (hn.includes('patient')) colMap.patientName = idx;
        else if (hn.includes('sample type')) colMap.sampleType = idx;
        else if (hn.includes('previous')) colMap.previousResult = idx;
        else if (hn.includes('genemind') || hn.includes('short read')) colMap.shortReadResult = idx;
        else if (hn.includes('epi2me')) colMap.longReadGenus = idx;
        else if (hn.includes('advat')) colMap.longReadSpecies = idx;
        else if (hn.includes('remark')) colMap.remark = idx;
      });
      continue;
    }

    if (colMap && /^\d+$/.test((row[colMap.barcode] || '').trim())) {
      const get = (key) => colMap[key] !== undefined ? (row[colMap[key]] || '').trim() : '';
      records.push({
        run: currentRun,
        barcode: get('barcode'),
        patientName: get('patientName'),
        sampleType: get('sampleType'),
        previousResult: get('previousResult'),
        longReadGenus: get('longReadGenus'),
        longReadSpecies: get('longReadSpecies'),
        shortReadResult: get('shortReadResult'),
        remark: get('remark')
      });
    }
  }

  return records;
}

export async function fetchComparisonRecords() {
  const response = await fetch(COMPARISON_SHEET_URL);
  if (!response.ok) throw new Error('Network response was not ok');
  const csvText = await response.text();
  return parseComparisonRecords(csvText);
}
