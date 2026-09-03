import { fetchComparisonRecords, classifyRemark, escapeHtml } from './comparisonValidation.js';

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

function renderRow(r) {
  const { label, cls } = classifyRemark(r.remark);
  const remarkNote = r.remark && r.remark.trim().toLowerCase() !== label.toLowerCase() ? r.remark : '';
  return `
    <tr>
      <td>${escapeHtml(r.barcode)}</td>
      <td>${escapeHtml(r.patientName)}</td>
      <td>${escapeHtml(r.sampleType) || '—'}</td>
      <td>${escapeHtml(r.previousResult) || '—'}</td>
      <td>${escapeHtml(r.longReadGenus) || '—'}</td>
      <td>${escapeHtml(r.longReadSpecies) || '—'}</td>
      <td>${escapeHtml(r.shortReadResult) || '—'}</td>
      <td>
        <span class="remark-tag ${cls}">${escapeHtml(label)}</span>
        ${remarkNote ? `<div class="remark-detail">${escapeHtml(remarkNote)}</div>` : ''}
      </td>
    </tr>
  `;
}

function renderRunGroup(run, rows) {
  return `
    <div class="ont-run-group">
      <h2 class="ont-run-title">${escapeHtml(run) || 'Unlabeled Run'}</h2>
      <div class="table-wrapper">
        <table class="ont-table comparison-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Patient</th>
              <th>Sample Type</th>
              <th>Previous Result (RT&#8209;PCR)</th>
              <th>ONT EPI2ME (Genus Level)</th>
              <th>Anderson Long Read (Species)</th>
              <th>Anderson Short Read GeneMind (Species)</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>${rows.map(renderRow).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTable() {
  const container = document.getElementById('comparison-groups');
  const q = searchQuery.toLowerCase();
  const filtered = records.filter(r =>
    r.patientName.toLowerCase().includes(q) ||
    r.barcode.toLowerCase().includes(q) ||
    r.run.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    container.innerHTML = '<div class="ont-no-results">No comparison samples found.</div>';
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
    records = await fetchComparisonRecords();
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
    console.error('Error fetching comparison data:', error);
    syncStatus.textContent = 'Sync Error';
    syncStatus.classList.remove('syncing');
  }
}

document.getElementById('comparison-search').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTable();
});

fetchData();
setInterval(fetchData, 30000);
