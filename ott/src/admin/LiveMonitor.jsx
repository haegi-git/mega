import { Link } from 'react-router-dom';
import { Badge, clock, num, PageHead, Panel, seeded, StatCard, useTick } from '../console/ui';
import { useStudio } from '../context/StudioContext';
import { getArtist } from '../data/artists';
import { liveNow } from '../data/lives';

export default function LiveMonitor() {
  const st = useStudio();
  const now = useTick(2000);

  const rows = [
    ...liveNow().map((l) => ({ id: l.id, artist: getArtist(l.artistId), title: l.title, startedAt: l.startAt, viewers: l.viewers, thumb: l.thumb, link: `/live/${l.id}`, src: '플랫폼 편성' })),
    ...Object.entries(st.onAir).map(([id, o]) => ({ id: `studio-${id}`, artist: getArtist(id), title: o.title, startedAt: o.startedAt, viewers: Math.round(getArtist(id).followers * 0.05 * (1 - Math.exp(-(now - o.startedAt) / 60000))), thumb: getArtist(id).banner, src: o.mode === 'web' ? '스튜디오 · 브라우저' : '스튜디오 · OBS' })),
  ].map((r) => {
    const rnd = seeded(r.id + Math.floor(now / 4000));
    const bitrate = Math.round(4200 + rnd() * 2000);
    const buffer = +(rnd() * (r.id === 'l3' ? 3.2 : 0.9)).toFixed(2);
    const health = buffer > 2 ? '위험' : buffer > 0.7 ? '주의' : '양호';
    return { ...r, bitrate, buffer, health, fps: rnd() > 0.85 ? 30 : 60, action: st.liveActions[r.id] };
  });

  const total = rows.filter((r) => r.action !== '강제 종료').reduce((s, r) => s + r.viewers, 0);

  return (
    <>
      <PageHead title="라이브 모니터링" desc="방송 중인 모든 채널의 송출 상태와 시청 품질을 확인하고 조치해요." />
      <div className="st-stats">
        <StatCard label="방송 중" value={`${rows.filter((r) => r.action !== '강제 종료').length}개`} />
        <StatCard label="총 시청자" value={num(total)} />
        <StatCard label="품질 주의" value={`${rows.filter((r) => r.health !== '양호').length}개`} tone={rows.some((r) => r.health === '위험') ? 'bad' : 'warn'} />
        <StatCard label="평균 비트레이트" value={`${num(rows.reduce((s, r) => s + r.bitrate, 0) / Math.max(1, rows.length))} kbps`} />
      </div>
      <Panel title="방송 목록">
        <div className="st-table-wrap">
          <table className="st-table">
            <thead><tr><th>방송</th><th>송출</th><th>시청자</th><th>방송 시간</th><th>비트레이트</th><th>버퍼링</th><th>상태</th><th>조치</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.action === '강제 종료' ? 'is-dim' : ''}>
                  <td>
                    <div className="st-cell-media">
                      <img src={r.thumb} alt="" />
                      <div>{r.title}<small>{r.artist.name}</small></div>
                    </div>
                  </td>
                  <td>{r.src}</td>
                  <td>{num(r.viewers)}</td>
                  <td>{clock(now - r.startedAt)}</td>
                  <td>{num(r.bitrate)} kbps · {r.fps}fps</td>
                  <td>{r.buffer}%</td>
                  <td><Badge>{r.action === '강제 종료' ? '강제 종료' : r.health}</Badge>{r.action === '경고' && <Badge>경고</Badge>}</td>
                  <td className="st-table__actions">
                    {r.link && <Link to={r.link} className="btn btn--xs btn--outline">보기</Link>}
                    {r.action !== '강제 종료' && (
                      <>
                        <button className="btn btn--xs btn--outline" onClick={() => st.setLiveAction(r.id, '경고')}>경고</button>
                        <button
                          className="btn btn--xs btn--live"
                          onClick={() => window.confirm(`'${r.title}' 방송을 강제 종료할까요?`) && st.setLiveAction(r.id, '강제 종료')}
                        >
                          강제 종료
                        </button>
                      </>
                    )}
                    {r.action && <button className="btn btn--xs btn--outline" onClick={() => st.setLiveAction(r.id, undefined)}>되돌리기</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="st-help">버퍼링 비율이 2%를 넘으면 ‘위험’으로 표시돼요. (데모 수치)</p>
      </Panel>
    </>
  );
}
