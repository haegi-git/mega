import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { liveNow } from '../data/lives';
import { SearchIcon, UserIcon } from './Icons';

const NAV = [
  { to: '/', label: '홈', end: true },
  { to: '/browse/drama', label: '숏드라마', match: '/browse' },
  { to: '/shorts', label: '릴스' },
  { to: '/live', label: '라이브', live: true },
  { to: '/artists', label: '아티스트' },
  { to: '/schedule', label: '편성표' },
];

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="MEGAVIEW 홈">
      <span className="logo__mark">M</span>
      <span>MEGA<b>VIEW</b></span>
    </Link>
  );
}

export default function Header() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const liveCount = liveNow().length;

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className={`header ${solid ? 'header--solid' : ''}`}>
      <div className="header__left">
        <Logo />
        <nav className="header__nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                isActive || (n.match && pathname.startsWith(n.match)) ? 'active' : ''
              }
            >
              {n.label}
              {n.live && liveCount > 0 && <span className="nav-live">{liveCount}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="header__right">
        <Link to="/partner" className="header__partner">파트너센터</Link>
        <button className="icon-btn" onClick={() => navigate('/search')} aria-label="검색">
          <SearchIcon />
        </button>
        {user ? (
          <div className="profile-menu" ref={menuRef}>
            <button className="avatar" onClick={() => setMenuOpen((v) => !v)} aria-label="내 메뉴">
              {user.name?.[0] || <UserIcon />}
            </button>
            {menuOpen && (
              <div className="profile-menu__dropdown" onClick={() => setMenuOpen(false)}>
                <div className="profile-menu__head">
                  <strong>{user.name}</strong>
                  <span>{user.plan ? `${user.plan} 이용 중` : '무료 회원'}</span>
                </div>
                <Link to="/mypage">마이페이지</Link>
                <Link to="/mylist">팔로우 · 찜 · 시청기록</Link>
                <Link to="/subscribe">멤버십</Link>
                <Link to="/partner">채널 입점 신청</Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn--sm btn--grad">
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
