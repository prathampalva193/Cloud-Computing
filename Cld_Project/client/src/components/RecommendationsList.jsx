import React from 'react';
import { Lightbulb, ArrowUpRight, CheckCircle2, ShieldCheck, Leaf, Zap, Globe, Clock, Cpu } from 'lucide-react';
import { api } from '../services/api';

export default function RecommendationsList({ recommendations, onRecommendationApplied }) {
  if (!recommendations || recommendations.length === 0) return null;

  const handleApply = async (rec) => {
    try {
      if (rec.actionType === 'MIGRATE_REGION') {
        await api.updateWorkload(rec.workloadId, { regionId: rec.targetRegionId });
      } else if (rec.actionType === 'SCHEDULE_PAUSE') {
        await api.updateWorkload(rec.workloadId, { monthlyHours: rec.targetMonthlyHours });
      } else if (rec.actionType === 'RIGHT_SIZE') {
        await api.updateWorkload(rec.workloadId, { vCPUs: rec.targetVCPUs });
      }
      if (onRecommendationApplied) {
        onRecommendationApplied();
      }
    } catch (err) {
      console.error('Error applying recommendation:', err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Region Migration': return <Globe size={18} color="#06b6d4" />;
      case 'Workload Schedule': return <Clock size={18} color="#10b981" />;
      case 'Right-Sizing': return <Cpu size={18} color="#f59e0b" />;
      default: return <Leaf size={18} color="#10b981" />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={20} color="#fbbf24" />
            Automated Green Recommendations ({recommendations.length})
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
            Ranked lower-impact operating choices to reduce carbon intensity and optimize cloud spend
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {recommendations.map(rec => (
          <div 
            key={rec.id}
            style={{
              background: 'rgba(9, 14, 17, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'border-color 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-emerald)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getCategoryIcon(rec.category)}
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                    {rec.category}
                  </span>
                </div>
                <span className={`badge ${rec.impact === 'High' ? 'badge-emerald' : 'badge-amber'}`}>
                  {rec.impact} Impact
                </span>
              </div>

              {/* Title & Description */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', lineHeight: '1.3' }}>
                {rec.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                {rec.description}
              </p>
            </div>

            <div>
              {/* Metric Callouts */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Carbon Savings</div>
                  <div style={{ fontWeight: 800, color: 'var(--emerald-400)', fontSize: '0.95rem' }}>
                    ↓ {rec.co2eSavedKgMonth.toLocaleString()} kg/mo ({rec.co2eSavedPct}%)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Cost Impact</div>
                  <div style={{ fontWeight: 700, color: rec.costImpactUsdMonth >= 0 ? '#38bdf8' : '#fbbf24', fontSize: '0.9rem' }}>
                    {rec.costImpactUsdMonth >= 0 ? `↓ $${rec.costImpactUsdMonth}/mo` : `↑ $${Math.abs(rec.costImpactUsdMonth)}/mo`}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="btn btn-outline-emerald"
                style={{ width: '100%', fontSize: '0.825rem', padding: '8px 12px' }}
                onClick={() => handleApply(rec)}
              >
                <span>Apply Recommendation</span>
                <ArrowUpRight size={15} />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
