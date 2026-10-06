import React from 'react';
import { Cloud, Zap, DollarSign, ShieldCheck, TreePine, Car, Cpu } from 'lucide-react';

export default function OverviewMetrics({ summary }) {
  if (!summary) return null;

  const {
    totalWorkloads = 0,
    totalCO2eKg = 0,
    totalTonnesCO2e = 0,
    totalCostUsd = 0,
    totalEnergyKwh = 0,
    totalVCPUs = 0,
    greenEfficiencyScore = 50,
    equivalencies = {}
  } = summary;

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981'; // Emerald
    if (score >= 50) return '#06b6d4'; // Cyan
    if (score >= 30) return '#f59e0b'; // Amber
    return '#f43f5e'; // Rose
  };

  const scoreColor = getScoreColor(greenEfficiencyScore);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      
      {/* Metric 1: Carbon Footprint */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Monthly Carbon Output</span>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Cloud size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800 }} className="text-gradient-emerald">
            {totalCO2eKg.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>kg CO₂e</span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>≈ {totalTonnesCO2e} Metric Tonnes / month</span>
        </div>
      </div>

      {/* Metric 2: Cloud Spend */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Estimated Monthly Spend</span>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
            <DollarSign size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f1f5f9' }}>
            ${totalCostUsd.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/mo</span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Across {totalWorkloads} workloads ({totalVCPUs} vCPUs)
        </div>
      </div>

      {/* Metric 3: Energy Usage */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Energy Consumption</span>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Zap size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24' }}>
            {totalEnergyKwh.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>kWh</span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Facility power (incl. Data Center PUE)
        </div>
      </div>

      {/* Metric 4: Green Efficiency Score */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Green Efficiency Index</span>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${scoreColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: scoreColor }}>
            <ShieldCheck size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: scoreColor }}>
            {greenEfficiencyScore}/100
          </span>
          <span className="badge" style={{ background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}40` }}>
            {greenEfficiencyScore >= 70 ? 'Clean' : greenEfficiencyScore >= 45 ? 'Moderate' : 'High Carbon'}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
          <div style={{ width: `${greenEfficiencyScore}%`, height: '100%', background: scoreColor, borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
        </div>
      </div>

      {/* Metric 5: Real-World Impact */}
      <div className="glass-panel" style={{ padding: '20px', gridColumn: 'span 1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Environmental Impact</span>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <TreePine size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <TreePine size={16} color="#34d399" />
            <span><strong>{(equivalencies.treesPlanted || 0).toLocaleString()}</strong> tree seedlings needed for 10y</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <Car size={16} color="#38bdf8" />
            <span><strong>{(equivalencies.carMiles || 0).toLocaleString()}</strong> car miles driven equivalent</span>
          </div>
        </div>
      </div>

    </div>
  );
}
