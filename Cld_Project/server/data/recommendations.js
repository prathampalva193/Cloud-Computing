// Automated Green Recommendation Generator for Cloud Carbon Compass
import { REGIONS } from './regions.js';
import { calculateWorkloadEmissions } from '../routes/carbonEngine.js';

export function generateRecommendations(workloads) {
  const recommendations = [];

  workloads.forEach(wkl => {
    const currentMetric = calculateWorkloadEmissions(wkl);
    const regionObj = REGIONS[wkl.regionId];

    // Recommendation Rule 1: High-Carbon Region Migration
    if (regionObj && regionObj.cleanAlternative) {
      const altRegion = REGIONS[regionObj.cleanAlternative];
      const altMetric = calculateWorkloadEmissions(wkl, regionObj.cleanAlternative);
      const co2eSavedKg = currentMetric.totalKgCO2e - altMetric.totalKgCO2e;
      const co2eSavedPct = Math.round((co2eSavedKg / currentMetric.totalKgCO2e) * 100);
      const costDiff = currentMetric.monthlyCostUsd - altMetric.monthlyCostUsd;

      if (co2eSavedKg > 50) {
        recommendations.push({
          id: `rec-mig-${wkl.id}`,
          workloadId: wkl.id,
          workloadName: wkl.name,
          category: 'Region Migration',
          impact: co2eSavedPct > 50 ? 'High' : 'Medium',
          title: `Migrate ${wkl.name} from ${regionObj.name} to ${altRegion.name}`,
          description: `Grid carbon intensity drops from ${regionObj.gridCarbonIntensity} gCO2e/kWh to ${altRegion.gridCarbonIntensity} gCO2e/kWh (${altRegion.renewableMatch} renewable match).`,
          co2eSavedKgMonth: Math.round(co2eSavedKg),
          co2eSavedPct,
          costImpactUsdMonth: Math.round(costDiff),
          targetRegionId: regionObj.cleanAlternative,
          actionType: 'MIGRATE_REGION',
          difficulty: 'Easy (DNS/Traffic Switch)'
        });
      }
    }

    // Recommendation Rule 2: Off-Peak Non-Prod Auto-Shutdown
    if ((wkl.environment === 'Development' || wkl.environment === 'Staging' || wkl.environment === 'Batch Analytics') && wkl.monthlyHours > 500) {
      const reducedHours = Math.round(wkl.monthlyHours * 0.55); // Auto-sleep 12h on weekdays + 24h weekends
      const optMetric = calculateWorkloadEmissions(wkl, null, { monthlyHours: reducedHours });
      const co2eSavedKg = currentMetric.totalKgCO2e - optMetric.totalKgCO2e;
      const costSavedUsd = currentMetric.monthlyCostUsd - optMetric.monthlyCostUsd;

      recommendations.push({
        id: `rec-sched-${wkl.id}`,
        workloadId: wkl.id,
        workloadName: wkl.name,
        category: 'Workload Schedule',
        impact: 'High',
        title: `Enable Green Auto-Pause Schedule for ${wkl.name}`,
        description: `Automatically scale to 0 nodes outside core developer working hours (nights and weekends), reducing operational runtime by 45%.`,
        co2eSavedKgMonth: Math.round(co2eSavedKg),
        co2eSavedPct: 45,
        costImpactUsdMonth: Math.round(costSavedUsd),
        targetMonthlyHours: reducedHours,
        actionType: 'SCHEDULE_PAUSE',
        difficulty: 'Instant (Instance Scheduler / Cron)'
      });
    }

    // Recommendation Rule 3: vCPU Right-Sizing
    if (wkl.utilizationPct < 30 && wkl.specs.vCPUs >= 8) {
      const targetVCPUs = Math.max(2, Math.round(wkl.specs.vCPUs * 0.5));
      const optMetric = calculateWorkloadEmissions(wkl, null, { vCPUs: targetVCPUs, utilizationPct: Math.min(75, wkl.utilizationPct * 1.8) });
      const co2eSavedKg = currentMetric.totalKgCO2e - optMetric.totalKgCO2e;
      const costSavedUsd = currentMetric.monthlyCostUsd - optMetric.monthlyCostUsd;

      recommendations.push({
        id: `rec-size-${wkl.id}`,
        workloadId: wkl.id,
        workloadName: wkl.name,
        category: 'Right-Sizing',
        impact: 'Medium',
        title: `Right-size ${wkl.name} vCPU allocation (${wkl.specs.vCPUs} → ${targetVCPUs} vCPUs)`,
        description: `Current CPU utilization is averaging only ${wkl.utilizationPct}%. Halving provisioned vCPUs eliminates idle server hardware draw and embodied emissions.`,
        co2eSavedKgMonth: Math.round(co2eSavedKg),
        co2eSavedPct: Math.round((co2eSavedKg / currentMetric.totalKgCO2e) * 100),
        costImpactUsdMonth: Math.round(costSavedUsd),
        targetVCPUs,
        actionType: 'RIGHT_SIZE',
        difficulty: 'Medium (Re-provision)'
      });
    }
  });

  // Sort recommendations by highest CO2e savings first
  return recommendations.sort((a, b) => b.co2eSavedKgMonth - a.co2eSavedKgMonth);
}
