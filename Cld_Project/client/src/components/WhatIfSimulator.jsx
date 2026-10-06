import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, ArrowRight, CheckCircle2, Globe, Clock, Cpu, Leaf, DollarSign, Zap, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function WhatIfSimulator({ onApplySimulation, regions }) {
  // Scenario Toggle Controls
  const [migrateToGreenRegions, setMigrateToGreenRegions] = useState(true);
  const [enableOffPeakSchedules, setEnableOffPeakSchedules] = useState(true);
  const [rightSizeOverprovisioned, setRightSizeOverprovisioned] = useState(false);
  const [globalRegionOverride, setGlobalRegionOverride] = useState('');

  // State for calculated simulation
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Re-run simulation whenever controls change
  useEffect(() => {
    let isMounted = true;
    async function runSim() {
      setLoading(true);
      try {
        const res = await api.runWhatIfSimulation({
          migrateToGreenRegions,
          enableOffPeakSchedules,
          rightSizeOverprovisioned,
          globalRegionOverride: globalRegionOverride || null
        });
        if (isMounted && res.success) {
          setSimulationResult(res.data);
        }
      } catch (err) {
        console.error('What-If simulation failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    runSim();
    return () => { isMounted = false; };
  }, [migrateToGreenRegions, enableOffPeakSchedules, rightSizeOverprovisioned, globalRegionOverride]);

  const summary = simulationResult?.summary || {};

  // Apply simulated settings directly into the live workloads list
  const handleApplyToLive = async () => {
    if (!simulationResult || !simulationResult.workloadBreakdown) return;
    
    // For each workload, apply the simulated updates
    for (const item of simulationResult.workloadBreakdown) {
      const updates = {
        regionId: item.simulated.regionKey,
        monthlyHours: item.simulated.monthlyHours,
        vCPUs: item.simulated.specs.vCPUs,
        utilizationPct: item.simulated.utilizationPct
      };
      await api.updateWorkload(item.id, updates);
    }
    
    if (onApplySimulation) {
      onApplySimulation();
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(6,182,212,0.3)' }}>
      
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
            <Sliders size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              "What If?" Green Scenario Optimizer
              <span className="badge badge-cyan">Interactive Simulator</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Compare current operating baseline against lower-impact regions, auto-schedules, and instance right-sizing
            </p>
          </div>
        </div>

        {summary.co2eSavedKg > 0 && (
          <button 
            className="btn btn-emerald" 
            onClick={handleApplyToLive}
            title="Update all current workloads to match these green optimization settings"
          >
            <Sparkles size={16} />
            Apply Settings to Baseline
          </button>
        )}
      </div>

      {/* Control Switches Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px', background: 'rgba(9, 14, 17, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
        
        {/* Control 1: Green Region Migration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={18} color="#22d3ee" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Low-Carbon Migration</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Shift to Nordic/Hydro regions</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={migrateToGreenRegions} 
              onChange={e => {
                setMigrateToGreenRegions(e.target.checked);
                if (e.target.checked) setGlobalRegionOverride('');
              }} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Control 2: Off-Peak Auto-Pause */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Off-Peak Auto-Pause</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Sleep dev/staging outside 9-5</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={enableOffPeakSchedules} 
              onChange={e => setEnableOffPeakSchedules(e.target.checked)} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Control 3: vCPU Right-Sizing */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={18} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>vCPU Right-Sizing</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Reduce overprovisioned nodes</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={rightSizeOverprovisioned} 
              onChange={e => setRightSizeOverprovisioned(e.target.checked)} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Control 4: Global Specific Region Override */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Force Specific Target Region:
          </label>
          <select 
            className="input-control" 
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
            value={globalRegionOverride}
            onChange={e => {
              setGlobalRegionOverride(e.target.value);
              if (e.target.value) setMigrateToGreenRegions(false);
            }}
          >
            <option value="">-- Standard Auto-Select --</option>
            {Object.entries(regions || {}).map(([key, reg]) => (
              <option key={key} value={key}>
                {reg.provider}: {reg.name} ({reg.gridCarbonIntensity} g/kWh)
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Real-time Comparison Results Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: CO2e Comparison */}
        <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid var(--border-emerald)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Leaf size={16} /> Carbon Emissions Comparison
            </span>
            {loading && <RefreshCw size={14} className="animate-spin" color="#10b981" />}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Setup</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, textDecoration: summary.co2eSavedKg > 0 ? 'line-through' : 'none', color: '#94a3b8' }}>
                {(summary.currentTotalKgCO2e || 0).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>kg</span>
              </div>
            </div>

            <ArrowRight size={20} color="#10b981" />

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)' }}>Simulated Setup</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }} className="text-gradient-emerald">
                {(summary.simulatedTotalKgCO2e || 0).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>kg</span>
              </div>
            </div>
          </div>

          {summary.co2eSavedKg > 0 ? (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Monthly Reduction:</span>
              <span className="badge badge-emerald">
                ↓ {(summary.co2eSavedKg || 0).toLocaleString()} kg CO₂e ({summary.co2eSavedPct}%)
              </span>
            </div>
          ) : (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Toggle sliders above to calculate potential emissions savings
            </div>
          )}
        </div>

        {/* Card 2: Financial Spend Comparison */}
        <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={16} /> Cloud Spend Comparison
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Monthly Spend</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, textDecoration: summary.costSavedUsd > 0 ? 'line-through' : 'none', color: '#94a3b8' }}>
                ${(summary.currentTotalCostUsd || 0).toLocaleString()}
              </div>
            </div>

            <ArrowRight size={20} color="#06b6d4" />

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>Simulated Spend</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                ${(summary.simulatedTotalCostUsd || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {summary.costSavedUsd > 0 ? (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Financial Savings:</span>
              <span className="badge badge-cyan">
                ↓ ${(summary.costSavedUsd || 0).toLocaleString()}/mo ({summary.costSavedPct}%)
              </span>
            </div>
          ) : (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Regional cost differentials & off-peak hours applied
            </div>
          )}
        </div>

        {/* Card 3: Energy & Real-world Equivalencies */}
        <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} /> Energy & Offset Impact
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Energy Saved:</span>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                {(summary.energySavedKwh || 0).toLocaleString()} kWh/mo ({summary.energySavedPct || 0}%)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trees Equivalent Saved:</span>
              <span style={{ fontWeight: 700, color: '#34d399' }}>
                +{(summary.treesEquivalentSaved || 0).toLocaleString()} seedlings / 10y
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Car Miles Offset:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                {(summary.carMilesAvoided || 0).toLocaleString()} miles / mo
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
