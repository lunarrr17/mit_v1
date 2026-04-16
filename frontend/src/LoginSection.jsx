import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, User2, Loader2 } from 'lucide-react';
import { setAuth } from './auth';
import { getAuthGatewayBase } from './apiConfig';
import './LoginSection.css';

const LoginSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('worker'); // 'worker' | 'admin'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdminMode = mode === 'admin';

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const roleHint = query.get('role');
    if (roleHint === 'admin') {
      setMode('admin');
    } else if (roleHint === 'worker') {
      setMode('worker');
    }
  }, [location.search]);

  const presetCredentials =
    isAdminMode
      ? { username: 'gov_admin', password: 'adminpass' }
      : { username: 'worker1', password: 'workerpass' };

  const handlePrefill = () => {
    setForm(presetCredentials);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = authMode === 'signup' ? '/signup' : '/login';
      const payload = {
        username: form.username.trim(),
        password: form.password,
      };
      if (authMode === 'signup') {
        payload.role = isAdminMode ? 'government_admin' : 'worker';
      }

      const res = await fetch(`${getAuthGatewayBase()}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        const serverMsg =
          data.error ||
          data.message ||
          data.details ||
          (rawText && !rawText.startsWith('{') ? rawText.trim().slice(0, 200) : null);
        let msg = serverMsg || `Request failed (${res.status})`;
        if (authMode === 'signup' && res.status === 409) {
          msg =
            serverMsg ||
            'This username is already taken. Try Login, or choose a different username. (Demo accounts worker1 and gov_admin already exist.)';
        }
        if (authMode === 'login' && res.status === 401) {
          msg = serverMsg || 'Invalid username or password.';
        }
        throw new Error(msg);
      }
      if (!data.token) {
        throw new Error('Invalid response from server (missing token).');
      }
      setAuth({ token: data.token, role: data.role, username: data.username || form.username.trim() });

      // After successful auth, return to homepage.
      navigate('/');
    } catch (err) {
      const msg = err?.message || '';
      if (msg === 'Failed to fetch' || err?.name === 'TypeError') {
        setError(
          'Cannot reach the auth server. Run python auth_gateway.py from mit_v1 (port 5002), then refresh. If you opened the app outside Vite dev, set VITE_AUTH_GATEWAY_URL in frontend/.env.'
        );
      } else {
        setError(msg || 'Unable to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-section" id="login">
      <div className="login-shell">
        <div className="login-header">
          <span className="login-kicker">Secure Access</span>
          <h2>Role-based entry into NutriScan.AI</h2>
          <p>
            Workers capture and screen in the field, while government teams monitor trends and coordinate
            response centrally. Choose how you want to enter the system.
          </p>
        </div>

        <div className="login-layout">
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signup');
                setError('');
              }}
            >
              Sign Up
            </button>
          </div>
          <p className="auth-hint">
            {authMode === 'signup'
              ? 'Sign up needs a new username. Demo accounts worker1 and gov_admin already exist — use Login for those.'
              : 'Use Login with your account, or Sign Up to create a new one.'}
          </p>

          <div className="login-pill-switch">
            <button
              type="button"
              className={`pill-btn ${!isAdminMode ? 'active' : ''}`}
              onClick={() => {
                setMode('worker');
                setError('');
              }}
            >
              <User2 size={16} />
              Worker Login
            </button>
            <button
              type="button"
              className={`pill-btn ${isAdminMode ? 'active' : ''}`}
              onClick={() => {
                setMode('admin');
                setError('');
              }}
            >
              <Shield size={16} />
              Government / Admin
            </button>
          </div>

          <div className="login-panels">
            <div className="login-copy-card">
              <h3>{isAdminMode ? 'Government & Public Health Teams' : 'Frontline Workers & Nurses'}</h3>
              <p>
                {isAdminMode
                  ? 'Access aggregated screenings, region-level trends, and strategic dashboards designed for district and state monitoring cells.'
                  : 'Launch the screening lab, capture images, and generate AI-assisted reports with guided decision support at point of care.'}
              </p>

              <ul>
                {isAdminMode ? (
                  <>
                    <li>Region-wise malnutrition heatmaps and trendlines</li>
                    <li>Quick filters for high-risk pockets and outbreaks</li>
                    <li>Downloadable summaries for review meetings</li>
                  </>
                ) : (
                  <>
                    <li>One-click access to the NutriScan screening lab</li>
                    <li>AI-backed recommendations aligned with protocols</li>
                    <li>Offline-first workflow with structured reports</li>
                  </>
                )}
              </ul>
            </div>

            <form className="login-form-card" onSubmit={handleSubmit}>
              <div className="form-row-header">
                <span className="badge">
                  {isAdminMode ? 'Government/Admin' : 'Worker'} {authMode === 'signup' ? 'Signup' : 'Login'}
                </span>
                <button type="button" className="ghost-btn" onClick={handlePrefill}>
                  Use demo credentials
                </button>
              </div>

              <label className="field">
                <span>Username</span>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder={presetCredentials.username}
                  required
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={presetCredentials.password}
                  required
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button className="primary-submit" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    {authMode === 'signup' ? 'Creating account…' : 'Authenticating…'}
                  </>
                ) : (
                  <>{authMode === 'signup' ? 'Create account' : 'Login'} and continue</>
                )}
              </button>

              <p className="disclaimer">
                These credentials are for demonstration and evaluation only. In production deployments, NutriScan.AI
                plugs into secure, jurisdiction-specific identity systems.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginSection;

