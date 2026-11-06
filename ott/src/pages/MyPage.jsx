import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MyPage() {
  const { user, logout, follows, myList, historyList, reminders, applications } = useApp();
  const navigate = useNavigate();

  const cards = [
    ['멤버십', user.plan || '무료 회원', '/subscribe', user.plan ? '변경하기' : '멤버십 시작'],
    ['팔로우 아티스트', `${follows.length}팀`, '/mylist', '보러가기'],
    ['찜한 작품', `${myList.length}개`, '/mylist', '보러가기'],
    ['시청 기록', `${historyList.length}개`, '/mylist', '보러가기'],
    ['라이브 알림', `${reminders.length}개`, '/schedule', '편성표'],
    ['입점 신청', `${applications.length}건`, '/partner', '파트너센터'],
  ];

  return (
    <div className="page mypage">
      <div className="page__head"><h1>마이페이지</h1></div>

      <section className="mypage__profile">
        <div className="avatar avatar--lg">{user.name[0]}</div>
        <div>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <span>가입일 {new Date(user.joinedAt).toLocaleDateString('ko-KR')}</span>
        </div>
      </section>

      <section className="mypage__cards">
        {cards.map(([label, value, to, cta]) => (
          <div key={label} className="mypage__card">
            <span>{label}</span>
            <strong>{value}</strong>
            <Link to={to}>{cta} ›</Link>
          </div>
        ))}
      </section>

      <section className="mypage__menu">
        <a href="#" onClick={(e) => e.preventDefault()}>프로필 관리</a>
        <a href="#" onClick={(e) => e.preventDefault()}>결제 내역</a>
        <a href="#" onClick={(e) => e.preventDefault()}>알림 설정</a>
        <a href="#" onClick={(e) => e.preventDefault()}>고객센터</a>
        <button onClick={() => { logout(); navigate('/'); }}>로그아웃</button>
      </section>
    </div>
  );
}
