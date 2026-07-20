'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Registration failed.');
    } else {
      setSuccess('Account created! Signing you in…');
      const loginRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (!loginRes?.error) {
        router.push('/');
        router.refresh();
      }
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow effects */}
      <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(225,6,0,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '10%', width: '400px', height: '300px', background: 'radial-gradient(ellipse, rgba(0,100,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0', textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 900, background: 'linear-gradient(135deg,#e10600,#ff4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>F1</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, letterSpacing: '5px', color: 'var(--text-primary)' }}>DASH</span>
          </Link>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '6px' }}>
            Ultimate F1 Hub
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Red top strip */}
          <div style={{ height: '4px', background: 'linear-gradient(to right, #e10600, #ff6644, #e10600)' }} />

          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                style={{
                  padding: '16px',
                  background: tab === t ? 'var(--bg-elevated)' : 'transparent',
                  border: 'none',
                  borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t === 'login' ? '🔑 Sign In' : '🏁 Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Error / Success */}
            {error && (
              <div style={{ background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '13px', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(57,181,74,0.1)', border: '1px solid rgba(57,181,74,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '13px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✅ {success}
              </div>
            )}

            {/* Name (register only) */}
            {tab === 'register' && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input id="name" type="text" value={form.name} onChange={set('name')} placeholder="Max Verstappen" style={inputStyle} />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" style={labelStyle}>Email Address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="driver@f1dash.com"
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder={tab === 'register' ? 'Min. 8 characters' : '••••••••'}
                required
                style={inputStyle}
              />
            </div>

            {/* Confirm Password (register only) */}
            {tab === 'register' && (
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  id="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #e10600, #c00000)',
                border: 'none',
                borderRadius: 'var(--radius)',
                padding: '14px',
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '4px',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(225,6,0,0.3)',
              }}
            >
              {loading ? '⏳ Please wait...' : tab === 'login' ? '🔑 Sign In' : '🏁 Create Account'}
            </button>

            {tab === 'login' && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                No account?{' '}
                <button type="button" onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>
                  Register here
                </button>
              </p>
            )}
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>← Back to F1 Dash</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: 'var(--text-muted)',
  marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.2s',
};
