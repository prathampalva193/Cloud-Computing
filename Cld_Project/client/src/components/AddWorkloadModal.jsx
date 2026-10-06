import React, { useState } from 'react';
import { X, PlusCircle, Server, Leaf, DollarSign } from 'lucide-react';
import { calculatePreviewMetric } from '../utils/carbonEngine.js';

export default function AddWorkloadModal({ onClose, onAdd, regions }) {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'AWS',
    serviceType: 'Compute (EC2/VM)',
    regionId: 'aws:us-east-1',
    environment: 'Production',
    businessUnit: 'Core Platform',
    vCPUs: 16,
    ramGb: 64,
    gpus: 0,
    storageTb: 1.0,
    utilizationPct: 50,
    monthlyHours: 720,
    hourlyCostUsd: 1.20,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onAdd(formData);
    onClose();
  };

  // Quick live preview metric
  const previewMetric = calculatePreviewMetric({
    id: 'preview',
    name: formData.name || 'Preview',
    provider: formData.provider,
    serviceType: formData.serviceType,
    regionId: formData.regionId,
    specs: {
      vCPUs: Number(formData.vCPUs),
      ramGb: Number(formData.ramGb),
      gpus: Number(formData.gpus),
      storageTb: Number(formData.storageTb)
    },
    utilizationPct: Number(formData.utilizationPct),
    monthlyHours: Number(formData.monthlyHours),
    hourlyCostUsd: Number(formData.hourlyCostUsd)
  });

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '580px', maxWidth: '95vw', padding: '28px', position: 'relative' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Add Cloud Workload</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Estimate carbon footprint for custom infrastructure</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Workload Name */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Workload Name *</label>
            <input 
              type="text" 
              required
              className="input-control" 
              placeholder="e.g. Real-time Recommender Pipeline"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Grid 2-cols: Provider & Region */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cloud Provider</label>
              <select 
                className="input-control"
                value={formData.provider}
                onChange={e => {
                  const prov = e.target.value;
                  const defaultRegion = Object.keys(regions || {}).find(k => k.startsWith(prov.toLowerCase())) || 'aws:us-east-1';
                  setFormData({ ...formData, provider: prov, regionId: defaultRegion });
                }}
              >
                <option value="AWS">AWS</option>
                <option value="GCP">GCP</option>
                <option value="Azure">Azure</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Region</label>
              <select 
                className="input-control"
                value={formData.regionId}
                onChange={e => setFormData({ ...formData, regionId: e.target.value })}
              >
                {Object.entries(regions || {}).map(([key, reg]) => (
                  <option key={key} value={key}>
                    [{reg.provider}] {reg.name} ({reg.gridCarbonIntensity} g/kWh)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid 2-cols: Service Type & Environment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Service Category</label>
              <select 
                className="input-control"
                value={formData.serviceType}
                onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
              >
                <option value="Compute (EC2/VM)">Compute (EC2/VM)</option>
                <option value="Kubernetes Cluster">Kubernetes Cluster</option>
                <option value="Managed DB (Postgres/RDS)">Managed DB (Postgres/RDS)</option>
                <option value="AI/ML Inference Cluster">AI/ML Inference Cluster</option>
                <option value="Analytics & Data Lake">Analytics & Data Lake</option>
                <option value="Serverless Functions">Serverless Functions</option>
                <option value="Object Storage & CDN">Object Storage & CDN</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Environment</label>
              <select 
                className="input-control"
                value={formData.environment}
                onChange={e => setFormData({ ...formData, environment: e.target.value })}
              >
                <option value="Production">Production</option>
                <option value="Development">Development</option>
                <option value="Staging">Staging</option>
                <option value="Batch Analytics">Batch Analytics</option>
              </select>
            </div>
          </div>

          {/* Grid 4-cols: Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>vCPUs</label>
              <input 
                type="number" min="1" max="512" 
                className="input-control"
                value={formData.vCPUs}
                onChange={e => setFormData({ ...formData, vCPUs: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>RAM (GB)</label>
              <input 
                type="number" min="1" max="2048" 
                className="input-control"
                value={formData.ramGb}
                onChange={e => setFormData({ ...formData, ramGb: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>GPUs</label>
              <input 
                type="number" min="0" max="64" 
                className="input-control"
                value={formData.gpus}
                onChange={e => setFormData({ ...formData, gpus: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Storage (TB)</label>
              <input 
                type="number" step="0.5" min="0" 
                className="input-control"
                value={formData.storageTb}
                onChange={e => setFormData({ ...formData, storageTb: e.target.value })}
              />
            </div>
          </div>

          {/* Grid 3-cols: Util, Hours, Hourly Rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>CPU Util (%)</label>
              <input 
                type="number" min="5" max="100" 
                className="input-control"
                value={formData.utilizationPct}
                onChange={e => setFormData({ ...formData, utilizationPct: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Monthly Hours</label>
              <input 
                type="number" min="1" max="720" 
                className="input-control"
                value={formData.monthlyHours}
                onChange={e => setFormData({ ...formData, monthlyHours: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hourly Cost ($)</label>
              <input 
                type="number" step="0.05" min="0" 
                className="input-control"
                value={formData.hourlyCostUsd}
                onChange={e => setFormData({ ...formData, hourlyCostUsd: e.target.value })}
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px border-emerald', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Estimated Monthly Impact</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }} className="text-gradient-emerald">
                {previewMetric.totalKgCO2e.toLocaleString()} kg CO₂e
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Estimated Spend</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
                ${previewMetric.monthlyCostUsd.toLocaleString()}/mo
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald">
              Add Workload
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
