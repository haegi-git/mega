import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, LineChart, num, PageHead, Panel, StatCard, Toggle } from '../console/ui';
import { useApp } from '../context/AppContext';
import { uploadState, useStudio } from '../context/StudioContext';
import { getArtist } from '../data/artists';
import { liveNow } from '../data/lives';
import { formatCount } from '../data/media';
import { REPORTS, SEED_APPLICATIONS } from './adminData';

const BASE = 120_000;           // 평시 동시 접속자 (가정)
const PER_POD = 6_000;          // API 파드 1개가 감당하는 동시 접속 (가정)
const MBPS_PER_USER = 3.2;      // 시청자 1명당 평균 송출량 (가정)
const label = (t) => new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

export default function AdminDashboard() {
  const { allApplications } = useApp();
  const st = useStudio();
  const [spike, setSpike] = useState(false);
  const [points, setPoints] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({ label: label(Date.now() - (30 - i) * 2000), value: BASE * (0.95 + Math.random() * 0.1) }))
  );
  const [pods, setPods] = useState(Math.ceil(BASE / PER_POD));
  const [events, setEvents] = useState([]);
  const podsRef = useRef(pods);

  // 2초마다 동시 접속자 갱신. 급증 모드면 평시 대비 최대 50배까지 상승
  useEffect(() => {
    const t = setInterval(() => {
      setPoints((p) => {
        const last = p[p.length - 1].value;
        const target = spike ? BASE * 50 : BASE;
        const next = last + (target - last) * (spike ? 0.18 : 0.25) + (Math.random() - 0.5) * BASE * 0.06;
        return [...p.slice(1), { label: label(Date.now()), value: Math.max(BASE * 0.8, next) }];
      });
    }, 2000);
    return () => clearInterval(t);
  }, [spike]);

  const users = points[points.length - 1].value;

  // 오토스케일링: 필요한 파드 수에 맞춰 단계적으로 확장/축소
  useEffect(() => {
    const need = Math.ceil(users / PER_POD);
    const cur = podsRef.current;
    if (need !== cur) {
      const next = need > cur ? Math.min(need, cur + Math.max(2, Math.ceil(cur * 0.5))) : Math.max(need, cur - 2);
      podsRef.current = next;
      setPods(next);
      setEvents((e) => [{ id: Date.now(), at: label(Date.now()), text: `API 파드 ${cur} → ${next}개 (${next > cur ? '확장' : '축소'})`, up: next > cur }, ...e].slice(0, 8));
    }
  }, [users]);

  const lives = liveNow();
  const studioLives = Object.keys(st.onAir).length;
  const pendingApps = allApplications.filter((a) => a.status === '심사 중').length + SEED_APPLICATIONS.filter((a) => !st.appStatus[a.id]).length;
  const pendingReview = st.allUploads.filter((u) => uploadState(u, st.reviews[u.id]).status === '검수 대기').length;
  const pendingReports = REPORTS.filter((r) => !st.reportStatus[r.id]).length;
  const ratio = users / BASE;

  return (
    <>
      <PageHead title="운영 대시보드" desc="플랫폼 전체 트래픽 · 라이브 · 처리 대기 업무를 한눈에 봐요.">
        <Toggle label="트래픽 급증 시뮬레이션 (평시 × 50)" on={spike} onChange={setSpike} />
      </PageHead>

      <div className="st-stats">
        <StatCard label="동시 접속자" value={formatCount(Math.round(users))} sub={`평시 대비 ×${ratio.toFixed(1)}`} tone={ratio > 10 ? 'warn' : undefined} />
        <StatCard label="방송 중 채널" value={num(lives.length + studioLives)} sub={`스튜디오 송출 ${studioLives}개 포함`} />
        <StatCard label="CDN 송출량" value={`${((users * MBPS_PER_USER) / 1000).toFixed(0)} Gbps`} sub={`캐시 적중률 ${(97.8 - Math.min(3, ratio * 0.05)).toFixed(1)}%`} />
        <StatCard label="API 파드" value={`${pods}개`} sub={`필요 ${Math.ceil(users / PER_POD)}개 · 오토스케일링`} tone={pods < Math.ceil(users / PER_POD) ? 'warn' : 'ok'} />
        <StatCard label="에러율 (5xx)" value={`${(0.02 + (pods < Math.ceil(users / PER_POD) ? 0.4 : 0)).toFixed(2)}%`} tone={pods < Math.ceil(users / PER_POD) ? 'bad' : 'ok'} />
      </div>

      <div className="st-grid st-grid--2-1">
        <Panel title="실시간 동시 접속자" action={<Badge>{spike ? '급증 대응 중' : '정상'}</Badge>}>
          <LineChart data={points} format={(v) => formatCount(Math.round(v))} />
        </Panel>
        <Panel title="스케일링 이벤트">
          {events.length ? (
            <ul className="st-log">
              {events.map((e) => (
                <li key={e.id} className={e.up ? 'up' : 'down'}><span>{e.at}</span>{e.text}</li>
              ))}
            </ul>
          ) : (
            <p className="st-help">트래픽에 맞춰 파드가 늘고 줄면 여기에 기록돼요. 위의 급증 시뮬레이션을 켜보세요.</p>
          )}
        </Panel>
      </div>

      <div className="st-grid st-grid--1-1">
        <Panel title="처리 대기 업무">
          <ul className="st-todo">
            <li><Link to="/admin/applications"><span>채널 입점 심사</span><b>{pendingApps}건</b></Link></li>
            <li><Link to="/admin/contents"><span>콘텐츠 검수</span><b>{pendingReview}건</b></Link></li>
            <li><Link to="/admin/reports"><span>신고 처리</span><b>{pendingReports}건</b></Link></li>
          </ul>
        </Panel>
        <Panel title="시청자 많은 라이브" action={<Link to="/admin/lives" className="st-link">모니터링 ›</Link>}>
          <table className="st-table">
            <thead><tr><th>채널</th><th>방송</th><th>시청자</th></tr></thead>
            <tbody>
              {lives.map((l) => (
                <tr key={l.id}><td>{getArtist(l.artistId).name}</td><td>{l.title}</td><td>{num(l.viewers * (spike ? ratio / 3 : 1))}</td></tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
