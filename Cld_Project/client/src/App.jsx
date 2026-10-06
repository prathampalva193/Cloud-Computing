import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OverviewMetrics from './components/OverviewMetrics';
import CarbonDistributionChart from './components/CarbonDistributionChart';
import WhatIfSimulator from './components/WhatIfSimulator';
import WorkloadTable from './components/WorkloadTable';
import RecommendationsList from './components/RecommendationsList';
import MethodologyModal from './components/MethodologyModal';
import AddWorkloadModal from './components/AddWorkloadModal';
import ExportReportModal from './components/ExportReportModal';
import { api } from './services/api';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [workloads, setWorkloads] = useState([]);
  const [regions, setRegions] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Modals state
  const [showMethodology, setShowMethodology] = useState(false);
  const [showAddWorkload, setShowAddWorkload] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Fetch all dashboard data
  const refreshDashboard = async () => {
    try {
      const [sumRes, wklRes, regRes, recRes] = await Promise.all([
        api.getSummary(),
        api.getWorkloads(),
        api.getRegions(),
        api.getRecommendations()
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (wklRes.success) setWorkloads(wklRes.data);
      if (regRes.success) setRegions(regRes.data);
      if (recRes.success) setRecommendations(recRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  // Handlers
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await api.resetWorkloads();
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to reset workloads:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleAddWorkload = async (newWkl) => {
    try {
      await api.addWorkload(newWkl);
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to add workload:', err);
    }
  };

  const handleDeleteWorkload = async (id) => {
    try {
      await api.deleteWorkload(id);
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to delete workload:', err);
    }
  };

  const handleUpdateWorkload = async (id, updates) => {
    try {
      await api.updateWorkload(id, updates);
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to update workload:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Header Bar */}
      <Header 
        onOpenAddModal={() => setShowAddWorkload(true)}
        onOpenMethodology={() => setShowMethodology(true)}
        onOpenExport={() => setShowExport(true)}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--emerald-400)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Cloud Carbon Compass...</div>
        </div>
      ) : (
        <>
          {/* Executive Overview Metric Cards */}
          <OverviewMetrics summary={summary} />

          {/* Interactive "What If?" Scenario Simulator */}
          <WhatIfSimulator 
            onApplySimulation={refreshDashboard}
            regions={regions}
          />

          {/* Visual Breakdown Charts */}
          <CarbonDistributionChart 
            workloads={workloads} 
            summary={summary} 
          />

          {/* Smart Green Recommendations List */}
          <RecommendationsList 
            recommendations={recommendations}
            onRecommendationApplied={refreshDashboard}
          />

          {/* Detailed Workloads Inventory Table */}
          <WorkloadTable 
            workloads={workloads}
            regions={regions}
            onDeleteWorkload={handleDeleteWorkload}
            onUpdateWorkload={handleUpdateWorkload}
          />
        </>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <p>
          🌱 <strong>Cloud Carbon Compass</strong> — Open Cloud Carbon Footprint & Green Architecture Estimator
        </p>
        <p style={{ marginTop: '4px' }}>
          Emissions are estimates based on SPECpower CPU/RAM benchmarks, data center PUE ratios, and grid intensity data (Ember / electricityMaps).
        </p>
      </footer>

      {/* Modals */}
      {showMethodology && (
        <MethodologyModal 
          onClose={() => setShowMethodology(false)}
          regions={regions}
        />
      )}

      {showAddWorkload && (
        <AddWorkloadModal 
          onClose={() => setShowAddWorkload(false)}
          onAdd={handleAddWorkload}
          regions={regions}
        />
      )}

      {showExport && (
        <ExportReportModal 
          onClose={() => setShowExport(false)}
          summary={summary}
          workloads={workloads}
        />
      )}

    </div>
  );
}
