import React, { useState, useEffect } from 'react';
import WhatIfPredictor from './WhatIfPredictor';
import RemediationCenter from './RemediationCenter';

export default function DashboardView({ token, onLogout }) {
  const [metrics, setMetrics] = useState(null);
  const [resources, setResources] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('platform');

  const fetchData = async () => {
    try {
      const dbRes = await fetch('http://localhost:3001/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dbData = await dbRes.json();
      setMetrics(dbData.latestMetrics);
      setResources(dbData.resources || []);
      
      const anomRes = await fetch('http://localhost:3001/api/anomalies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const anomData = await anomRes.json();
      setAnomalies(anomData);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="app-container fade-up">
      {/* LEFT SIDEBAR */}
      <div className="sidebar" style={{ width: '250px', backgroundColor: '#050505', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          <span style={{ fontFamily: 'Anton', fontSize: '1.5rem', letterSpacing: '1px' }}>TOURNIQUET</span>
        </div>
        
        <div className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
           <a href="#platform" onClick={() => setActiveNav('platform')} className="sidebar-link" style={activeNav === 'platform' ? { padding: '12px', color: 'var(--cta)', background: 'rgba(255, 95, 31, 0.05)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Roboto Mono', fontSize: '0.8rem', borderLeft: '2px solid var(--cta)' } : { padding: '12px', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Roboto Mono', fontSize: '0.8rem', borderLeft: '2px solid transparent' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
             PLATFORM OVERVIEW
           </a>
           <a href="#intelligence" onClick={() => setActiveNav('intelligence')} className="sidebar-link" style={activeNav === 'intelligence' ? { padding: '12px', color: 'var(--cta)', background: 'rgba(255, 95, 31, 0.05)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Roboto Mono', fontSize: '0.8rem', borderLeft: '2px solid var(--cta)' } : { padding: '12px', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Roboto Mono', fontSize: '0.8rem', borderLeft: '2px solid transparent' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
             LIVE METRICS
           </a>
           <a href="#twin" onClick={() => setActiveNav('twin')} className="sidebar-link" style={activeNav === 'twin' ? { padding: '12px', color: 'var(--cta)', background: 'rgba(255, 95, 31, 0.05)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Roboto Mono', fontSize: '0.8rem', borderLeft: '2px solid var(--cta)' } : { padding: '12px', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Roboto Mono', fontSize: '0.8rem', borderLeft: '2px solid transparent' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
             WHAT-IF TWIN
           </a>
           <a href="#security" onClick={() => setActiveNav('security')} className="sidebar-link" style={activeNav === 'security' ? { padding: '12px', color: 'var(--cta)', background: 'rgba(255, 95, 31, 0.05)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Roboto Mono', fontSize: '0.8rem', borderLeft: '2px solid var(--cta)' } : { padding: '12px', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Roboto Mono', fontSize: '0.8rem', borderLeft: '2px solid transparent' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
             REMEDIATION LOGS
           </a>
        </div>
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid #1a1a1a', paddingTop: '24px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }}></div>
              <span className="mono" style={{ color: 'var(--color-success)', fontSize: '0.7rem' }}>TOURNIQUET CONNECTED</span>
           </div>
           <button className="btn-secondary mono" style={{ width: '100%', padding: '8px', fontSize: '0.7rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={onLogout}>DISCONNECT</button>
        </div>
      </div>
      
      {/* MAIN CONTENT AREA */}
      <div className="main-content" style={{ flex: 1, marginLeft: '250px', padding: '40px 80px', minHeight: '100vh', Width: 'calc(100vw - 250px)' }}>
      {/* Hero Section */}
      <div id="platform" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '80px', marginTop: '10px' }}>
         <div style={{ flex: 1, maxWidth: '600px' }}>
            <div className="mono" style={{ color: 'var(--cta)', marginBottom: '24px' }}>// TOURNIQUET INTELLIGENCE PLATFORM</div>
            <h1 className="hero-title">
               YOUR CLOUD <br />
               COSTS MORE <br />
               <span className="hero-highlight">THAN IT SHOULD.</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '32px', maxWidth: '500px' }}>
               TOURNIQUET stops cloud cost hemorrhages before they become disasters. Real-time anomaly detection, autonomous remediation, and predictive intelligence — all in one operational platform.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
               <div className="mono" style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '0.7rem', color: 'var(--cta)' }}>+ REAL-TIME TELEMETRY</div>
               <div className="mono" style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '0.7rem', color: 'var(--cta)' }}>+ ML ANOMALY ENGINE</div>
               <div className="mono" style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '0.7rem', color: 'var(--cta)' }}>+ AUTONOMOUS REMEDIATION</div>
            </div>
         </div>
         
         {/* Live Metrics Terminal Box */}
         <div className="card" style={{ flex: 1, marginLeft: '60px', padding: '0', border: '1px solid #333', background: '#0a0a0a', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
               </div>
               <div className="mono" style={{ flex: 1, textAlign: 'center', color: '#555', fontSize: '0.7rem' }}>tourniquet --monitor --live --</div>
            </div>
            <div style={{ padding: '40px 32px' }}>
                 <div className="input-label" style={{ color: '#555', marginBottom: '16px' }}>// LIVE PLATFORM METRICS</div>
                 <div className="grid grid-cols-2" style={{ gap: '32px' }}>
                   <div>
                     <div className="input-label">RUN RATE</div>
                     {loading ? <div className="skeleton" /> : (
                       <div className="stat-value text-success" style={{ fontSize: '2.5rem', margin: '4px 0' }}>
                          ${metrics?.current_bill_usd || 'N/A'}
                       </div>
                     )}
                   </div>
                   <div>
                     <div className="input-label">PREDICTED NEXT MONTH</div>
                      {loading ? <div className="skeleton" /> : (
                       <div className="stat-value text-warning" style={{ fontSize: '2.5rem', margin: '4px 0' }}>
                          ${metrics?.predicted_next_month_usd || 'N/A'}
                       </div>
                     )}
                   </div>
                 </div>
                 
                 <div style={{ marginTop: '24px' }}>
                     <div className="input-label">CARBON FOOTPRINT</div>
                      {loading ? <div className="skeleton" /> : (
                       <div className="stat-value" style={{ fontSize: '2.5rem', margin: '4px 0', color: '#fff' }}>
                          {metrics?.carbon_footprint_kg || 'N/A'} <span style={{fontSize: '1rem', color: '#888'}}>kgCO2e</span>
                       </div>
                     )}
                 </div>
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #222', background: '#050505', display: 'flex', justifyContent: 'space-between' }}>
                <span className="mono" style={{ color: 'var(--color-error)' }}>&bull; {anomalies.filter(a => a.status === 'pending').length} ANOMALIES</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>&bull; AGENT ACTIVE</span>
            </div>
         </div>
      </div>

       <div id="intelligence" style={{ marginBottom: '80px', paddingTop: '40px' }}>
        <div align="center" style={{ marginBottom: '40px' }}>
           <div className="mono" style={{ color: 'var(--cta)', marginBottom: '16px' }}>// CORE CAPABILITIES</div>
           <h2 style={{ fontSize: '3rem', margin: 0 }}>BUILT FOR OPERATORS.</h2>
           <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '16px auto' }}>Every feature designed for the engineer who gets paged at 2am — not the executive who reads the monthly report.</p>
        </div>
        
        {loading ? <div className="skeleton" style={{ height: '100px' }} /> : (
          <div className="grid grid-cols-3">
            {resources?.length > 0 ? resources.map((res, i) => (
              <div key={res.id} className="card" style={{ padding: '24px', border: res.public_access ? '1px solid rgba(255, 51, 51, 0.5)' : '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--cta)', marginBottom: '16px' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.2rem', fontFamily: 'Space Grotesk' }}>{res.id}</span>
                </div>
                {res.public_access === 1 && <span className="pill error" style={{ marginBottom: '16px', display: 'inline-block' }}>EXPOSED</span>}
                <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', justifyContent: 'space-between', marginBottom:'8px', fontFamily: 'Roboto Mono' }}>
                    <span>CPU Load</span> 
                    <span style={{color: res.cpu > 80 ? 'var(--color-warning)' : 'var(--color-success)'}}>{res.cpu}%</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', justifyContent: 'space-between', fontFamily: 'Roboto Mono' }}>
                    <span>Error Rate</span> 
                    <span style={{color: res.errors > 10 ? 'var(--color-warning)' : 'var(--color-success)'}}>{res.errors}/s</span>
                </div>
              </div>
            )) : <div style={{color: '#888', fontStyle: 'italic', gridColumn: '1 / -1', textAlign: 'center'}}>No services actively generating data.</div>}
          </div>
        )}
      </div>

      <div align="center" style={{ marginBottom: '40px' }}>
           <div className="mono" style={{ color: 'var(--cta)', marginBottom: '16px' }}>// PLATFORM ARCHITECTURE</div>
           <h2 style={{ fontSize: '3rem', margin: 0 }}>INTELLIGENCE AT EVERY LAYER.</h2>
           <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '16px auto' }}>Three autonomous nodes working in sequence. No hardcoded rules. Pure machine learning from your live telemetry.</p>
      </div>

      <div style={{ marginBottom: '80px', paddingTop: '40px' }}>
         <div id="twin" style={{ marginBottom: '60px' }}><WhatIfPredictor token={token} /></div>
         <div id="security"><RemediationCenter anomalies={anomalies} token={token} onRemediate={fetchData} /></div>
      </div>
      </div>
    </div>
  );
}
