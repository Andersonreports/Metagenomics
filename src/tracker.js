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
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1tEv4vSQ_yVxZhH9_7YvUglKJL4S4Cx5eT8M-fO8m3Mg/gviz/tq?tqx=out:csv&sheet=Sheet3',
    title: 'Taxonomy Projects',
    backLink: './index.html',
    headerMarker: 'Report link',
    mapping: (cols) => {
      const reportReleasedDate = cols[9];
      const rawDataDate = cols[7];
      let status = 'WAITING';
      if (reportReleasedDate && reportReleasedDate.trim()) status = 'COMPLETED';
      else if (rawDataDate && rawDataDate.trim()) status = 'IN PROGRESS';

      return {
        id: cols[4] || cols[3] || `#${cols[0]}`,
        name: cols[1] || 'Unnamed Sample',
        pi: 'N/A',
        status: status,
        type: cols[6] || 'Taxonomy',
        note: cols[5] ? `Package: ${cols[5]}` : '',
        link: cols[10] || '#'
      };
    }
  },
  'endometrial-samples': {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=0',
    title: 'Endometrial Samples Projects',
    backLink: './wgs.html',
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
        type: cols[7] || 'Endometrial Samples',
        note: cols[8] ? `Sample: ${cols[8]}` : '',
        link: cols[16] || '#'
      };
    }
  },
  'gut-microbiome': {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=313361967',
    title: 'Gut Microbiome Projects',
    backLink: './wgs.html',
    mapping: (cols) => {
      const reportReleasedDate = cols[15];
      const rawDataDate = cols[11];
      let status = 'WAITING';
      if (reportReleasedDate && reportReleasedDate.trim()) status = 'COMPLETED';
      else if (rawDataDate && rawDataDate.trim()) status = 'IN PROGRESS';

      return {
        id: cols[5] || cols[3] || `#${cols[0]}`,
        name: cols[1] || 'Unnamed Sample',
        pi: cols[10] || 'N/A',
        status: status,
        type: cols[7] || 'Gut Microbiome',
        note: cols[8] ? `Sample: ${cols[8]}` : '',
        link: cols[16] || '#'
      };
    }
  },
  'human-samples': {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=6309662',
    title: 'Human Samples Projects',
    backLink: './wgs.html',
    mapping: (cols) => {
      const reportReleasedDate = cols[15];
      const rawDataDate = cols[11];
      let status = 'WAITING';
      if (reportReleasedDate && reportReleasedDate.trim()) status = 'COMPLETED';
      else if (rawDataDate && rawDataDate.trim()) status = 'IN PROGRESS';

      return {
        id: cols[4] || cols[2] || `#${cols[0]}`,
        name: cols[1] || 'Unnamed Sample',
        pi: cols[10] || 'N/A',
        status: status,
        type: cols[6] || 'Human Samples',
        note: cols[7] ? `Sample: ${cols[7]}` : '',
        link: cols[16] || '#'
      };
    }
  },
  'fungus-samples': {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=695788515',
    title: 'Fungus Samples Projects',
    backLink: './wgs.html',
    mapping: (cols) => {
      const reportReleasedDate = cols[15];
      const rawDataDate = cols[11];
      let status = 'WAITING';
      if (reportReleasedDate && reportReleasedDate.trim()) status = 'COMPLETED';
      else if (rawDataDate && rawDataDate.trim()) status = 'IN PROGRESS';

      return {
        id: cols[4] || cols[2] || `#${cols[0]}`,
        name: cols[1] || 'Unnamed Sample',
        pi: cols[10] || 'N/A',
        status: status,
        type: cols[6] || 'Fungus Samples',
        note: cols[7] ? `Sample: ${cols[7]}` : '',
        link: cols[16] || '#'
      };
    }
  },
  'virus-samples': {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=1884530805',
    title: 'Virus Samples Projects',
    backLink: './wgs.html',
    mapping: (cols) => {
      const reportReleasedDate = cols[16];
      const rawDataDate = cols[12];
      let status = 'WAITING';
      if (reportReleasedDate && reportReleasedDate.trim()) status = 'COMPLETED';
      else if (rawDataDate && rawDataDate.trim()) status = 'IN PROGRESS';

      return {
        id: cols[5] || cols[3] || `#${cols[0]}`,
        name: cols[1] || 'Unnamed Sample',
        pi: cols[11] || 'N/A',
        status: status,
        type: cols[7] || 'Virus Samples',
        note: cols[2] ? `Run: ${cols[2]}` : '',
        link: cols[17] || '#'
      };
    }
  },
  'environment-samples': {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=327784423',
    title: 'Environment Samples Projects',
    backLink: './wgs.html',
    mapping: (cols) => {
      const reportReleasedDate = cols[13];
      const rawDataDate = cols[9];
      let status = 'WAITING';
      if (reportReleasedDate && reportReleasedDate.trim()) status = 'COMPLETED';
      else if (rawDataDate && rawDataDate.trim()) status = 'IN PROGRESS';

      return {
        id: cols[4] || cols[2] || `#${cols[0]}`,
        name: cols[1] || 'Unnamed Sample',
        pi: 'N/A',
        status: status,
        type: cols[5] || 'Environment Samples',
        note: cols[6] ? `Sample: ${cols[6]}` : '',
        link: cols[14] || '#'
      };
    }
  },
  'inhouse-kapa': {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1kb2ShLux391fKUXQOEd3pQOJ5LY2DUbQXv3uKof4Euk/export?format=csv&gid=539062939',
    title: 'Inhouse Roche KAPA RUN Projects',
    backLink: './wgs.html',
    mapping: (cols) => {
      const result = cols[9] || '';
      const status = (result.trim() && result.trim().toUpperCase() !== 'NOT ANALYSED') ? 'COMPLETED' : 'IN PROGRESS';

      return {
        id: `#${cols[0]}`,
        name: cols[1] || 'Unnamed Sample',
        pi: 'N/A',
        status: status,
        type: cols[3] || 'Inhouse Roche KAPA RUN',
        note: cols[2] ? `Sample: ${cols[2]}` : '',
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

  const backBtn = document.querySelector('.back-btn');
  if (backBtn && CONFIGS[currentType].backLink) {
    backBtn.href = CONFIGS[currentType].backLink;
  }

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
  const headerMarker = config.headerMarker || (currentType === 'wgs' ? 'ID' : 'S.NO');
  const matchesHeader = config.headerMarker
    ? (line) => line.includes(headerMarker)
    : (line) => line.trim().startsWith(headerMarker);
  for (let i = 0; i < lines.length; i++) {
    if (matchesHeader(lines[i])) {
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
