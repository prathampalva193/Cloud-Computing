import React from 'react';
import { Compass, Leaf, PlusCircle, RefreshCw, BookOpen, Download, AlertCircle } from 'lucide-react';

export default function Header({ onOpenAddModal, onOpenMethodology, onOpenExport, onResetData, isResetting }) {
  return (
    <header className="glass-panel" style={{ padding: '20px 28px', marginBottom: '24px', borderTop: '3px solid #10b981' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)',
            border: '1px solid var(--border-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <Compass size={28} className="animate-pulse-glow" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                Cloud Carbon <span className="text-gradient-emerald">Compass</span>
              </h1>
              <span className="badge badge-emerald">
                <Leaf size={12} /> Live Estimator
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
              Multi-cloud workload carbon footprint estimation & green operational optimizer
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onOpenMethodology}
            title="View carbon model assumptions & PUE formulas"
          >
            <BookOpen size={16} color="#22d3ee" />
            <span>Methodology</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onOpenExport}
            title="Export carbon report"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onResetData}
            disabled={isResetting}
            title="Reset workloads to baseline sample dataset"
          >
            <RefreshCw size={16} className={isResetting ? "animate-spin" : ""} />
            <span>Reset Data</span>
          </button>

          <button 
            className="btn btn-emerald" 
            onClick={onOpenAddModal}
          >
            <PlusCircle size={18} />
            <span>Add Workload</span>
          </button>
        </div>

      </div>

      {/* Estimator Disclaimer Banner */}
      <div style={{
        marginTop: '16px',
        padding: '8px 14px',
        borderRadius: '8px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: 'var(--amber-400)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={15} color="#f59e0b" />
          <span>
            <strong>Note:</strong> Carbon emissions & energy usage are estimated based on SPECpower benchmarks, data center PUE ratios, and grid intensity data (Ember/electricityMaps), not live cloud provider telemetries.
          </span>
        </div>
        <button 
          onClick={onOpenMethodology}
          style={{ background: 'none', border: 'none', color: '#fbbf24', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
        >
          View Model Specs
        </button>
      </div>

    </header>
  );
}
