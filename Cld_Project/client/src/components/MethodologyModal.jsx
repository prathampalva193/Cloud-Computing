import React from 'react';
import { X, ShieldAlert, BookOpen, Cpu, Zap, Globe, Scale } from 'lucide-react';

export default function MethodologyModal({ onClose, methodologyData, regions }) {
  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '720px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Estimation Methodology & Carbon Calculation Model
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Scientific assumptions, PUE multipliers, and grid intensity data sources
            </p>
          </div>
        </div>

        {/* Mandatory Disclaimer Box */}
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem', marginBottom: '6px' }}>
            <ShieldAlert size={18} />
            IMPORTANT NOTICE & ASSUMPTIONS DISCLAIMER
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            Emissions and energy consumption displayed in <strong>Cloud Carbon Compass</strong> are <strong>estimates based on sample architectural assumptions</strong> and open scientific models (such as Cloud Carbon Footprint standard methodologies). They are <strong>not live, real-time measurements from cloud provider metering APIs</strong>.
          </p>
        </div>

        {/* Section 1: Core Mathematical Formulas */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--emerald-400)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} /> 1. Energy & Carbon Footprint Equations
          </h3>

          <div style={{ background: 'rgba(9, 14, 17, 0.8)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#38bdf8' }}>
            <div>P_system (Watts) = (vCPUs × P_cpu) + (RAM_GB × 0.38W) + (GPUs × 215W) + (Storage_TB × 1.2W)</div>
            <div>P_facility (Watts) = P_system × DataCenter_PUE</div>
            <div>Monthly_Energy (kWh) = (P_facility × Runtime_Hours) / 1000</div>
            <div>Operational_CO2e (kg) = (Monthly_Energy_kWh × Grid_Carbon_Intensity) / 1000</div>
            <div>Embodied_CO2e (kg) = vCPUs × 0.85kg/vCPU-month × (Runtime_Hours / 720)</div>
            <div style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>Total CO2e (kg/month) = Operational_CO2e + Embodied_CO2e</div>
          </div>
        </div>

        {/* Section 2: PUE & Hardware Benchmarks */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cyan-400)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} /> 2. Power Benchmarks & Data Center PUE
          </h3>

          <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li><strong>CPU Idle vs Max Power:</strong> Min power is 1.0W per vCPU; max load power is 3.8W per vCPU, scaled linearly by workload CPU utilization percentage.</li>
            <li><strong>RAM Power:</strong> Fixed at 0.38 Watts per GB based on DDR4/DDR5 server memory benchmarks.</li>
            <li><strong>Data Center PUE (Power Usage Effectiveness):</strong> Ratio of total facility energy to IT equipment energy. Hyperscale Nordic facilities average 1.09–1.11, while legacy or tropical facilities range from 1.20–1.25.</li>
            <li><strong>Embodied Carbon (Hardware Lifecycle):</strong> Manufacturing emissions amortized over a 4-year server lifetime allocation (~0.85kg CO2e per vCPU-month).</li>
          </ul>
        </div>

        {/* Section 3: Regional Grid Carbon Intensities Table */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} /> 3. Regional Grid Intensity Benchmark Data (gCO2e/kWh)
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>Provider</th>
                  <th style={{ padding: '8px' }}>Region Name</th>
                  <th style={{ padding: '8px' }}>Grid Carbon Intensity</th>
                  <th style={{ padding: '8px' }}>Facility PUE</th>
                  <th style={{ padding: '8px' }}>Renewable Match</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(regions || {}).map(([key, reg]) => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{reg.provider}</td>
                    <td style={{ padding: '8px' }}>{reg.name}</td>
                    <td style={{ padding: '8px', fontWeight: 700, color: reg.gridCarbonIntensity < 100 ? '#10b981' : reg.gridCarbonIntensity < 400 ? '#f59e0b' : '#f43f5e' }}>
                      {reg.gridCarbonIntensity} gCO2e/kWh
                    </td>
                    <td style={{ padding: '8px' }}>{reg.pue}</td>
                    <td style={{ padding: '8px', color: 'var(--cyan-400)' }}>{reg.renewableMatch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
          <button className="btn btn-emerald" onClick={onClose}>
            Got it, return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
