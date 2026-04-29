// Mock data for initial demonstration
const MOCK_DATA = [
  { id: "#1", name: "Soil Metagenomics (Rashmi_1)", pi: "Dr.RASHMI DESAI - Dyanand sagar university", status: "COMPLETED", type: "WGS", note: "Analysis complete - report submitted", link: "#" },
  { id: "#2", name: "Soil Metagenomics (Rashmi_2)", pi: "Dr.RASHMI DESAI - Dyanand sagar university", status: "COMPLETED", type: "WGS", note: "Analysis complete - report submitted", link: "#" },
  { id: "#3", name: "Soil Metagenomics (Rashmi_3)", pi: "Dr.RASHMI DESAI - Dyanand sagar university", status: "COMPLETED", type: "WGS", note: "Analysis complete - report submitted", link: "#" },
  { id: "#4", name: "Ocean Microbiome Study", pi: "Dr. Arvind - IIT Madras", status: "IN PROGRESS", type: "Taxonomy", note: "Sequencing in progress", link: "#" },
  { id: "#5", name: "Human Gut Flora Analysis", pi: "Dr. Smith - AIIMS", status: "WAITING", type: "Taxonomy", note: "Awaiting sample arrival", link: "#" },
  { id: "#6", name: "Plant Endophyte Survey", pi: "Dr. Meena - TNAU", status: "QC", type: "WGS", note: "Quality control check", link: "#" },
];

// Configuration
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1tEv4vSQ_yVxZhH9_7YvUglKJL4S4Cx5eT8M-fO8m3Mg/export?format=csv&gid=1722659570'; 

let projects = [];
let currentFilter = 'all';
let searchQuery = '';

async function fetchData() {
  const syncStatus = document.getElementById('sync-status');
  syncStatus.textContent = 'Syncing...';
  syncStatus.classList.add('syncing');

  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const csvText = await response.text();
    projects = parseCSV(csvText);
    updateUI();
    setTimeout(() => {
      syncStatus.textContent = '';
      syncStatus.classList.remove('syncing');
    }, 2000);
  } catch (error) {
    console.error("Error fetching data:", error);
    projects = MOCK_DATA;
    updateUI();
    syncStatus.textContent = 'Sync Error';
    syncStatus.classList.remove('syncing');
  }
}

function parseCSV(csv) {
  // Split lines but handle potential quoted newlines
  const lines = csv.split(/\r?\n/);
  const result = [];
  
  // Find the header row (S.NO is the first column)
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('S.NO')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) return [];

  // Helper to split CSV line while respecting quotes
  const splitLine = (line) => {
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current);
    return parts;
  };

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(',,,,')) continue;
    
    const cols = splitLine(line);
    if (cols.length < 10) continue;

    const sampleName = cols[1];
    const sampleType = cols[2];
    const andersonId = cols[4];
    const billedFor = cols[5];
    const category = cols[6];
    const rawDataDate = cols[7];
    const reportReleasedDate = cols[8];
    const reportLink = cols[9];

    // Status logic
    let status = 'WAITING';
    if (reportReleasedDate && reportReleasedDate.trim()) {
      status = 'COMPLETED';
    } else if (rawDataDate && rawDataDate.trim()) {
      status = 'IN PROGRESS';
    }

    result.push({
      id: andersonId || `#${cols[0]}`,
      name: sampleName || 'Unnamed Sample',
      pi: billedFor || 'N/A',
      status: status,
      type: category || sampleType || 'N/A',
      note: sampleType ? `Type: ${sampleType}` : '',
      link: reportLink && reportLink.startsWith('http') ? reportLink : '#'
    });
  }
  return result;
}

function updateUI() {
  const grid = document.getElementById('project-grid');
  const filteredProjects = projects.filter(p => {
    const matchesStatus = currentFilter === 'all' || p.status.toLowerCase() === currentFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.pi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Update Stats
  document.getElementById('stat-total').textContent = projects.length;
  document.getElementById('stat-completed').textContent = projects.filter(p => p.status === 'COMPLETED').length;
  document.getElementById('stat-active').textContent = projects.filter(p => p.status === 'IN PROGRESS' || p.status === 'QC').length;
  document.getElementById('stat-waiting').textContent = projects.filter(p => p.status === 'WAITING').length;

  // Update Timestamp
  const now = new Date();
  document.getElementById('last-loaded').textContent = `Last loaded: ${now.toLocaleDateString()}, ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

  // Render Grid
  if (filteredProjects.length === 0) {
    grid.innerHTML = '<div class="no-results">No projects found matching your criteria.</div>';
    return;
  }

  grid.innerHTML = filteredProjects.map(p => `
    <article class="project-card">
      <div class="project-header">
        <h3 class="project-title">${p.name}</h3>
        <span class="project-id">${p.id}</span>
      </div>
      
      <span class="status-badge status-${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span>
      
      <div class="project-details">
        <div class="detail-item">
          <span class="detail-label">Client/PI:</span>
          <span class="detail-value">${p.pi}</span>
        </div>
        <div class="project-type-tag">${p.type}</div>
      </div>

      ${p.note ? `<p class="project-note">${p.note}</p>` : ''}
      
      <a href="${p.link}" class="btn-results" target="_blank">View Results</a>
    </article>
  `).join('');
}

// Event Listeners
document.getElementById('project-search').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  updateUI();
});

document.getElementById('status-filters').addEventListener('click', (e) => {
  if (e.target.classList.contains('filter-btn')) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.status;
    updateUI();
  }
});

// Initial Load
fetchData();

// Auto-refresh every 30 seconds
setInterval(fetchData, 30000);
