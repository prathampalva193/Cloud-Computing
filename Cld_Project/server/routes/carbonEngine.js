// Cloud Carbon Compass - Carbon & Energy Calculation Engine
import { REGIONS } from '../data/regions.js';

// Power constants derived from SPECpower & Cloud Carbon Footprint (CCF) benchmark averages
const POWER_SPECS = {
  CPU_MIN_WATTS_PER_VCPU: 1.0,  // Idle power per vCPU
  CPU_MAX_WATTS_PER_VCPU: 3.8,  // 100% load power per vCPU
  RAM_WATTS_PER_GB: 0.38,       // DDR4/DDR5 server memory power
  GPU_AVG_WATTS_PER_UNIT: 215.0, // Operational GPU draw (A100/T4 weighted avg)
  STORAGE_WATTS_PER_TB: 1.2,    // Enterprise NVMe/SSD array power
  EMBODIED_KG_CO2E_PER_VCPU_MONTH: 0.85 // Hardware manufacturing allocation
};

/**
 * Calculates environmental and financial metrics for a given workload.
 */
export function calculateWorkloadEmissions(workload, customRegionId = null, overrides = {}) {
  const regionKey = customRegionId || workload.regionId;
  const region = REGIONS[regionKey] || REGIONS['aws:us-east-1'];

  // Apply overrides if provided (for What-If simulation)
  const vCPUs = overrides.vCPUs !== undefined ? overrides.vCPUs : workload.specs.vCPUs;
  const ramGb = overrides.ramGb !== undefined ? overrides.ramGb : workload.specs.ramGb;
  const gpus = overrides.gpus !== undefined ? overrides.gpus : workload.specs.gpus;
  const storageTb = overrides.storageTb !== undefined ? overrides.storageTb : workload.specs.storageTb;
  const utilizationPct = overrides.utilizationPct !== undefined ? overrides.utilizationPct : workload.utilizationPct;
  const monthlyHours = overrides.monthlyHours !== undefined ? overrides.monthlyHours : workload.monthlyHours;

  // 1. Calculate operational power consumption (Watts)
  const loadFraction = Math.min(Math.max(utilizationPct / 100, 0.05), 1.0);
  const cpuPowerWatts = vCPUs * (POWER_SPECS.CPU_MIN_WATTS_PER_VCPU + loadFraction * (POWER_SPECS.CPU_MAX_WATTS_PER_VCPU - POWER_SPECS.CPU_MIN_WATTS_PER_VCPU));
  const ramPowerWatts = ramGb * POWER_SPECS.RAM_WATTS_PER_GB;
  const gpuPowerWatts = gpus * POWER_SPECS.GPU_AVG_WATTS_PER_UNIT;
  const storagePowerWatts = storageTb * POWER_SPECS.STORAGE_WATTS_PER_TB;

  const totalSystemWatts = cpuPowerWatts + ramPowerWatts + gpuPowerWatts + storagePowerWatts;

  // 2. Apply Data Center Power Usage Effectiveness (PUE)
  const pue = region.pue || 1.15;
  const totalFacilityWatts = totalSystemWatts * pue;

  // 3. Monthly Energy Usage (kWh)
  const energyKwhMonth = (totalFacilityWatts * monthlyHours) / 1000;

  // 4. Operational Carbon Footprint (kg CO2e)
  const gridCarbonIntensity = region.gridCarbonIntensity || 350; // gCO2e/kWh
  const operationalKgCO2e = (energyKwhMonth * gridCarbonIntensity) / 1000;

  // 5. Embodied Carbon Footprint (Hardware manufacturing amortization)
  const embodiedKgCO2e = vCPUs * POWER_SPECS.EMBODIED_KG_CO2E_PER_VCPU_MONTH * (monthlyHours / 720);

  // 6. Total Carbon Footprint (kg CO2e/month)
  const totalKgCO2e = operationalKgCO2e + embodiedKgCO2e;

  // 7. Monthly Financial Cost ($ USD)
  const hourlyCost = workload.hourlyCostUsd || 1.0;
  // Adjust cost ratio based on region factor if region changed
  const costMultiplier = (region.costFactor || 1.0);
  const vcpuAdjustmentRatio = vCPUs / Math.max(workload.specs.vCPUs, 1);
  const monthlyCostUsd = hourlyCost * monthlyHours * costMultiplier * vcpuAdjustmentRatio;

  // 8. Calculate Carbon Intensity Index rating (Score 1-100, 100 = cleanest)
  // Benchmark grid carbon: 15 g/kWh is ~98 score, 600 g/kWh is ~10 score
  const carbonScore = Math.max(5, Math.min(100, Math.round(100 - (gridCarbonIntensity / 650) * 85)));

  return {
    workloadId: workload.id,
    workloadName: workload.name,
    provider: region.provider || workload.provider,
    regionKey,
    regionName: region.name,
    gridCarbonIntensity,
    pue,
    specs: { vCPUs, ramGb, gpus, storageTb },
    utilizationPct,
    monthlyHours,
    energyKwhMonth: Math.round(energyKwhMonth * 10) / 10,
    operationalKgCO2e: Math.round(operationalKgCO2e * 10) / 10,
    embodiedKgCO2e: Math.round(embodiedKgCO2e * 10) / 10,
    totalKgCO2e: Math.round(totalKgCO2e * 10) / 10,
    totalTonnesCO2e: Math.round((totalKgCO2e / 1000) * 100) / 100,
    monthlyCostUsd: Math.round(monthlyCostUsd),
    carbonScore,
    equivalencies: {
      treeSeedlings10Yrs: Math.round((totalKgCO2e * 12) / 21.0), // 1 tree absorbs ~21kg CO2/year
      carMilesDriven: Math.round(totalKgCO2e / 0.404),          // ~0.404 kg CO2/mile
      gasolineGallons: Math.round(totalKgCO2e / 8.887),
      smartphoneCharges: Math.round((totalKgCO2e * 1000) / 8.22)
    }
  };
}

/**
 * Executes a full "What-If" scenario simulation against all active workloads.
 */
export function calculateWhatIfSimulation(workloads, scenarioSettings = {}) {
  // Scenario options:
  // - migrateToGreenRegions: boolean (auto-shift to lowest carbon region in same cloud provider or global)
  // - enableOffPeakSchedules: boolean (reduce dev/non-prod runtime by 35%)
  // - rightSizeOverprovisioned: boolean (reduce unused vCPU allocations by 25% for low util workloads)
  // - globalRegionOverride: string (optional explicit region ID)

  let currentTotalCO2e = 0;
  let currentTotalCost = 0;
  let currentTotalEnergyKwh = 0;

  let simulatedTotalCO2e = 0;
  let simulatedTotalCost = 0;
  let simulatedTotalEnergyKwh = 0;

  const workloadDetails = workloads.map(wkl => {
    // Current state metric
    const currentMetric = calculateWorkloadEmissions(wkl);
    currentTotalCO2e += currentMetric.totalKgCO2e;
    currentTotalCost += currentMetric.monthlyCostUsd;
    currentTotalEnergyKwh += currentMetric.energyKwhMonth;

    // Determine target simulation params
    let targetRegionId = wkl.regionId;
    const regionObj = REGIONS[wkl.regionId];

    if (scenarioSettings.globalRegionOverride) {
      targetRegionId = scenarioSettings.globalRegionOverride;
    } else if (scenarioSettings.migrateToGreenRegions && regionObj && regionObj.cleanAlternative) {
      targetRegionId = regionObj.cleanAlternative;
    }

    // Schedule optimization (reduce hours for dev/staging or batch)
    let targetHours = wkl.monthlyHours;
    if (scenarioSettings.enableOffPeakSchedules && (wkl.environment === 'Development' || wkl.environment === 'Staging' || wkl.environment === 'Batch Analytics')) {
      targetHours = Math.round(wkl.monthlyHours * 0.60); // 40% reduction from weekend/night sleep schedule
    }

    // Right-sizing vCPU optimization
    let targetVCPUs = wkl.specs.vCPUs;
    let targetUtil = wkl.utilizationPct;
    if (scenarioSettings.rightSizeOverprovisioned && wkl.utilizationPct < 40) {
      targetVCPUs = Math.max(2, Math.round(wkl.specs.vCPUs * 0.70)); // 30% vCPU right-size reduction
      targetUtil = Math.min(80, Math.round(wkl.utilizationPct * 1.35));
    }

    const simulatedMetric = calculateWorkloadEmissions(wkl, targetRegionId, {
      vCPUs: targetVCPUs,
      monthlyHours: targetHours,
      utilizationPct: targetUtil
    });

    simulatedTotalCO2e += simulatedMetric.totalKgCO2e;
    simulatedTotalCost += simulatedMetric.monthlyCostUsd;
    simulatedTotalEnergyKwh += simulatedMetric.energyKwhMonth;

    const co2eSavedKg = currentMetric.totalKgCO2e - simulatedMetric.totalKgCO2e;
    const costSavedUsd = currentMetric.monthlyCostUsd - simulatedMetric.monthlyCostUsd;

    return {
      id: wkl.id,
      name: wkl.name,
      provider: wkl.provider,
      environment: wkl.environment,
      current: currentMetric,
      simulated: simulatedMetric,
      co2eSavedKg: Math.round(co2eSavedKg * 10) / 10,
      co2eSavedPct: Math.round((co2eSavedKg / currentMetric.totalKgCO2e) * 100),
      costSavedUsd: Math.round(costSavedUsd),
      costSavedPct: Math.round((costSavedUsd / Math.max(currentMetric.monthlyCostUsd, 1)) * 100)
    };
  });

  const totalCO2eSavedKg = currentTotalCO2e - simulatedTotalCO2e;
  const totalCostSavedUsd = currentTotalCost - simulatedTotalCost;
  const totalEnergySavedKwh = currentTotalEnergyKwh - simulatedTotalEnergyKwh;

  return {
    summary: {
      currentTotalKgCO2e: Math.round(currentTotalCO2e),
      simulatedTotalKgCO2e: Math.round(simulatedTotalCO2e),
      co2eSavedKg: Math.round(totalCO2eSavedKg),
      co2eSavedPct: Math.round((totalCO2eSavedKg / Math.max(currentTotalCO2e, 1)) * 100),
      
      currentTotalCostUsd: Math.round(currentTotalCost),
      simulatedTotalCostUsd: Math.round(simulatedTotalCost),
      costSavedUsd: Math.round(totalCostSavedUsd),
      costSavedPct: Math.round((totalCostSavedUsd / Math.max(currentTotalCost, 1)) * 100),

      currentTotalEnergyKwh: Math.round(currentTotalEnergyKwh),
      simulatedTotalEnergyKwh: Math.round(simulatedTotalEnergyKwh),
      energySavedKwh: Math.round(totalEnergySavedKwh),
      energySavedPct: Math.round((totalEnergySavedKwh / Math.max(currentTotalEnergyKwh, 1)) * 100),

      treesEquivalentSaved: Math.round((totalCO2eSavedKg * 12) / 21.0),
      carMilesAvoided: Math.round(totalCO2eSavedKg / 0.404)
    },
    scenarioSettings,
    workloadBreakdown: workloadDetails
  };
}
