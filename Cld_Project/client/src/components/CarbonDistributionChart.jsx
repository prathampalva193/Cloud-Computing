import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { PieChart as PieIcon, BarChart3, Layers, Globe } from 'lucide-react';

export default function CarbonDistributionChart({ workloads, summary }) {
  const [activeTab, setActiveTab] = useState('provider'); // 'provider' | 'environment' | 'regions'

  if (!workloads || workloads.length === 0) return null;

  // Prepare Data for Provider Breakdown
  const providerData = Object.entries(summary?.providerBreakdown || {}).map(([key, val]) => ({
    name: key,
    co2eKg: Math.round(val.co2eKg),
    cost: Math.round(val.cost),
    count: val.count
  }));

  const PROVIDER_COLORS = {
    AWS: '#ff9900',
    GCP: '#4285f4',
    Azure: '#38bdf8'
  };

  // Prepare Data for Environment Breakdown
  const envData = Object.entries(summary?.envBreakdown || {}).map(([key, val]) => ({
    name: key,
    co2eKg: Math.round(val.co2eKg),
    cost: Math.round(val.cost),
    count: val.count
  }));

  const ENV_COLORS = {
    Production: '#10b981',
    Development: '#f59e0b',
    Staging: '#06b6d4',
    'Batch Analytics': '#a855f7'
  };

  // Prepare Data for Regional Grid Carbon Intensity
  const regionMap = {};
  workloads.forEach(wkl => {
    const rName = wkl.regionDetails?.name || wkl.regionId;
    const intensity = wkl.metrics?.gridCarbonIntensity || 300;
    const co2e = wkl.metrics?.totalKgCO2e || 0;
    if (!regionMap[rName]) {
      regionMap[rName] = { name: rName, intensity, co2eKg: 0, provider: wkl.provider };
    }
    regionMap[rName].co2eKg += co2e;
  });

  const regionData = Object.values(regionMap).sort((a, b) => b.co2eKg - a.co2eKg);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Chart Header Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#10b981" />
            Emissions Breakdown & Grid Intensity
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '2px' }}>
            Multi-dimensional carbon impact analysis across clouds, environments, and datacenters
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'rgba(9, 14, 17, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn ${activeTab === 'provider' ? 'btn-emerald' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => setActiveTab('provider')}
          >
            <PieIcon size={14} /> By Cloud Provider
          </button>

          <button 
            className={`btn ${activeTab === 'environment' ? 'btn-emerald' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => setActiveTab('environment')}
          >
            <Layers size={14} /> By Environment
          </button>

          <button 
            className={`btn ${activeTab === 'regions' ? 'btn-emerald' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => setActiveTab('regions')}
          >
            <Globe size={14} /> Regional Intensity
          </button>
        </div>
      </div>

      {/* Chart View Area */}
      <div style={{ width: '100%', height: '320px', position: 'relative' }}>
        
        {activeTab === 'provider' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={providerData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" unit=" kg" />
              <Tooltip 
                contentStyle={{ background: '#111a1f', borderColor: '#10b981', borderRadius: '8px', color: '#fff' }}
                formatter={(val, name) => [`${val.toLocaleString()} kg CO2e`, 'Emissions']}
              />
              <Bar dataKey="co2eKg" radius={[8, 8, 0, 0]}>
                {providerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PROVIDER_COLORS[entry.name] || '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'environment' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={envData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" unit=" kg" />
              <Tooltip 
                contentStyle={{ background: '#111a1f', borderColor: '#22d3ee', borderRadius: '8px', color: '#fff' }}
                formatter={(val) => [`${val.toLocaleString()} kg CO2e`, 'Emissions']}
              />
              <Bar dataKey="co2eKg" radius={[8, 8, 0, 0]}>
                {envData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ENV_COLORS[entry.name] || '#38bdf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'regions' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
              <XAxis type="number" stroke="#94a3b8" unit=" g/kWh" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={140} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ background: '#111a1f', borderColor: '#f59e0b', borderRadius: '8px', color: '#fff' }}
                formatter={(val, name, item) => [
                  `${val} gCO2e/kWh (Monthly CO2e: ${Math.round(item.payload.co2eKg).toLocaleString()} kg)`,
                  'Grid Carbon Intensity'
                ]}
              />
              <Bar dataKey="intensity" radius={[0, 8, 8, 0]}>
                {regionData.map((entry, index) => {
                  const color = entry.intensity > 400 ? '#f43f5e' : entry.intensity > 200 ? '#f59e0b' : '#10b981';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* Legend & Hint Footnote */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>
          {activeTab === 'regions' && (
            <span style={{ display: 'flex', gap: '16px' }}>
              <span style={{ color: '#10b981' }}>● Clean Grid (&lt; 100 gCO2e/kWh)</span>
              <span style={{ color: '#f59e0b' }}>● Moderate (100 - 400 gCO2e/kWh)</span>
              <span style={{ color: '#f43f5e' }}>● High Carbon (&gt; 400 gCO2e/kWh)</span>
            </span>
          )}
          {activeTab !== 'regions' && <span>Click any bar or tab to inspect carbon distribution across workloads.</span>}
        </div>
        <div>
          <span>Updated dynamically from workload specs</span>
        </div>
      </div>

    </div>
  );
}
