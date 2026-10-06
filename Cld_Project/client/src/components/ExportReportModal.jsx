import React, { useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';

export default function ExportReportModal({ onClose, summary, workloads }) {
  const [copied, setCopied] = useState(false);

  const reportData = {
    generatedAt: new Date().toISOString(),
    application: "Cloud Carbon Compass",
    disclaimer: "EMISSIONS ARE ESTIMATES BASED ON SAMPLE ASSUMPTIONS, NOT LIVE PROVIDER MEASUREMENTS",
    summary: summary,
    workloadDetails: workloads?.map(w => ({
      name: w.name,
      provider: w.provider,
      serviceType: w.serviceType,
      region: w.regionDetails?.name || w.regionId,
      gridCarbonIntensityGCo2eKwh: w.metrics?.gridCarbonIntensity,
      vCPUs: w.specs?.vCPUs,
      ramGb: w.specs?.ramGb,
      monthlyCostUsd: w.metrics?.monthlyCostUsd,
      monthlyKgCO2e: w.metrics?.totalKgCO2e
    }))
  };

  const jsonString = JSON.stringify(reportData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloud-carbon-compass-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '640px', maxWidth: '95vw', padding: '28px', position: 'relative' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
            <Download size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Export Executive Carbon Report</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Download structured JSON report for audit and sustainability dashboards</p>
          </div>
        </div>

        <div style={{ background: 'rgba(9, 14, 17, 0.9)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-subtle)', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', margin: 0, whitespace: 'pre-wrap' }}>
            {jsonString}
          </pre>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
          </button>

          <button className="btn btn-emerald" onClick={handleDownload}>
            <Download size={16} />
            <span>Download Report</span>
          </button>
        </div>

      </div>
    </div>
  );
}
