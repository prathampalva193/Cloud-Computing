import React, { useState } from 'react';
import { Search, Filter, Server, Trash2, Edit3, ArrowUpDown, ChevronDown, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export default function WorkloadTable({ workloads, regions, onDeleteWorkload, onUpdateWorkload }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('co2e'); // 'co2e' | 'cost' | 'vcpus' | 'name' | 'score'
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingWorkload, setEditingWorkload] = useState(null);

  if (!workloads) return null;

  // Filter Logic
  const filteredWorkloads = workloads.filter(wkl => {
    const matchesSearch = wkl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wkl.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (wkl.notes && wkl.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProvider = providerFilter === 'ALL' || wkl.provider === providerFilter;
    const matchesEnv = envFilter === 'ALL' || wkl.environment === envFilter;

    return matchesSearch && matchesProvider && matchesEnv;
  });

  // Sort Logic
  const sortedWorkloads = [...filteredWorkloads].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'co2e') {
      valA = a.metrics?.totalKgCO2e || 0;
      valB = b.metrics?.totalKgCO2e || 0;
    } else if (sortBy === 'cost') {
      valA = a.metrics?.monthlyCostUsd || 0;
      valB = b.metrics?.monthlyCostUsd || 0;
    } else if (sortBy === 'vcpus') {
      valA = a.specs?.vCPUs || 0;
      valB = b.specs?.vCPUs || 0;
    } else if (sortBy === 'score') {
      valA = a.metrics?.carbonScore || 0;
      valB = b.metrics?.carbonScore || 0;
    } else {
      valA = a.name;
      valB = b.name;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getProviderBadge = (provider) => {
    switch (provider) {
      case 'AWS': return <span className="badge badge-provider-aws">AWS</span>;
      case 'GCP': return <span className="badge badge-provider-gcp">GCP</span>;
      case 'Azure': return <span className="badge badge-provider-azure">Azure</span>;
      default: return <span className="badge badge-secondary">{provider}</span>;
    }
  };

  const getIntensityBadge = (intensity) => {
    if (intensity < 100) {
      return <span className="badge badge-emerald" title="Clean Renewable Grid">&lt; 100 g/kWh</span>;
    }
    if (intensity < 400) {
      return <span className="badge badge-amber" title="Moderate Carbon Grid">{intensity} g/kWh</span>;
    }
    return <span className="badge badge-rose" title="High-Carbon Grid">{intensity} g/kWh</span>;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Table Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} color="#10b981" />
            Active Cloud Workloads Inventory ({sortedWorkloads.length})
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '2px' }}>
            Detailed specs, regional grid intensities, PUE multipliers, and monthly carbon output
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-control" 
              style={{ paddingLeft: '34px', fontSize: '0.825rem' }}
              placeholder="Search workloads..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Provider Filter */}
          <select 
            className="input-control" 
            style={{ width: '130px', fontSize: '0.825rem' }}
            value={providerFilter}
            onChange={e => setProviderFilter(e.target.value)}
          >
            <option value="ALL">All Clouds</option>
            <option value="AWS">AWS</option>
            <option value="GCP">GCP</option>
            <option value="Azure">Azure</option>
          </select>

          {/* Environment Filter */}
          <select 
            className="input-control" 
            style={{ width: '150px', fontSize: '0.825rem' }}
            value={envFilter}
            onChange={e => setEnvFilter(e.target.value)}
          >
            <option value="ALL">All Environments</option>
            <option value="Production">Production</option>
            <option value="Development">Development</option>
            <option value="Staging">Staging</option>
            <option value="Batch Analytics">Batch Analytics</option>
          </select>

        </div>
      </div>

      {/* Workload Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                Workload & Service <ArrowUpDown size={12} style={{ inlineSize: '12px' }} />
              </th>
              <th style={{ padding: '12px 14px' }}>Cloud Provider</th>
              <th style={{ padding: '12px 14px' }}>Region & Grid Intensity</th>
              <th style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => toggleSort('vcpus')}>
                Hardware Specs <ArrowUpDown size={12} />
              </th>
              <th style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => toggleSort('cost')}>
                Monthly Cost <ArrowUpDown size={12} />
              </th>
              <th style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => toggleSort('co2e')}>
                Monthly Carbon CO₂e <ArrowUpDown size={12} />
              </th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedWorkloads.map(wkl => {
              const metrics = wkl.metrics || {};
              const regionDetails = wkl.regionDetails || {};

              return (
                <tr 
                  key={wkl.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  
                  {/* Workload Name & Env */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                      {wkl.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                        {wkl.serviceType}
                      </span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        {wkl.environment}
                      </span>
                    </div>
                  </td>

                  {/* Cloud Provider */}
                  <td style={{ padding: '14px' }}>
                    {getProviderBadge(wkl.provider)}
                  </td>

                  {/* Region & Intensity */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{regionDetails.name || wkl.regionId}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      {getIntensityBadge(metrics.gridCarbonIntensity || 300)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>PUE {regionDetails.pue || 1.15}</span>
                    </div>
                  </td>

                  {/* Specs & Load */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                      {wkl.specs.vCPUs} vCPU • {wkl.specs.ramGb}GB RAM {wkl.specs.gpus > 0 ? `• ${wkl.specs.gpus}x GPU` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <div style={{ flex: 1, height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${wkl.utilizationPct}%`, height: '100%', background: wkl.utilizationPct > 70 ? '#10b981' : '#f59e0b', borderRadius: '2px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>{wkl.utilizationPct}% util</span>
                    </div>
                  </td>

                  {/* Monthly Cost */}
                  <td style={{ padding: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                    ${(metrics.monthlyCostUsd || 0).toLocaleString()}
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                      {wkl.monthlyHours}h / month
                    </div>
                  </td>

                  {/* Monthly Carbon CO2e */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800 }} className="text-gradient-emerald">
                      {(metrics.totalKgCO2e || 0).toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>kg</span>
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                      {(metrics.energyKwhMonth || 0).toLocaleString()} kWh energy
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px', borderRadius: '6px' }}
                        title="Edit region or specs"
                        onClick={() => setEditingWorkload(wkl)}
                      >
                        <Edit3 size={14} color="#06b6d4" />
                      </button>

                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px', borderRadius: '6px' }}
                        title="Delete workload"
                        onClick={() => onDeleteWorkload(wkl.id)}
                      >
                        <Trash2 size={14} color="#f43f5e" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedWorkloads.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            No cloud workloads matched your search filter.
          </div>
        )}
      </div>

      {/* Edit Modal Dialog */}
      {editingWorkload && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '480px', padding: '24px', position: 'relative' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
              Modify Workload: {editingWorkload.name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Region:</label>
                <select 
                  className="input-control"
                  value={editingWorkload.regionId}
                  onChange={e => setEditingWorkload({ ...editingWorkload, regionId: e.target.value })}
                >
                  {Object.entries(regions || {}).map(([key, reg]) => (
                    <option key={key} value={key}>
                      [{reg.provider}] {reg.name} ({reg.gridCarbonIntensity} gCO2e/kWh)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Average Utilization (%):</label>
                <input 
                  type="number"
                  min="5"
                  max="100"
                  className="input-control"
                  value={editingWorkload.utilizationPct}
                  onChange={e => setEditingWorkload({ ...editingWorkload, utilizationPct: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Monthly Hours:</label>
                <input 
                  type="number"
                  min="1"
                  max="720"
                  className="input-control"
                  value={editingWorkload.monthlyHours}
                  onChange={e => setEditingWorkload({ ...editingWorkload, monthlyHours: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setEditingWorkload(null)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-emerald" 
                  onClick={() => {
                    onUpdateWorkload(editingWorkload.id, {
                      regionId: editingWorkload.regionId,
                      utilizationPct: editingWorkload.utilizationPct,
                      monthlyHours: editingWorkload.monthlyHours
                    });
                    setEditingWorkload(null);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
