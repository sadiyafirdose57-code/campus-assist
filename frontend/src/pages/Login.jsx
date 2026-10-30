import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Brand, ThemeToggle } from '../components.jsx';

export default function Login() {
  const { user, authenticate } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await authenticate(mode, mode === 'login' ? { email: form.email, password: form.password } : form);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-top"><Brand /><ThemeToggle /></div>
      <div className="login-body">
        <section className="login-pitch">
          <h1>Doubts about attendance, fees or hostel? Ask here.</h1>
          <p>Answers come straight from your college's own circulars and rulebooks, with the source shown next to every reply.</p>
          <ul className="pitch-list">
            <li>Backlog and re-evaluation rules</li>
            <li>Scholarship and fee deadlines</li>
            <li>Placement, internship NOC and certificates</li>
          </ul>
        </section>

        <form className="card login-card" onSubmit={submit}>
          <h2>{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
          {mode === 'register' && (
            <label>Full name
              <input value={form.name} onChange={set('name')} autoComplete="name" required />
            </label>
          )}
          <label>College email
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>
          <label>Password
            <input type="password" value={form.password} onChange={set('password')} minLength={mode === 'register' ? 8 : 1}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn primary" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          <button type="button" className="link-btn" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
