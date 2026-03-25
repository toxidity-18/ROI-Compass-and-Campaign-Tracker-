let currentCampaign = null;

// ===== CALCULATE & UPDATE DASHBOARD =====
function updateDashboard() {
  const budget = parseFloat(document.getElementById('budget').value);
  const clicks = parseFloat(document.getElementById('clicks').value);
  const convRate = parseFloat(document.getElementById('convRate').value);

  // Validation
  if (
    isNaN(budget) || budget <= 0 ||
    isNaN(clicks) || clicks <= 0 ||
    isNaN(convRate) || convRate <= 0
  ) {
    alert('Please enter valid positive numbers for all fields.');
    return;
  }

  const metrics = calculateMetrics(budget, clicks, convRate);
  if (!metrics) return;

  // Update UI
  document.getElementById('cpcValue').textContent = `$${metrics.cpc.toFixed(2)}`;
  document.getElementById('cplValue').textContent = `$${metrics.cpl.toFixed(2)}`;
  document.getElementById('leadsValue').textContent = Math.round(metrics.leads);

  // Store campaign for saving
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

// ===== SAVE CAMPAIGN =====
function saveCurrentCampaign() {
  if (!currentCampaign) {
    alert('Please calculate ROI first.');
    return;
  }

  saveCampaign(currentCampaign);
  alert('Campaign saved!');
}

// ===== RENDER CAMPAIGNS TABLE =====
function renderCampaignsTable() {
  const campaigns = getCampaigns();
  const tbody = document.getElementById('campaignsTableBody');

  if (!tbody) return;

  if (campaigns.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">No campaigns saved yet.</td></tr>';
    return;
  }

  tbody.innerHTML = campaigns.map(campaign => `
    <tr data-id="${campaign.id}">
      <td>${new Date(campaign.timestamp).toLocaleString()}</td>
      <td>$${campaign.budget.toFixed(2)}</td>
      <td>${campaign.clicks}</td>
      <td>${campaign.convRate}%</td>
      <td>$${campaign.cpc.toFixed(2)}</td>
      <td>$${campaign.cpl.toFixed(2)}</td>
      <td>${Math.round(campaign.leads)}</td>
      <td>
        <button class="delete-campaign" data-id="${campaign.id}">
          Delete
        </button>
      </td>
    </tr>
  `).join('');

  // Attach delete handlers
  document.querySelectorAll('.delete-campaign').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      deleteCampaign(id);
      renderCampaignsTable();
    });
  });
}

// ===== INIT APP =====
document.addEventListener('DOMContentLoaded', () => {

  // Calculate button
  const calculateBtn = document.getElementById('calculateBtn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', updateDashboard);
  }

  // Save button
  const saveBtn = document.getElementById('saveCampaignBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveCurrentCampaign);
  }

  // Clear all campaigns
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete ALL campaigns?')) {
        clearAllCampaigns();
        renderCampaignsTable();
      }
    });
  }

  // Load campaigns table if present
  if (document.getElementById('campaignsTableBody')) {
    renderCampaignsTable();
  }
});