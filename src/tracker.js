// Configurations for different tracker types
const CONFIGS = {
  wgs: {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtE3_1ciBKS42QnfzYvoHdexXLD_NHqkUp_j2mYFsk1ZcB_WbGY2rd6IZiHEtE3n_Oi4KhLw8748DA/pub?gid=0&single=true&output=csv',
    title: 'WGS Projects',
    mapping: (cols) => ({
      id: `#${cols[0]}`,
      name: cols[1],
      status: cols[2]?.toUpperCase() || 'WAITING',
      pi: cols[3] || 'N/A',
      type: cols[4] || 'WGS',
      note: cols[5] || '',
      link: cols[6] || '#'
    })
  },
  taxonomy: {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1VLY6tSRV4dThhqXc0BJQfd6EcF5NzMDR2y8DFxilrhU/export?format=csv&gid=1291795325',
    title: 'Taxonomy Projects',
    mapping: (cols) => {
      const reportReleasedDate = cols[15];
      const rawDataDate = cols[11];
      let status = 'WAITING';
      if (reportReleasedDate && reportReleasedDate.trim()) status = 'COMPLETED';
      else if (rawDataDate && rawDataDate.trim()) status = 'IN PROGRESS';

      return {
        id: cols[5] || cols[3] || `#${cols[0]}`,
        name: cols[1] || 'Unnamed Sample',
        pi: cols[9] || 'N/A',
        status: status,
        type: cols[7] || 'Taxonomy',
        note: cols[6] ? `Package: ${cols[6]}` : '',
        link: '#'
      };
    }
  }
};

// State
let projects = [];
let currentFilter = 'all';
let searchQuery = '';
let currentType = 'taxonomy'; // Default

// Initialize
async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  currentType = urlParams.get('type') || 'taxonomy';
  
  if (!CONFIGS[currentType]) {
    console.error(`Invalid tracker type: ${currentType}`);
    currentType = 'taxonomy';
  }

  document.title = `${CONFIGS[currentType].title} - Anderson Labs`;
  document.querySelector('.header-titles h1').textContent = CONFIGS[currentType].title;

  await fetchData();
}

async function fetchData() {
  const syncStatus = document.getElementById('sync-status');
  syncStatus.textContent = 'Syncing...';
  syncStatus.classList.add('syncing');

  try {
    const response = await fetch(CONFIGS[currentType].sheetUrl);
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
    syncStatus.textContent = 'Sync Error';
    syncStatus.classList.remove('syncing');
  }
}

function parseCSV(csv) {
  const lines = csv.split(/\r?\n/);
  const result = [];
  const config = CONFIGS[currentType];
  
  // Dynamic header detection
  let headerIndex = -1;
  const headerMarker = currentType === 'wgs' ? 'ID' : 'S.NO';
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(headerMarker)) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) return [];

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
    
    const cols = splitLine(line).map(c => c.trim().replace(/^"|"$/g, ''));
    const p = config.mapping(cols);

    // Transform Drive links
    let finalLink = p.link.startsWith('http') ? p.link : '#';
    if (finalLink.includes('drive.google.com')) {
      let driveId = '';
      if (finalLink.includes('/file/d/')) driveId = finalLink.split('/file/d/')[1]?.split('/')[0]?.split('?')[0];
      else if (finalLink.includes('?id=')) driveId = finalLink.split('?id=')[1]?.split('&')[0];
      else if (finalLink.includes('&id=')) driveId = finalLink.split('&id=')[1]?.split('&')[0];
      
      if (driveId) finalLink = `https://drive.google.com/file/d/${driveId}/preview`;
    }

    result.push({ ...p, link: finalLink, hasLink: finalLink !== '#' });
  }
  return result;
}

function updateUI() {
  const grid = document.getElementById('project-grid');
  const filteredProjects = projects.filter(p => {
    const matchesStatus = currentFilter === 'all' || p.status.toLowerCase() === currentFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.pi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  document.getElementById('stat-total').textContent = projects.length;
  document.getElementById('stat-completed').textContent = projects.filter(p => p.status === 'COMPLETED').length;
  document.getElementById('stat-active').textContent = projects.filter(p => p.status === 'IN PROGRESS' || p.status === 'QC').length;
  document.getElementById('stat-waiting').textContent = projects.filter(p => p.status === 'WAITING' || p.status === 'ON HOLD').length;

  const now = new Date();
  document.getElementById('last-loaded').textContent = `Last loaded: ${now.toLocaleDateString()}, ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

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
      
      ${p.hasLink 
        ? `<a href="${p.link}" class="btn-results" target="_blank">View Results</a>`
        : `<button class="btn-results disabled" disabled title="Report not yet available">Awaiting Report</button>`
      }
    </article>
  `).join('');
}

// Listeners
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

// Start
init();
setInterval(fetchData, 30000);
