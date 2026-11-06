import { Link } from 'react-router-dom';
import { Badge, clock, dateTime, dayLabel, Empty, LineChart, num, PageHead, Panel, seeded, StatCard, useTick, won } from '../console/ui';
import { uploadState, useStudio } from '../context/StudioContext';
import { byArtist } from '../data/contents';
import { formatDay, formatTime, livesByArtist, statusOf } from '../data/lives';
import { formatCount } from '../data/media';

export default function StudioDashboard() {
  const st = useStudio();
  const { channel } = st;
  const now = useTick(1000);
  const live = st.onAir[channel.id];
  const r = seeded(channel.id);

  const viewers = Array.from({ length: 14 }, (_, i) => ({
    label: dayLabel(i - 13),
    value: Math.round(channel.followers * 0.03 * (0.55 + r() * 0.7) * (1 + i / 30)),
  }));
  const week = viewers.slice(-7).reduce((s, d) => s + d.value, 0);
  const prevWeek = viewers.slice(0, 7).reduce((s, d) => s + d.value, 0);
  const members = Math.round(channel.followers * 0.012);

  const uploads = st.allUploads.filter((u) => u.channelId === channel.id);
  const vods = byArtist(channel.id);
  const nextLives = [
    ...livesByArtist(channel.id).filter((l) => statusOf(l) === 'scheduled'),
    ...st.schedules.filter((s) => s.channelId === channel.id && s.startAt > now),
  ].sort((a, b) => a.startAt - b.startAt);
  const sessions = st.sessions.filter((s) => s.channelId === channel.id);

  return (
    <>
      <PageHead title={`${channel.name} 스튜디오`} desc={`${channel.kind} · ${channel.agency}`}>
        <Link to="/studio/upload" className="btn btn--sm btn--outline">영상 업로드</Link>
        <Link to="/studio/broadcast" className={`btn btn--sm ${live ? 'btn--live' : 'btn--grad'}`}>
          {live ? '방송 중 · 관리하기' : '방송 시작하기'}
        </Link>
      </PageHead>

      {live && (
        <Link to="/studio/broadcast" className="st-livebar">
          <span className="badge-live">LIVE</span>
          <strong>{live.title}</strong>
          <span>방송 시간 {clock(now - live.startedAt)}</span>
        </Link>
      )}

      <div className="st-stats">
        <StatCard label="팔로워" value={formatCount(channel.followers)} diff={2.4} sub="지난 30일 대비" />
        <StatCard label="최근 7일 시청자" value={num(week)} diff={((week - prevWeek) / prevWeek) * 100} sub="지난주 대비" />
        <StatCard label="멤버십 구독자" value={num(members)} diff={4.1} sub="팬 패스 · MEGA PASS" />
        <StatCard label="이번 달 예상 수익" value={won(members * 4900 * 0.7 + week * 3)} sub="정산 예정 · 수수료 차감 후" />
      </div>

      <div className="st-grid st-grid--2-1">
        <Panel title="일별 시청자 수" action={<Link to="/studio/analytics" className="st-link">자세히 ›</Link>}>
          <LineChart data={viewers} />
        </Panel>
        <Panel title="다가오는 라이브" action={<Link to="/studio/schedule" className="st-link">예약하기 ›</Link>}>
          {nextLives.length ? (
            <ul className="st-list">
              {nextLives.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <div className="st-list__time"><b>{formatTime(l.startAt)}</b><span>{formatDay(l.startAt)}</span></div>
                  <div className="st-list__body"><strong>{l.title}</strong><span>{l.category} · {l.duration}분</span></div>
                </li>
              ))}
            </ul>
          ) : <Empty>예약된 라이브가 없어요.</Empty>}
        </Panel>
      </div>

      <div className="st-grid st-grid--2">
        <Panel title="최근 콘텐츠" action={<Link to="/studio/contents" className="st-link">전체 ›</Link>}>
          <table className="st-table">
            <thead><tr><th>제목</th><th>상태</th><th>조회수</th></tr></thead>
            <tbody>
              {uploads.slice(0, 3).map((u) => (
                <tr key={u.id}><td>{u.title}</td><td><Badge>{uploadState(u, st.reviews[u.id], now).status}</Badge></td><td>-</td></tr>
              ))}
              {vods.slice(0, 5 - Math.min(3, uploads.length)).map((c) => (
                <tr key={c.id}><td>{c.title}</td><td><Badge>게시됨</Badge></td><td>{formatCount(Math.round(c.popularity * 4321))}</td></tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="최근 방송 기록">
          {sessions.length ? (
            <table className="st-table">
              <thead><tr><th>방송</th><th>길이</th><th>최고 동접</th><th>채팅</th></tr></thead>
              <tbody>
                {sessions.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td>{s.title}<small>{dateTime(s.startedAt)}</small></td>
                    <td>{clock(s.endedAt - s.startedAt)}</td>
                    <td>{num(s.peak)}</td>
                    <td>{num(s.chats)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Empty>아직 스튜디오에서 진행한 방송이 없어요.<br /><Link to="/studio/broadcast" className="st-link">첫 방송 시작하기 ›</Link></Empty>}
        </Panel>
      </div>
    </>
  );
}
