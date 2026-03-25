function calculateMetrics(budget, clicks, convRate) {
  if (isNaN(budget) || isNaN(clicks) || isNaN(convRate) ||
      budget <= 0 || clicks <= 0 || convRate <= 0) {
    return null;
  }
  
  const cpc = budget / clicks;
  const leads = clicks * (convRate / 100);
  const cpl = budget / leads;
  
  return { cpc, leads, cpl };
}