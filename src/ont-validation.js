import { fetchOntValidationRecords, classifyRemark, escapeHtml } from './ontValidation.js';

let records = [];
let searchQuery = '';

function updateStats() {
  document.getElementById('stat-total').textContent = records.length;
  document.getElementById('stat-matching').textContent =
    records.filter(r => classifyRemark(r.remark).cls === 'remark-matching').length;
  document.getElementById('stat-mismatching').textContent =
    records.filter(r => classifyRemark(r.remark).cls === 'remark-mismatching').length;
  document.getElementById('stat-pending').textContent =
    records.filter(r => classifyRemark(r.remark).cls === 'remark-pending').length;
}

function renderRow(r, hasBilledFor) {
  const { label, cls } = classifyRemark(r.remark);
  const remarkNote = r.remark && r.remark.trim().toLowerCase() !== label.toLowerCase() ? r.remark : '';
  return `
    <tr>
      <td>${escapeHtml(r.barcode)}</td>
      <td>${escapeHtml(r.patientName)}</td>
      ${hasBilledFor ? `<td>${escapeHtml(r.billedFor) || '—'}</td>` : ''}
      <td>${escapeHtml(r.sampleType) || '—'}</td>
      <td>${escapeHtml(r.method) || '—'}</td>
      <td>${escapeHtml(r.previousResult) || '—'}</td>
      <td>${escapeHtml(r.ontResult) || '—'}</td>
      <td>${escapeHtml(r.pipelineResult) || '—'}</td>
      <td>
        <span class="remark-tag ${cls}">${escapeHtml(label)}</span>
        ${remarkNote ? `<div class="remark-detail">${escapeHtml(remarkNote)}</div>` : ''}
      </td>
    </tr>
  `;
}

function renderRunGroup(run, rows) {
  const hasBilledFor = rows.some(r => r.hasBilledFor);
  return `
    <div class="ont-run-group">
      <h2 class="ont-run-title">${escapeHtml(run) || 'Unlabeled Run'}</h2>
      <div class="table-wrapper">
        <table class="ont-table${hasBilledFor ? '' : ' ont-table-8col'}">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Patient</th>
              ${hasBilledFor ? '<th>Test Billed For</th>' : ''}
              <th>Sample Type</th>
              <th>Method</th>
              <th>Previous Result</th>
              <th>ONT Result (EPI2ME)</th>
              <th>Anderson Pipeline Result</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>${rows.map(r => renderRow(r, hasBilledFor)).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTable() {
  const container = document.getElementById('ont-groups');
  const q = searchQuery.toLowerCase();
  const filtered = records.filter(r =>
    r.patientName.toLowerCase().includes(q) ||
    r.barcode.toLowerCase().includes(q) ||
    r.run.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    container.innerHTML = '<div class="ont-no-results">No validation samples found.</div>';
    return;
  }

  const groups = new Map();
  filtered.forEach(r => {
    if (!groups.has(r.run)) groups.set(r.run, []);
    groups.get(r.run).push(r);
  });

  container.innerHTML = Array.from(groups.entries())
    .map(([run, rows]) => renderRunGroup(run, rows))
    .join('');
}

async function fetchData() {
  const syncStatus = document.getElementById('sync-status');
  syncStatus.textContent = 'Syncing...';
  syncStatus.classList.add('syncing');

  try {
    records = await fetchOntValidationRecords();
    updateStats();
    renderTable();

    const now = new Date();
    document.getElementById('last-loaded').textContent =
      `Last loaded: ${now.toLocaleDateString()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setTimeout(() => {
      syncStatus.textContent = '';
      syncStatus.classList.remove('syncing');
    }, 2000);
  } catch (error) {
    console.error('Error fetching ONT validation data:', error);
    syncStatus.textContent = 'Sync Error';
    syncStatus.classList.remove('syncing');
  }
}

document.getElementById('ont-search').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTable();
});

fetchData();
setInterval(fetchData, 30000);
