let currentCampaign = null;
let lastValues = { cpc: 0, leads: 0, cpl: 0 };

// ===== DARK MODE LOGIC =====
function initDarkMode() {
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme === 'true') {
    document.body.classList.add('dark');
  }
  
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', isDark);
    });
  }
}

// ===== ANIMATIONS & VISUALS =====
function animateValue(element, start, end, duration = 800) {
  if (!element) return;
  let startTime = null;
  const isCurrency = element.id.includes('cpc') || element.id.includes('cpl');
  
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const current = start + (end - start) * progress;
    
    element.textContent = isCurrency 
      ? `$${current.toFixed(2)}` 
      : Math.round(current).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}

function updateLeadQuality(cpl) {
  const card = document.getElementById('cardCPL');
  if (!card) return;
  
  // Use CSS variables for consistent colors
  if (cpl <= 20) {
    card.style.borderLeftColor = 'var(--success)';
  } else if (cpl <= 50) {
    card.style.borderLeftColor = 'var(--warning)';
  } else {
    card.style.borderLeftColor = 'var(--danger)';
  }
}

// ===== CORE DASHBOARD LOGIC =====
function updateDashboard() {
  const budgetEl = document.getElementById('budget');
  const clicksEl = document.getElementById('clicks');
  const convRateEl = document.getElementById('convRate');
  
  const budget = parseFloat(budgetEl.value);
  const clicks = parseFloat(clicksEl.value);
  const convRate = parseFloat(convRateEl.value);
  
  // Validation with UI Feedback
  let isValid = true;
  [budgetEl, clicksEl, convRateEl].forEach(el => {
    const val = parseFloat(el.value);
    if (isNaN(val) || val <= 0) {
      el.classList.add('error');
      isValid = false;
    } else {
      el.classList.remove('error');
    }
  });

  if (!isValid) return;
  
  const metrics = calculateMetrics(budget, clicks, convRate);
  if (!metrics) return;
  
  // Trigger Animations
  animateValue(document.getElementById('cpcValue'), lastValues.cpc, metrics.cpc);
  animateValue(document.getElementById('cplValue'), lastValues.cpl, metrics.cpl);
  animateValue(document.getElementById('leadsValue'), lastValues.leads, metrics.leads);
  
  // Update Tracking
  lastValues = { cpc: metrics.cpc, leads: metrics.leads, cpl: metrics.cpl };
  updateLeadQuality(metrics.cpl);
  
  currentCampaign = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    budget,
    clicks,
    convRate,
    cpc: metrics.cpc,
    leads: metrics.leads,
    cpl: metrics.cpl
  };
}

// ===== CAMPAIGN TABLE LOGIC =====
function saveCurrentCampaign() {
  if (!currentCampaign) {
    alert('Please calculate ROI first.');
    return;
  }
  saveCampaign(currentCampaign);
  alert('Campaign saved successfully!');
  if (document.getElementById('campaignsTableBody')) renderCampaignsTable();
}

function renderCampaignsTable() {
  const campaigns = getCampaigns();
  const tbody = document.getElementById('campaignsTableBody');
  if (!tbody) return;

  if (campaigns.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem;">No campaigns saved yet.</td></tr>';
    return;
  }

  tbody.innerHTML = campaigns.map(campaign => `
    <tr data-id="${campaign.id}">
      <td>${new Date(campaign.timestamp).toLocaleDateString()}</td>
      <td>$${campaign.budget.toFixed(2)}</td>
      <td>${campaign.clicks.toLocaleString()}</td>
      <td>${campaign.convRate}%</td>
      <td>$${campaign.cpc.toFixed(2)}</td>
      <td>$${campaign.cpl.toFixed(2)}</td>
      <td>${Math.round(campaign.leads).toLocaleString()}</td>
      <td>
        <button class="delete-campaign" data-id="${campaign.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  // Re-attach delete listeners
  document.querySelectorAll('.delete-campaign').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      deleteCampaign(id);
      renderCampaignsTable();
    });
  });
}

function initSorting() {
  const headers = document.querySelectorAll('table th');
  headers.forEach(header => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      const text = header.textContent.toLowerCase();
      let key = 'timestamp'; // default
      
      if (text.includes('budget')) key = 'budget';
      if (text.includes('clicks')) key = 'clicks';
      if (text.includes('conv')) key = 'convRate';
      if (text.includes('cpc')) key = 'cpc';
      if (text.includes('cpl')) key = 'cpl';
      if (text.includes('leads')) key = 'leads';

      const campaigns = getCampaigns();
      campaigns.sort((a, b) => b[key] - a[key]); // Sort descending
      
      // Update the global/storage order if you want it to persist, 
      // or just re-render this specific view:
      const tbody = document.getElementById('campaignsTableBody');
      tbody.innerHTML = ''; // Clear and re-map
      renderCampaignsTable(); // Note: for true sorting, renderCampaignsTable should accept data
    });
  });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();

  const calculateBtn = document.getElementById('calculateBtn');
  if (calculateBtn) calculateBtn.addEventListener('click', updateDashboard);

  const saveBtn = document.getElementById('saveCampaignBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveCurrentCampaign);

  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Permanently delete all data?')) {
        clearAllCampaigns();
        renderCampaignsTable();
      }
    });
  }

  if (document.getElementById('campaignsTableBody')) {
    renderCampaignsTable();
    initSorting();
  }
});