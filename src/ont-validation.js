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

function renderTable() {
  const tbody = document.getElementById('ont-table-body');
  const q = searchQuery.toLowerCase();
  const filtered = records.filter(r =>
    r.patientName.toLowerCase().includes(q) ||
    r.barcode.toLowerCase().includes(q) ||
    r.run.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="ont-no-results">No validation samples found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const { label, cls } = classifyRemark(r.remark);
    return `
      <tr>
        <td>${escapeHtml(r.run)}</td>
        <td>${escapeHtml(r.barcode)}</td>
        <td>${escapeHtml(r.patientName)}</td>
        <td>${escapeHtml(r.billedFor) || '—'}</td>
        <td>${escapeHtml(r.sampleType) || '—'}</td>
        <td>${escapeHtml(r.method) || '—'}</td>
        <td>${escapeHtml(r.previousResult) || '—'}</td>
        <td>${escapeHtml(r.ontResult) || '—'}</td>
        <td>${escapeHtml(r.pipelineResult) || '—'}</td>
        <td>
          <span class="remark-tag ${cls}">${escapeHtml(label)}</span>
          ${r.remark ? `<div class="remark-detail">${escapeHtml(r.remark)}</div>` : ''}
        </td>
      </tr>
    `;
  }).join('');
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
