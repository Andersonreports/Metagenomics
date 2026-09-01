// Shared parsing for the ONT Inhouse Validation sheet tab, used by both the
// Taxonomy tracker (for the stat count) and the dedicated ont-validation page
// (for the full sample table).

export const ONT_VALIDATION_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=287746018';

export function norm(s) {
  return (s || '').trim().toLowerCase();
}

// Parses raw CSV text into rows of fields, respecting quoted fields that
// contain commas or embedded newlines (the ONT validation sheet has both).
export function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { row.push(cur); cur = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; continue; }
    cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

// The sheet has multiple "ONT VALIDATION RUN-N" sections stacked vertically,
// each with its own header row whose columns shift slightly between runs.
export function parseOntValidationRecords(csvText) {
  const rows = parseCsvRows(csvText);
  const records = [];
  let colMap = null;
  let currentRun = '';

  for (const row of rows) {
    if (!row.some(c => c && c.trim())) continue;

    if (norm(row[0]).includes('ont validation')) {
      currentRun = row[0].trim().replace(/^ont validation\s*/i, '').trim();
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
        else if (hn.includes('billed')) colMap.billedFor = idx;
        else if (hn.includes('sample type')) colMap.sampleType = idx;
        else if (hn.includes('method')) colMap.method = idx;
        else if (hn.includes('previous')) colMap.previousResult = idx;
        else if (hn.includes('epi2me') || hn.includes('ont result')) colMap.ontResult = idx;
        else if (hn.includes('advat') || hn.includes('pipeline')) colMap.pipelineResult = idx;
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
        billedFor: get('billedFor'),
        sampleType: get('sampleType'),
        method: get('method'),
        previousResult: get('previousResult'),
        ontResult: get('ontResult'),
        pipelineResult: get('pipelineResult'),
        remark: get('remark')
      });
    }
  }

  return records;
}

export function classifyRemark(remark) {
  const r = norm(remark);
  if (r.includes('mismatch')) return { label: 'Mismatching', cls: 'remark-mismatching' };
  if (r.includes('pending')) return { label: 'Pending', cls: 'remark-pending' };
  if (r.includes('matching')) return { label: 'Matching', cls: 'remark-matching' };
  return { label: remark ? 'Remark' : 'N/A', cls: 'remark-default' };
}

export function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export async function fetchOntValidationRecords() {
  const response = await fetch(ONT_VALIDATION_SHEET_URL);
  if (!response.ok) throw new Error('Network response was not ok');
  const csvText = await response.text();
  return parseOntValidationRecords(csvText);
}
