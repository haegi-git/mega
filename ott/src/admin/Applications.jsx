import { useState } from 'react';
import { Badge, dateTime, Empty, PageHead, Panel, Tabs } from '../console/ui';
import { useApp } from '../context/AppContext';
import { useStudio } from '../context/StudioContext';
import { ARTISTS } from '../data/artists';
import { autoReview, SEED_APPLICATIONS } from './adminData';

export default function Applications() {
  const { allApplications, setApplicationStatus } = useApp();
  const st = useStudio();
  const [tab, setTab] = useState('심사 중');
  const [notes, setNotes] = useState({});

  const apps = [
    ...allApplications.map((a) => ({ ...a, real: true })),
    ...SEED_APPLICATIONS.map((a) => ({ ...a, status: st.appStatus[a.id]?.status || '심사 중', note: st.appStatus[a.id]?.note })),
  ].sort((a, b) => b.submittedAt - a.submittedAt);
  const shown = apps.filter((a) => tab === '전체' || a.status === tab);
  const existing = ARTISTS.map((a) => a.name);

  const decide = (a, status) => {
    const note = notes[a.id] || '';
    if (status === '반려' && !note.trim()) {
      setNotes({ ...notes, [`${a.id}-err`]: '반려 사유를 입력해주세요.' });
      return;
    }
    if (a.real) setApplicationStatus(a.owner, a.id, status, note);
    else st.setAppStatus(a.id, status, note);
  };

  const count = (s) => apps.filter((a) => s === '전체' || a.status === s).length;

  return (
    <>
      <PageHead title="채널 입점 심사" desc="파트너센터로 들어온 아티스트 · 기획사 · 제작사의 채널 신청을 검토해요." />
      <Panel title={<Tabs value={tab} onChange={setTab} items={['심사 중', '승인', '반려', '전체'].map((s) => [s, `${s} ${count(s)}`])} />}>
        {shown.length ? (
          <div className="st-cards">
            {shown.map((a) => {
              const auto = autoReview(a, existing);
              return (
                <article key={a.id} className="st-app">
                  <header>
                    <div>
                      <strong>{a.channel}</strong>
                      <span>{a.type} · 신청 {dateTime(a.submittedAt)}{a.real ? ' · 서비스 회원 신청' : ''}</span>
                    </div>
                    <Badge>{a.status}</Badge>
                  </header>
                  <dl>
                    <dt>담당자</dt><dd>{a.manager} ({a.email})</dd>
                    <dt>콘텐츠</dt><dd>{a.formats.join(', ')}</dd>
                    <dt>소개</dt><dd>{a.intro || '-'}</dd>
                  </dl>
                  <div className={`st-auto ${auto.pass ? 'ok' : 'warn'}`}>
                    <b>자동 검토</b>
                    <ul>
                      {auto.checks.map((c) => <li key={c.text} className={c.ok ? 'ok' : 'warn'}>{c.ok ? '✓' : '!'} {c.text}</li>)}
                    </ul>
                    {auto.rec.length > 0 && <p>권장 채널 설정: {auto.rec.join(' · ')}</p>}
                  </div>
                  {a.status === '심사 중' ? (
                    <footer>
                      <input
                        placeholder="메모 / 반려 사유"
                        value={notes[a.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value, [`${a.id}-err`]: '' })}
                      />
                      <button className="btn btn--xs btn--outline" onClick={() => decide(a, '반려')}>반려</button>
                      <button className="btn btn--xs btn--grad" onClick={() => decide(a, '승인')}>승인 · 채널 생성</button>
                      {notes[`${a.id}-err`] && <p className="st-error">{notes[`${a.id}-err`]}</p>}
                    </footer>
                  ) : (
                    a.note && <p className="st-help">메모: {a.note}</p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <Empty>해당하는 신청이 없어요.</Empty>
        )}
      </Panel>
    </>
  );
}
