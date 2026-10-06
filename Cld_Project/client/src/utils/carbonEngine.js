// Client-side lightweight carbon calculator for instant preview

export function calculatePreviewMetric(workload) {
  const vCPUs = Number(workload.specs?.vCPUs) || 4;
  const ramGb = Number(workload.specs?.ramGb) || 16;
  const gpus = Number(workload.specs?.gpus) || 0;
  const storageTb = Number(workload.specs?.storageTb) || 0.5;
  const utilizationPct = Number(workload.utilizationPct) || 50;
  const monthlyHours = Number(workload.monthlyHours) || 720;
  const hourlyCostUsd = Number(workload.hourlyCostUsd) || 0.45;

  const loadFraction = Math.min(Math.max(utilizationPct / 100, 0.05), 1.0);
  const cpuPowerWatts = vCPUs * (1.0 + loadFraction * 2.8);
  const ramPowerWatts = ramGb * 0.38;
  const gpuPowerWatts = gpus * 215.0;
  const storagePowerWatts = storageTb * 1.2;

  const totalSystemWatts = cpuPowerWatts + ramPowerWatts + gpuPowerWatts + storagePowerWatts;
  const totalFacilityWatts = totalSystemWatts * 1.15;

  const energyKwhMonth = (totalFacilityWatts * monthlyHours) / 1000;
  const operationalKgCO2e = (energyKwhMonth * 350) / 1000;
  const embodiedKgCO2e = vCPUs * 0.85 * (monthlyHours / 720);
  const totalKgCO2e = operationalKgCO2e + embodiedKgCO2e;

  return {
    totalKgCO2e: Math.round(totalKgCO2e),
    monthlyCostUsd: Math.round(hourlyCostUsd * monthlyHours)
  };
}
