import React, { useState } from 'react';

export default function LoginView({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [externalId, setExternalId] = useState('');
  const [pendingToken, setPendingToken] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleArn, setRoleArn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await fetch(`http://localhost:3001/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failed');
        if (!data.aws_role_arn) {
          setExternalId(data.aws_external_id);
          setPendingToken(data.token);
          setIsSetupMode(true);
        } else {
          setToken(data.token);
        }
      } else {
        const res = await fetch(`http://localhost:3001/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        setExternalId(data.aws_external_id);
        setIsSetupMode(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAws = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let tokenToUse = pendingToken;

      if (!tokenToUse) {
        const loginRes = await fetch(`http://localhost:3001/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || 'Failed to initialize session');
        tokenToUse = loginData.token;
      }

      const linkRes = await fetch(`http://localhost:3001/api/aws/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({ aws_role_arn: roleArn })
      });
      if (!linkRes.ok) throw new Error("Failed to link IAM Role");

      setToken(tokenToUse);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSetupMode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="card fade-up" style={{ maxWidth: '450px', width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Configure IAM Role</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '24px' }}>
            We've generated a secure token for your account. Please create an IAM Role in your AWS environment with the following <strong>External ID</strong>:
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontFamily: 'monospace' }}>
            {externalId}
          </div>
          {error && <div className="text-error" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
          <form onSubmit={handleLinkAws} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label">AWS IAM Role ARN</label>
              <input
                type="text"
                className="input-field"
                value={roleArn}
                onChange={e => setRoleArn(e.target.value)}
                placeholder="arn:aws:iam::123456789012:role/MyRole"
                required
              />
            </div>
            <button type="submit" className="btn-primary beam-border" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Verifying...' : 'Complete Registration'}
            </button>
          </form>
          <button
            onClick={() => { setIsSetupMode(false); if (pendingToken) setToken(pendingToken); }}
            style={{ width: '100%', marginTop: '12px', background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '8px' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card fade-up" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <div className="text-error" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Username</label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary beam-border" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}