import { Router } from 'express';
import { INITIAL_WORKLOADS } from '../data/workloads.js';
import { REGIONS } from '../data/regions.js';
import { calculateWorkloadEmissions, calculateWhatIfSimulation } from './carbonEngine.js';
import { generateRecommendations } from '../data/recommendations.js';

const router = Router();

// In-memory state initialized with realistic sample workloads
let currentWorkloads = JSON.parse(JSON.stringify(INITIAL_WORKLOADS));

// Helper: Enrich workload with current calculated carbon metrics
function enrichWorkload(workload) {
  const metric = calculateWorkloadEmissions(workload);
  const region = REGIONS[workload.regionId] || REGIONS['aws:us-east-1'];
  return {
    ...workload,
    regionDetails: region,
    metrics: metric
  };
}

// GET /api/workloads - List all workloads with metrics
router.get('/workloads', (req, res) => {
  const enriched = currentWorkloads.map(enrichWorkload);
  res.json({
    success: true,
    count: enriched.length,
    data: enriched
  });
});

// POST /api/workloads - Add custom workload
router.get('/regions', (req, res) => {
  res.json({
    success: true,
    data: REGIONS
  });
});

router.post('/workloads', (req, res) => {
  const { name, provider, serviceType, regionId, environment, businessUnit, vCPUs, ramGb, gpus, storageTb, utilizationPct, monthlyHours, hourlyCostUsd, notes } = req.body;

  if (!name || !regionId) {
    return res.status(400).json({ success: false, error: 'Name and Region are required fields.' });
  }

  const newWorkload = {
    id: `wkl-custom-${Date.now()}`,
    name,
    provider: provider || 'AWS',
    serviceType: serviceType || 'Compute (EC2/VM)',
    regionId,
    environment: environment || 'Production',
    businessUnit: businessUnit || 'Core Platform',
    specs: {
      instanceType: `${vCPUs || 4} vCPU / ${ramGb || 16}GB RAM`,
      vCPUs: Number(vCPUs) || 4,
      ramGb: Number(ramGb) || 16,
      gpus: Number(gpus) || 0,
      storageTb: Number(storageTb) || 0.5
    },
    utilizationPct: Number(utilizationPct) || 50,
    monthlyHours: Number(monthlyHours) || 720,
    hourlyCostUsd: Number(hourlyCostUsd) || 0.45,
    notes: notes || 'User added cloud workload'
  };

  currentWorkloads.push(newWorkload);
  res.status(201).json({
    success: true,
    data: enrichWorkload(newWorkload)
  });
});

// PUT /api/workloads/:id - Update existing workload
router.put('/workloads/:id', (req, res) => {
  const { id } = req.params;
  const index = currentWorkloads.findIndex(w => w.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Workload not found' });
  }

  const existing = currentWorkloads[index];
  const updates = req.body;

  // Handle regionId update
  if (updates.regionId && REGIONS[updates.regionId]) {
    existing.regionId = updates.regionId;
    existing.provider = REGIONS[updates.regionId].provider;
  }

  if (updates.utilizationPct !== undefined) existing.utilizationPct = Number(updates.utilizationPct);
  if (updates.monthlyHours !== undefined) existing.monthlyHours = Number(updates.monthlyHours);
  if (updates.environment) existing.environment = updates.environment;
  
  if (updates.vCPUs !== undefined) existing.specs.vCPUs = Number(updates.vCPUs);
  if (updates.ramGb !== undefined) existing.specs.ramGb = Number(updates.ramGb);

  currentWorkloads[index] = existing;

  res.json({
    success: true,
    data: enrichWorkload(existing)
  });
});

// DELETE /api/workloads/:id
router.delete('/workloads/:id', (req, res) => {
  const { id } = req.params;
  currentWorkloads = currentWorkloads.filter(w => w.id !== id);
  res.json({ success: true, message: 'Workload removed successfully' });
});

// POST /api/workloads/reset - Reset sample data
router.post('/workloads/reset', (req, res) => {
  currentWorkloads = JSON.parse(JSON.stringify(INITIAL_WORKLOADS));
  const enriched = currentWorkloads.map(enrichWorkload);
  res.json({
    success: true,
    message: 'Sample workloads reset to baseline',
    data: enriched
  });
});

// GET /api/summary - Aggregate dashboard executive summary
router.get('/summary', (req, res) => {
  const enriched = currentWorkloads.map(enrichWorkload);

  let totalCO2eKg = 0;
  let totalCostUsd = 0;
  let totalEnergyKwh = 0;
  let totalVCPUs = 0;
  
  const providerBreakdown = { AWS: { co2eKg: 0, cost: 0, count: 0 }, GCP: { co2eKg: 0, cost: 0, count: 0 }, Azure: { co2eKg: 0, cost: 0, count: 0 } };
  const envBreakdown = {};
  const serviceTypeBreakdown = {};

  enriched.forEach(item => {
    const { metrics, provider, environment, serviceType } = item;
    totalCO2eKg += metrics.totalKgCO2e;
    totalCostUsd += metrics.monthlyCostUsd;
    totalEnergyKwh += metrics.energyKwhMonth;
    totalVCPUs += item.specs.vCPUs;

    // Provider
    if (!providerBreakdown[provider]) {
      providerBreakdown[provider] = { co2eKg: 0, cost: 0, count: 0 };
    }
    providerBreakdown[provider].co2eKg += metrics.totalKgCO2e;
    providerBreakdown[provider].cost += metrics.monthlyCostUsd;
    providerBreakdown[provider].count += 1;

    // Environment
    if (!envBreakdown[environment]) envBreakdown[environment] = { co2eKg: 0, cost: 0, count: 0 };
    envBreakdown[environment].co2eKg += metrics.totalKgCO2e;
    envBreakdown[environment].cost += metrics.monthlyCostUsd;
    envBreakdown[environment].count += 1;

    // Service Type
    if (!serviceTypeBreakdown[serviceType]) serviceTypeBreakdown[serviceType] = { co2eKg: 0, cost: 0, count: 0 };
    serviceTypeBreakdown[serviceType].co2eKg += metrics.totalKgCO2e;
    serviceTypeBreakdown[serviceType].cost += metrics.monthlyCostUsd;
    serviceTypeBreakdown[serviceType].count += 1;
  });

  // Calculate Green Index Efficiency Score (1-100)
  // Based on average carbon score weighted by workload energy consumption
  let weightedScoreSum = 0;
  enriched.forEach(item => {
    weightedScoreSum += (item.metrics.carbonScore * item.metrics.energyKwhMonth);
  });
  const greenEfficiencyScore = totalEnergyKwh > 0 ? Math.round(weightedScoreSum / totalEnergyKwh) : 50;

  res.json({
    success: true,
    data: {
      totalWorkloads: enriched.length,
      totalCO2eKg: Math.round(totalCO2eKg),
      totalTonnesCO2e: Math.round((totalCO2eKg / 1000) * 100) / 100,
      totalCostUsd: Math.round(totalCostUsd),
      totalEnergyKwh: Math.round(totalEnergyKwh),
      totalVCPUs,
      greenEfficiencyScore,
      equivalencies: {
        treesPlanted: Math.round((totalCO2eKg * 12) / 21.0),
        carMiles: Math.round(totalCO2eKg / 0.404),
        gallonsGas: Math.round(totalCO2eKg / 8.887)
      },
      providerBreakdown,
      envBreakdown,
      serviceTypeBreakdown
    }
  });
});

// POST /api/what-if - Run interactive simulation
router.post('/what-if', (req, res) => {
  const scenarioSettings = req.body || {};
  const simulationResult = calculateWhatIfSimulation(currentWorkloads, scenarioSettings);
  res.json({
    success: true,
    data: simulationResult
  });
});

// GET /api/recommendations - Smart green suggestions
router.get('/recommendations', (req, res) => {
  const recs = generateRecommendations(currentWorkloads);
  res.json({
    success: true,
    count: recs.length,
    data: recs
  });
});

// GET /api/methodology - Model documentation & assumptions
router.get('/methodology', (req, res) => {
  res.json({
    success: true,
    data: {
      disclaimer: "EMISSIONS ARE ESTIMATES BASED ON SAMPLE ASSUMPTIONS, NOT LIVE PROVIDER MEASUREMENTS.",
      principles: [
        {
          name: "Operational Carbon (Scope 2)",
          description: "Calculates electricity consumed by vCPUs, RAM, GPUs, and storage hardware, multiplied by grid carbon intensity (gCO2e/kWh) and data center Power Usage Effectiveness (PUE)."
        },
        {
          name: "Embodied Carbon (Scope 3)",
          description: "Amortizes the raw manufacturing carbon cost of server hardware over a 4-year lifecycle, allocated per vCPU-hour (~0.85g CO2e per vCPU-hour)."
        },
        {
          name: "Power Usage Effectiveness (PUE)",
          description: "PUE accounts for cooling, lighting, and power distribution overhead. Modern hyperscale facilities range from 1.09 (Nordic hydro) to 1.25 (Legacy/hot climate facilities)."
        },
        {
          name: "Grid Carbon Intensity Sources",
          description: "Grid emission factors (gCO2e/kWh) are modeled on annual average data from Ember Climate, electricityMaps, and Cloud Carbon Footprint standard datasets."
        }
      ],
      formulas: {
        powerDrawWatts: "P_system = (vCPUs * P_cpu) + (RAM_GB * P_ram) + (GPUs * P_gpu) + (Storage_TB * P_storage)",
        facilityPowerWatts: "P_facility = P_system * PUE",
        monthlyEnergyKwh: "Energy_kWh = (P_facility * Hours) / 1000",
        monthlyCO2eKg: "CO2e_kg = (Energy_kWh * Grid_gCO2e_kWh) / 1000 + Embodied_kg"
      }
    }
  });
});

export default router;
