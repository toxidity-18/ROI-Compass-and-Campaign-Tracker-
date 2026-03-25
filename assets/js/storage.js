const STORAGE_KEY = 'roi_campaigns';

function getCampaigns() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCampaign(campaign) {
  const campaigns = getCampaigns();
  const newCampaign = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...campaign
  };
  campaigns.push(newCampaign);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

function deleteCampaign(id) {
  let campaigns = getCampaigns();
  campaigns = campaigns.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

function clearAllCampaigns() {
  localStorage.removeItem(STORAGE_KEY);
}