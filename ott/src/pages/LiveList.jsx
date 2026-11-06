import { Link } from 'react-router-dom';
import ArtistAvatar from '../components/ArtistAvatar';
import { LiveCard } from '../components/ContentCard';
import { BellIcon } from '../components/Icons';
import { useApp, useRequireLogin } from '../context/AppContext';
import { getArtist } from '../data/artists';
import { formatDay, formatTime, liveNow, pastLives, upcoming } from '../data/lives';
import { formatCount } from '../data/media';

export default function LiveList() {
  const now = liveNow();
  const next = upcoming();
  const past = pastLives();
  const totalViewers = now.reduce((s, l) => s + l.viewers, 0);

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>라이브</h1>
          <p className="page__desc">
            지금 <b className="text-live">{now.length}개</b> 채널 방송 중 · {formatCount(totalViewers)}명 시청 중
          </p>
        </div>
        <Link to="/schedule" className="btn btn--sm btn--outline">전체 편성표</Link>
      </div>

      <h2 className="section-title"><span className="dot-live" /> 지금 방송 중</h2>
      {now.length ? (
        <div className="grid grid--live">
          {now.map((l) => <LiveCard key={l.id} live={l} />)}
        </div>
      ) : (
        <div className="empty"><p>지금 방송 중인 라이브가 없어요.</p></div>
      )}

      <h2 className="section-title">방송 예정</h2>
      <ScheduleList lives={next.slice(0, 6)} />

      {past.length > 0 && (
        <>
          <h2 className="section-title">지난 라이브 다시보기</h2>
          <div className="grid grid--live">
            {past.map((l) => <LiveCard key={l.id} live={l} />)}
          </div>
        </>
      )}
    </div>
  );
}

// 편성표 형태의 리스트 (편성표 페이지와 공유)
export function ScheduleList({ lives }) {
  const { hasReminder, toggleReminder } = useApp();
  const requireLogin = useRequireLogin();
  if (!lives.length) return <div className="empty"><p>예정된 라이브가 없어요.</p></div>;
  return (
    <ul className="sched">
      {lives.map((l) => {
        const a = getArtist(l.artistId);
        const on = hasReminder(l.id);
        return (
          <li key={l.id} className="sched__item">
            <div className="sched__time">
              <strong>{formatTime(l.startAt)}</strong>
              <span>{formatDay(l.startAt)}</span>
            </div>
            <ArtistAvatar artist={a} size={48} />
            <Link to={`/live/${l.id}`} className="sched__body">
              <span className="sched__cat">{l.category}{l.membersOnly && ' · 멤버십 전용'}</span>
              <strong>{l.title}</strong>
              <span className="sched__artist">{a.name} · {l.duration}분 예정</span>
            </Link>
            <button
              className={`btn btn--sm ${on ? 'btn--outline' : 'btn--ghost'}`}
              onClick={() => requireLogin(() => toggleReminder(l.id))}
            >
              <BellIcon width={16} height={16} filled={on} /> {on ? '알림 설정됨' : '알림 받기'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
