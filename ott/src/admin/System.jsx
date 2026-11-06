import { Badge, dateTime, num, PageHead, Panel, seeded, StatCard, useTick } from '../console/ui';
import { DEPLOYS, SERVICES } from './adminData';

export default function System() {
  const now = useTick(3000);
  const r = seeded(Math.floor(now / 3000));

  const services = SERVICES.map((s) => {
    const err = +(r() * 0.15).toFixed(2);
    const latency = s.base ? Math.round(s.base * (0.85 + r() * 0.4)) : 0;
    const queue = s.queue ? Math.round(r() * 6) : null;
    const status = err > 0.12 ? '주의' : '정상';
    return { ...s, err, latency, queue, status };
  });

  return (
    <>
      <PageHead title="시스템 · 배포" desc="서비스별 상태와 최근 배포 파이프라인을 확인해요. (데모 수치)" />
      <div className="st-stats">
        <StatCard label="가용성 (30일)" value="99.97%" tone="ok" />
        <StatCard label="정상 서비스" value={`${services.filter((s) => s.status === '정상').length} / ${services.length}`} />
        <StatCard label="영상 변환 대기열" value={`${services.find((s) => s.queue != null).queue}건`} />
        <StatCard label="이번 주 배포" value={`${DEPLOYS.length}회`} sub={`실패 ${DEPLOYS.filter((d) => d.result === '실패').length}회`} />
      </div>

      <Panel title="서비스 상태">
        <div className="st-table-wrap">
          <table className="st-table">
            <thead><tr><th>서비스</th><th>구성</th><th>응답 시간 (p95)</th><th>에러율</th><th>인스턴스</th><th>상태</th></tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td>{s.kind}</td>
                  <td>{s.queue != null ? `대기 ${s.queue}건` : `${num(s.latency)} ${s.unit || 'ms'}`}</td>
                  <td>{s.err}%</td>
                  <td>{s.inst ? `${s.inst}개 · Multi-AZ` : '관리형'}</td>
                  <td><Badge>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="최근 배포 (CI/CD)">
        <ul className="st-deploys">
          {DEPLOYS.map((d) => (
            <li key={d.id}>
              <div className="st-deploys__head">
                <strong>{d.id} · {d.svc}</strong>
                <span>{d.ver} · {dateTime(d.at)}</span>
                <Badge>{d.result}</Badge>
              </div>
              <ol className="st-pipeline">
                {d.stages.map((s, i) => (
                  <li key={s} className={d.result === '실패' && i === d.stages.length - 1 ? 'fail' : 'ok'}>{s}</li>
                ))}
              </ol>
              {d.note && <p className="st-error">{d.note}</p>}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
