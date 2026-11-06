// 스튜디오 · 관리자 콘솔 공용 UI
import { useEffect, useId, useState } from 'react';

// 같은 시드면 항상 같은 값이 나오는 난수 (채널별 통계를 안정적으로 보여주기 위함)
export const seeded = (seed) => {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296;
  };
};

export const won = (n) => `₩${Math.round(n).toLocaleString('ko-KR')}`;
export const num = (n) => Math.round(n).toLocaleString('ko-KR');
export const bytes = (n) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`;
export const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  return `${h ? `${h}:` : ''}${String(Math.floor((s % 3600) / 60)).padStart(h ? 2 : 1, '0')}:${String(s % 60).padStart(2, '0')}`;
};
export const dateTime = (t) =>
  new Date(t).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
export const dayLabel = (offset) => {
  const d = new Date(Date.now() + offset * 86400000);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export function useTick(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function PageHead({ title, desc, children }) {
  return (
    <div className="st-head">
      <div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {children && <div className="st-head__actions">{children}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`st-panel ${className}`}>
      {(title || action) && (
        <div className="st-panel__head">
          <h3>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, diff, sub, tone }) {
  return (
    <div className={`st-stat ${tone ? `st-stat--${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {diff != null && (
        <em className={diff >= 0 ? 'up' : 'down'}>
          {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}%
        </em>
      )}
      {sub && <small>{sub}</small>}
    </div>
  );
}

const OK = ['게시됨', '승인', '정상', '처리 완료', '양호', '성공', '정산 완료', '활성', '기각'];
const WARN = ['심사 중', '검수 대기', '업로드 중', '트랜스코딩 중', '대기', '주의', '경고', '정산 예정', '진행 중', '콘텐츠 숨김'];
const BAD = ['반려', '정지', '강제 종료', '장애', '위험', '실패'];
export function Badge({ children }) {
  const tone = OK.includes(children) ? 'ok' : WARN.includes(children) ? 'warn' : BAD.includes(children) ? 'bad' : 'neutral';
  return <span className={`st-badge st-badge--${tone}`}>{children}</span>;
}

export function Toggle({ on, onChange, label }) {
  return (
    <label className="st-toggle-row">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={on} className={`st-toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />
    </label>
  );
}

export function Tabs({ value, onChange, items }) {
  return (
    <div className="st-tabs">
      {items.map(([k, label]) => (
        <button key={k} className={value === k ? 'is-active' : ''} onClick={() => onChange(k)}>{label}</button>
      ))}
    </div>
  );
}

// 간단한 SVG 선 그래프 (마우스를 올리면 값 표시)
export function LineChart({ data, height = 220, format = num, color = '#d946ef', compare }) {
  const gid = useId().replace(/:/g, '');
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = height;
  const P = { l: 52, r: 14, t: 16, b: 28 };
  const all = data.map((d) => d.value).concat(compare ? compare.map((d) => d.value) : []);
  const max = Math.max(1, ...all) * 1.12;
  const x = (i) => P.l + (i / Math.max(1, data.length - 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
  const line = (arr) => arr.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line(data)} L${x(data.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const step = Math.ceil(data.length / 8);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - P.l) / (W - P.l - P.r)) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };

  return (
    <div className="st-chart">
      <svg viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img">
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y((max / 1.12) * t)} y2={y((max / 1.12) * t)} className="st-chart__grid" />
            <text x={P.l - 8} y={y((max / 1.12) * t) + 4} textAnchor="end" className="st-chart__label">{format((max / 1.12) * t)}</text>
          </g>
        ))}
        {data.map((d, i) => i % step === 0 && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="st-chart__label">{d.label}</text>
        ))}
        {compare && <path d={line(compare)} fill="none" stroke="#6f6d85" strokeWidth="2" strokeDasharray="5 5" />}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line(data)} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="#fff" strokeOpacity=".25" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill={color} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="st-chart__tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{format(data[hover].value)}</b> {data[hover].label}
        </div>
      )}
    </div>
  );
}

export function BarList({ items, format = (v) => `${v}%` }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="st-bars">
      {items.map((i) => (
        <li key={i.label}>
          <div className="st-bars__top">
            <span>{i.label}</span>
            <b>{format(i.value)}</b>
          </div>
          <div className="st-bars__track">
            <div style={{ width: `${(i.value / max) * 100}%`, background: i.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Empty({ children }) {
  return <div className="st-empty">{children}</div>;
}
