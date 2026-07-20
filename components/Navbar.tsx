'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Home, Radio, Calendar, Trophy, Users, BookOpen, LogOut, LogIn } from 'lucide-react';
import { Logo3D } from '@/components/Logo3D';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home size={16} strokeWidth={2.5} /> },
    { href: '/live', label: 'Live', icon: <Radio size={16} strokeWidth={2.5} color="#e10600" className="animate-pulse" />, badge: 'LIVE' },
    { href: '/schedule', label: 'Schedule', icon: <Calendar size={16} strokeWidth={2.5} /> },
    { href: '/standings', label: 'Standings', icon: <Trophy size={16} strokeWidth={2.5} /> },
    { href: '/drivers', label: 'Drivers', icon: <Users size={16} strokeWidth={2.5} /> },
    { href: '/history', label: 'History', icon: <BookOpen size={16} strokeWidth={2.5} /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
          <Logo3D />
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {navLinks.map(({ href, label, icon, badge }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`nav-link ${active ? 'nav-link--active active' : ''}`}>
                {icon}
                <span>{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </Link>
            );
          })}
        </div>

        {/* Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>
          {!mounted ? null : status === 'loading' ? null : session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '999px', padding: '6px 14px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#e10600,#c00000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {(session.user?.name ?? session.user?.email ?? 'U')[0].toUpperCase()}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.user?.name ?? session.user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.3)', borderRadius: 'var(--radius)', padding: '7px 14px', fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <LogOut size={14} strokeWidth={2.5} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', borderRadius: 'var(--radius)', padding: '8px 16px', fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', boxShadow: '0 2px 10px rgba(225,6,0,0.25)' }}
            >
              <LogIn size={14} strokeWidth={2.5} />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`hamburger-line`} />
          <span className={`hamburger-line`} />
          <span className={`hamburger-line`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(({ href, label, icon, badge }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`mobile-nav-link ${active ? 'nav-link--active active' : ''}`} onClick={() => setMenuOpen(false)}>
                {icon}
                <span>{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </Link>
            );
          })}
          {session ? (
            <button onClick={() => { signOut({ callbackUrl: '/login' }); setMenuOpen(false); }} className="mobile-nav-link" style={{ border: 'none', background: 'none', textAlign: 'left', color: 'var(--accent)', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={16} strokeWidth={2.5} />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link href="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogIn size={16} strokeWidth={2.5} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
