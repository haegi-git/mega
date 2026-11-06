import { useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { useApp } from '../context/AppContext';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function RequireAuth({ children }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__links">
        <a href="#">고객센터</a>
        <a href="#">이용약관</a>
        <a href="#"><strong>개인정보처리방침</strong></a>
        <a href="#">청소년보호정책</a>
        <Link to="/partner">파트너 입점 안내</Link>
        <Link to="/subscribe">멤버십</Link>
      </div>
      <p>(주)메가뷰 · 서울특별시 어딘가로 123 · 사업자등록번호 000-00-00000 · 고객센터 1234-5678</p>
      <p>등장하는 아티스트·기획사·작품은 모두 가상이며, 이 사이트는 팀 프로젝트용 데모입니다.</p>
      <p className="footer__copy">© 2026 MEGAVIEW. All rights reserved.</p>
    </footer>
  );
}

// 릴스·라이브 시청 화면은 화면을 꽉 채우므로 푸터를 숨김
const NO_FOOTER = [/^\/shorts/, /^\/live\/.+/];

export default function Layout() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER.some((r) => r.test(pathname));
  return (
    <>
      <Header />
      <main className="main">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </>
  );
}
