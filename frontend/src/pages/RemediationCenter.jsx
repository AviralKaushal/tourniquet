import React, { useState } from 'react';

export default function RemediationCenter({ anomalies, token, onRemediate }) {
  const [remediatingId, setRemediatingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const handleRemediate = async (anomaly) => {
    setRemediatingId(anomaly.id);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`http://localhost:3001/api/anomalies/${anomaly.id}/remediate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbackMsg({ type: 'success', text: `FIX EXECUTED: ${anomaly.resource_id}.`, logs: data.details?.remediation_logs });
        onRemediate(); // refresh dashboard
      } else {
        const errData = await res.json();
        setFeedbackMsg({ type: 'error', text: errData.error || `FIX FAILED: ${anomaly.resource_id}.`, logs: errData.details?.remediation_logs });
        onRemediate(); // refresh dashboard
      }
    } catch (err) {
      console.error("Remediation failed", err);
      setFeedbackMsg({ type: 'error', text: 'CONNECTION ERROR OCCURRED.' });
    } finally {
      setRemediatingId(null);
    }
  };

  const getIssueDescription = (a) => {
    if (a.public_access === 1) return "SECURITY: UNAUTHENTICATED PUBLIC EXPOSURE. SECURE IMMEDIATELY.";
    if (a.cpu > 90 && a.errors > 50) return "CRITICAL LOAD: INSTANCE THRASHING. REQUIRES VERTICAL SCALING (RAM/CPU).";
    if (a.cpu > 90) return "CPU OVERLOAD: CONSISTENT REDLINE. CONSIDER SCALING INSTANCE UP.";
    if (a.cpu < 15 && a.errors < 5) return "IDLE RESOURCE: SEVERELY UNDERUTILIZED. RECOMMEND DECOMMISSIONING.";
    if (a.errors > 20) return "ELEVATED ERROR RATE: POTENTIAL MEMORY LEAK OR CRASH LOOP.";
    return "SUB-OPTIMAL CONFIGURATION DETECTED.";
  };

  const getLogSummary = (a) => {
    if (a.status === 'remediated') {
      if (a.cpu < 15 && a.errors < 5) return "RESOURCE TERMINATED - COST OPTIMIZED";
      if (a.cpu > 90) return "INSTANCE CAPACITY UPGRADED";
      if (a.public_access === 1) return "PUBLIC EXPOSURE POLICY REVOKED";
      return "SUCCESSFULLY REMEDIATED";
    }
    return "FAILED FIX OR ROLLED BACK";
  };

  const pendingAnomalies = anomalies.filter(a => a.status === 'pending');
  const remediatedAnomalies = anomalies.filter(a => a.status !== 'pending');

  return (
    <div className="card fade-up" style={{ borderTop: '2px solid var(--cta)', position: 'relative' }}>
      <div className="mono" style={{ position: 'absolute', top: '-1px', left: '0', background: 'var(--cta)', color: '#000', padding: '2px 8px', fontSize: '0.6rem', fontWeight: 'bold' }}>
         REMEDIAN NODE
      </div>
      <div className="mono" style={{ color: 'var(--text-muted)', marginBottom: '8px', marginTop: '12px' }}>// AUTONOMOUS REMEDIATION</div>
      <h3 style={{ fontSize: '1.8rem', margin: '0 0 24px 0' }}>EXECUTE & VERIFY</h3>
      
      {feedbackMsg && (
        <div style={{ 
          padding: '16px', 
          marginBottom: '24px', 
          borderRadius: '4px',
          color: feedbackMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-error)', 
          background: 'rgba(0,0,0,0.6)',
          borderLeft: `3px solid ${feedbackMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`
        }}>
          <div className="mono" style={{ fontWeight: 'bold', marginBottom: '8px' }}>{feedbackMsg.text}</div>
          {feedbackMsg.logs && feedbackMsg.logs.length > 0 && (
            <div style={{ padding: '12px', background: '#050505', border: '1px solid #1a1a1a', borderRadius: '2px', fontSize: '0.75rem', whiteSpace: 'pre-wrap', fontFamily: 'Roboto Mono', color: '#b0b0b0' }}>
              {feedbackMsg.logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>{log}</div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="input-label" style={{ marginBottom: '16px' }}>ACTIVE EVENTS ({pendingAnomalies.length})</div>
      
      {pendingAnomalies.length === 0 ? (
        <div className="mono" style={{ padding: '24px', textAlign: 'center', opacity: 0.5, border: '1px dashed #333' }}>
          [&nbsp;NO PENDING EVENTS DETECTED&nbsp;]
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pendingAnomalies.map(anomaly => (
            <div key={anomaly.id} style={{ 
               padding: '16px', 
               border: '1px solid rgba(255, 51, 51, 0.3)', 
               borderRadius: '2px',
               background: 'rgba(255, 51, 51, 0.02)',
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center'
            }}>
              <div>
                <div className="mono" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>{anomaly.resource_id}</div>
                <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginBottom: '8px' }}>
                  {getIssueDescription(anomaly)}
                </div>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  [ TELEMETRY ] CPU: {anomaly.cpu}% | ERRORS: {anomaly.errors}/s
                </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'var(--color-error)' }}
                onClick={() => handleRemediate(anomaly)}
                disabled={remediatingId === anomaly.id}
              >
                {remediatingId === anomaly.id ? 'EXECUTING...' : 'APPLY FIX >_'}
              </button>
            </div>
          ))}
        </div>
      )}

      {remediatedAnomalies.length > 0 && (
         <div style={{ marginTop: '40px' }}>
             <div className="input-label" style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>ACTION LOG</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#0a0a0a', padding: '16px', border: '1px solid #1a1a1a', borderRadius: '2px' }}>
               {remediatedAnomalies.slice(0, 5).map(anomaly => (
                 <div key={anomaly.id} className="mono" style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ color: '#ccc' }}>[{anomaly.time?.split('T')[1]?.substring(0,8) || 'RECENT'}] {anomaly.resource_id} </span>
                      <span style={{ color: '#777', fontStyle: 'italic', marginLeft: '8px' }}>- {getLogSummary(anomaly)}</span>
                    </div>
                    <span style={{ color: anomaly.status === 'remediated' ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {anomaly.status === 'remediated' ? 'SUCCESS' : 'FAILED'}
                    </span>
                 </div>
               ))}
             </div>
         </div>
      )}
    </div>
  );
}
