import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDay, LIVES, statusOf } from '../data/lives';
import { ScheduleList } from './LiveList';

const DAY = 24 * 60 * 60 * 1000;

export default function Schedule() {
  const { follows } = useApp();
  const [dayIdx, setDayIdx] = useState(0);
  const [onlyFollow, setOnlyFollow] = useState(false);

  const days = useMemo(() => {
    const start = new Date(new Date().toDateString()).getTime();
    return Array.from({ length: 7 }, (_, i) => start + i * DAY);
  }, []);

  const dayStart = days[dayIdx];
  const list = LIVES.filter(
    (l) =>
      l.startAt >= dayStart &&
      l.startAt < dayStart + DAY &&
      statusOf(l) !== 'ended' &&
      (!onlyFollow || follows.includes(l.artistId))
  ).sort((a, b) => a.startAt - b.startAt);

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>라이브 편성표</h1>
          <p className="page__desc">알림을 설정하면 방송 시작 전에 알려드려요.</p>
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={onlyFollow} onChange={(e) => setOnlyFollow(e.target.checked)} />
          팔로우한 아티스트만
        </label>
      </div>
      <div className="day-tabs">
        {days.map((d, i) => {
          const count = LIVES.filter((l) => l.startAt >= d && l.startAt < d + DAY && statusOf(l) !== 'ended').length;
          return (
            <button key={d} className={dayIdx === i ? 'is-active' : ''} onClick={() => setDayIdx(i)}>
              <strong>{formatDay(d)}</strong>
              <span>{count ? `${count}개 방송` : '-'}</span>
            </button>
          );
        })}
      </div>
      <ScheduleList lives={list} />
    </div>
  );
}
