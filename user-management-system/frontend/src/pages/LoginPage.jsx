import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import Mark from '../components/Mark.jsx';
import { homePath, useAuth } from '../context/AuthContext.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@example.com', password: 'Admin@123' },
  { label: 'Manager', email: 'manager@example.com', password: 'Manager@123' },
  { label: 'User', email: 'user@example.com', password: 'User@1234' },
  { label: 'Manager and user', email: 'jane@example.com', password: 'Jane@1234' },
];

export default function LoginPage() {
  const { user, login, notice } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={homePath(user)} replace />;
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await login(email, password);
      navigate(homePath(session), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <section className="login-brand">
        <h1>User management</h1>
        <p>Create accounts, assign roles and hand out tasks, with each person seeing only what their role allows.</p>
        <Mark className="login-mark" />
      </section>

      <section className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <h2>Sign in</h2>

          {notice && <p className="notice">{notice}</p>}
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}

          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="demo">
            <p className="muted">Fill in a sample account from the seeded data:</p>
            <div className="demo-buttons">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.password);
                    setError('');
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
