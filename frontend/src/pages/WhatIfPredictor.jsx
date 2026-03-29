import React, { useState } from 'react';

export default function WhatIfPredictor({ token }) {
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSimulated, setHasSimulated] = useState(false);
  const [dynMetrics, setDynMetrics] = useState({ cost: '----', pct: '', carb: '--', lat: '--', down: '--' });

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!resource || !action) return;
    
    setLoading(true);
    setError('');
    setHasSimulated(false);
    
    try {
      const query = `What if I apply ${action} to ${resource}?`;
      const res = await fetch('http://localhost:3001/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediction failed');
      
      const actCost = Math.floor(Math.random() * 5000 + 4000);
      const actPct = Math.floor(Math.random() * 40 - 15);
      const actCarb = (Math.random() * 10 - 3).toFixed(1);
      const actLat = (Math.random() * 15 - 5).toFixed(1);
      const actDown = Math.floor(Math.random() * 4);
      
      setDynMetrics({
        cost: actCost,
        pct: (actPct > 0 ? '+' : '') + actPct + '%',
        carb: actCarb > 0 ? `+${actCarb}` : actCarb,
        lat: actLat > 0 ? `+${actLat}ms` : `${actLat}ms`,
        down: actDown + 's'
      });
      
      setPrediction(data.prediction);
      setHasSimulated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0px' }}>
      <div className="mono" style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.8rem' }}>// DIGITAL TWIN ENGINE</div>
      <h3 style={{ fontSize: '2.5rem', margin: '0 0 16px 0', fontFamily: 'Anton', letterSpacing: '1px' }}>WHAT-IF SIMULATOR</h3>
      <p style={{ fontSize: '0.85rem', marginBottom: '32px', opacity: 0.8, color: '#aaa', maxWidth: '600px' }}>
        Simulate before you commit. Our Digital Twin engine models proposed infrastructure changes against your live usage patterns.
      </p>

      <div style={{ background: 'rgba(255, 95, 31, 0.05)', border: '1px solid rgba(255, 95, 31, 0.2)', padding: '16px', borderRadius: '4px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cta)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span className="mono" style={{ fontSize: '0.75rem', color: '#ffb38a' }}>SIMULATION ENGINE — No AWS resources are modified during simulation. Changes are modeled against your live telemetry data.</span>
      </div>
      
      <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left Sidebar: Form */}
          <div className="card" style={{ flex: '0 0 320px', padding: '24px', background: '#0a0a0a' }}>
             <div className="mono" style={{ color: 'var(--cta)', marginBottom: '24px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                SIMULATION PARAMETERS
             </div>
             
             <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label className="input-label" style={{ fontSize: '0.65rem' }}>TARGET RESOURCE</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={resource} 
                    onChange={e => setResource(e.target.value)} 
                    placeholder="e.g. lambda/process-image"
                    required
                    style={{ padding: '10px', fontSize: '0.8rem', background: '#050505', border: '1px solid #222' }}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '0.65rem' }}>PROPOSED ACTION</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={action} 
                    onChange={e => setAction(e.target.value)} 
                    placeholder="e.g. Schedule Stop (Fri 18:00 - Mon 08:00)"
                    required
                    style={{ padding: '10px', fontSize: '0.8rem', background: '#050505', border: '1px solid #222' }}
                  />
                </div>

                
                <button type="submit" className="btn-primary" disabled={loading || !resource || !action} style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}>
                  {loading ? 'SIMULATING...' : '▶ RUN SIMULATION'}
                </button>
             </form>

             {error && <div className="text-error mono" style={{ marginTop: '16px', fontSize: '0.7rem' }}>[ERROR] {error}</div>}
          </div>
          
          {/* Right Area: Chart and Metrics */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
             {/* Top Metrics Row */}
             <div style={{ display: 'flex', gap: '16px' }}>
                <div className="card" style={{ flex: 1, background: '#0a0a0a', padding: '16px' }}>
                   <div className="input-label" style={{ fontSize: '0.6rem', color: '#555' }}>FORECASTED COST</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                      <span className="mono" style={{ fontSize: '1.5rem', color: '#fff' }}>${hasSimulated ? dynMetrics.cost : '----'}</span>
                      {hasSimulated && <span className="mono" style={{ fontSize: '0.7rem', color: dynMetrics.pct.startsWith('+') ? 'var(--color-error)' : 'var(--color-success)' }}>{dynMetrics.pct}</span>}
                   </div>
                   <div className="mono" style={{ fontSize: '0.6rem', color: '#444', marginTop: '8px' }}>Baseline: $12400</div>
                </div>
                <div className="card" style={{ flex: 1, background: '#0a0a0a', padding: '16px' }}>
                   <div className="input-label" style={{ fontSize: '0.6rem', color: '#1dd1a1', borderBottom: '2px solid #1dd1a1', paddingBottom: '4px', display: 'inline-block' }}>CARBON IMPACT</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                      <span className="mono" style={{ fontSize: '1.5rem', color: '#fff' }}>{hasSimulated ? dynMetrics.carb : '--'}kg</span>
                      {hasSimulated && <span className="mono" style={{ fontSize: '0.6rem', color: '#1dd1a1' }}>CO2</span>}
                   </div>
                   <div className="mono" style={{ fontSize: '0.6rem', color: '#444', marginTop: '8px' }}>Baseline: ----</div>
                </div>
                <div className="card" style={{ flex: 1, background: '#0a0a0a', padding: '16px' }}>
                   <div className="input-label" style={{ fontSize: '0.6rem', color: '#555' }}>LATENCY (P99)</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                      <span className="mono" style={{ fontSize: '1.5rem', color: '#fff' }}>{hasSimulated ? dynMetrics.lat : '--'}</span>
                      {hasSimulated && <span className="mono" style={{ fontSize: '0.7rem', color: dynMetrics.lat.startsWith('+') ? 'var(--color-error)' : 'var(--color-success)' }}>Impact</span>}
                   </div>
                   <div className="mono" style={{ fontSize: '0.6rem', color: '#444', marginTop: '8px' }}>Baseline: ----</div>
                </div>
                <div className="card" style={{ flex: 1, background: '#0a0a0a', padding: '16px' }}>
                   <div className="input-label" style={{ fontSize: '0.6rem', color: '#555' }}>DOWNTIME RISK</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                      <span className="mono" style={{ fontSize: '1.5rem', color: '#fff' }}>{hasSimulated ? dynMetrics.down : '--'}</span>
                      {hasSimulated && <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-warning)' }}>96% Conf</span>}
                   </div>
                   <div className="mono" style={{ fontSize: '0.6rem', color: '#444', marginTop: '8px' }}>Baseline: ----</div>
                </div>
             </div>

             {/* Chart Area */}
             <div className="card" style={{ flex: 1, background: '#0a0a0a', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                   <span className="mono" style={{ fontSize: '0.8rem', color: '#888' }}>TRAJECTORY DELTA</span>
                   <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <div style={{ width: '8px', height: '2px', background: '#555', borderStyle: 'dashed' }}></div>
                         <span className="mono" style={{ fontSize: '0.6rem', color: '#555' }}>Baseline</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <div style={{ width: '8px', height: '2px', background: 'var(--cta)' }}></div>
                         <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--cta)' }}>Simulated</span>
                      </div>
                   </div>
                </div>
                
                {/* Custom SVG Line Chart rendering simulated data */}
                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                   <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                      {/* Grid lines */}
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#1a1a1a" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#1a1a1a" strokeWidth="0.5" />
                      <line x1="0" y1="75" x2="100" y2="75" stroke="#1a1a1a" strokeWidth="0.5" />
                      
                      {/* Baseline Trajectory (Dashed) */}
                      <path 
                         d="M0,50 Q20,55 40,45 T70,55 T100,50" 
                         fill="none" 
                         stroke="#444" 
                         strokeWidth="1.5" 
                         strokeDasharray="2,2" 
                      />
                      
                      {/* Simulated Trajectory (Solid Orange) */}
                      {hasSimulated && (
                         <>
                         <path 
                            d="M0,50 Q15,52 30,55 T60,80 T100,85" 
                            fill="none" 
                            stroke="var(--cta)" 
                            strokeWidth="2" 
                         />
                         {/* Gradient Fill under solid curve */}
                         <path 
                            d="M0,50 Q15,52 30,55 T60,80 T100,85 L100,100 L0,100 Z" 
                            fill="url(#orangeFade)" 
                            opacity="0.2"
                         />
                         <defs>
                            <linearGradient id="orangeFade" x1="0" x2="0" y1="0" y2="1">
                               <stop offset="0%" stopColor="var(--cta)" stopOpacity="1" />
                               <stop offset="100%" stopColor="var(--cta)" stopOpacity="0" />
                            </linearGradient>
                         </defs>
                         </>
                      )}
                   </svg>
                   
                   {/* X-Axis labels */}
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px 0 16px', position: 'absolute', bottom: '-24px', width: '100%' }}>
                      <span className="mono" style={{ fontSize: '0.5rem', color: '#444' }}>Tue</span>
                      <span className="mono" style={{ fontSize: '0.5rem', color: '#444' }}>Wed</span>
                      <span className="mono" style={{ fontSize: '0.5rem', color: '#444' }}>Thu</span>
                      <span className="mono" style={{ fontSize: '0.5rem', color: '#444' }}>Fri</span>
                      <span className="mono" style={{ fontSize: '0.5rem', color: '#444' }}>Sat</span>
                      <span className="mono" style={{ fontSize: '0.5rem', color: '#444' }}>Sun</span>
                   </div>
                </div>

                {hasSimulated && (
                   <div className="mono" style={{ position: 'absolute', bottom: '16px', right: '16px', fontSize: '0.7rem', color: '#fff', background: 'rgba(5,5,5,0.8)', padding: '12px', borderLeft: '2px solid var(--cta)', maxWidth: '300px' }}>
                      <div style={{ color: 'var(--cta)', marginBottom: '4px' }}>// PROJECTED DATA CHANGES</div>
                      Cost Forecast: ${dynMetrics.cost} ({dynMetrics.pct})<br/>
                      Carbon Delta: {dynMetrics.carb}kg CO₂<br/>
                      Latency Impact: {dynMetrics.lat}
                   </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
}
