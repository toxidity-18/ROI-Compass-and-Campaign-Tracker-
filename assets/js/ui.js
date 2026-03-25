function updateDashboard() {
  const budget = parseFloat(document.getElementById('budget').value);
  const clicks = parseFloat(document.getElementById('clicks').value);
  const convRate = parseFloat(document.getElementById('convRate').value);
  
  // Basic validation
  if (isNaN(budget) || budget <= 0 ||
      isNaN(clicks) || clicks <= 0 ||
      isNaN(convRate) || convRate <= 0) {
    alert('Please enter valid positive numbers for all fields.');
    return;
  }
  
  const metrics = calculateMetrics(budget, clicks, convRate);
  if (!metrics) return;
  
  document.getElementById('cpcValue').textContent = `$${metrics.cpc.toFixed(2)}`;
  document.getElementById('cplValue').textContent = `$${metrics.cpl.toFixed(2)}`;
  document.getElementById('leadsValue').textContent = Math.round(metrics.leads);
}

document.addEventListener('DOMContentLoaded', () => {
  const calculateBtn = document.getElementById('calculateBtn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', updateDashboard);
  }
});