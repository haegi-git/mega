import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './console.css';

/**
 * 스튜디오 · 관리자 공용 레이아웃 (왼쪽 사이드바 + 본문)
 * nav: [{ title, items: [{ to, label, icon, end, badge }] }]
 */
export default function ConsoleLayout({ kind, nav, top, banner }) {
  const { user } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className={`st st--${kind}`}>
      <aside className={`st-side ${open ? 'is-open' : ''}`}>
        <div className="st-side__brand">
          <Link to={kind === 'studio' ? '/studio' : '/admin'} className="st-logo">
            <span className="logo__mark">M</span>
            <span>MEGAVIEW <b>{kind === 'studio' ? 'Studio' : 'Admin'}</b></span>
          </Link>
          <button className="st-side__menu" onClick={() => setOpen((v) => !v)} aria-label="메뉴">☰</button>
        </div>
        {top}
        <nav className="st-nav" onClick={() => setOpen(false)}>
          {nav.map((g) => (
            <div key={g.title} className="st-nav__group">
              <p>{g.title}</p>
              {g.items.map((i) => (
                <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
                  {i.icon}
                  <span>{i.label}</span>
                  {i.badge}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="st-side__foot">
          <div className="st-user">
            <span className="avatar">{user?.name?.[0]}</span>
            <div>
              <strong>{user?.name}</strong>
              <span>{kind === 'studio' ? '채널 관리자' : '플랫폼 운영자 (데모)'}</span>
            </div>
          </div>
          <div className="st-side__links">
            <Link to={kind === 'studio' ? '/admin' : '/studio'}>{kind === 'studio' ? '관리자 콘솔' : '크리에이터 스튜디오'}</Link>
            <Link to="/">서비스로 돌아가기 ↗</Link>
          </div>
        </div>
      </aside>
      <main className="st-main" key={pathname}>
        {banner}
        <Outlet />
      </main>
    </div>
  );
}
