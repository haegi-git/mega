import { useState } from 'react';
import { Badge, dateTime, Empty, PageHead, Panel, Tabs } from '../console/ui';
import { useStudio } from '../context/StudioContext';
import { REPORTS } from './adminData';

const ACTIONS = ['경고', '콘텐츠 숨김', '정지', '기각'];

export default function Reports() {
  const st = useStudio();
  const [tab, setTab] = useState('대기');
  const list = REPORTS.map((r) => ({ ...r, result: st.reportStatus[r.id]?.status }));
  const shown = list.filter((r) => (tab === '대기' ? !r.result : !!r.result));

  const act = (r, action) => {
    st.setReportStatus(r.id, action);
    // 계정 정지는 회원 관리에도 반영
    if (action === '정지') st.setUserStatus(`report:${r.target}`, '정지');
  };

  return (
    <>
      <PageHead title="신고 관리" desc="채팅 · 영상 · 계정 신고를 확인하고 조치해요." />
      <Panel title={<Tabs value={tab} onChange={setTab} items={[['대기', `처리 대기 ${list.filter((r) => !r.result).length}`], ['완료', `처리 완료 ${list.filter((r) => r.result).length}`]]} />}>
        {shown.length ? (
          <ul className="st-reports">
            {shown.map((r) => (
              <li key={r.id}>
                <div className="st-reports__head">
                  <Badge>{r.type}</Badge>
                  <strong>{r.target}</strong>
                  <span>{r.where}</span>
                  <time>{dateTime(r.at)}</time>
                </div>
                <p>“{r.detail}” <em>— 신고자 {r.reporter}</em></p>
                {r.result ? (
                  <div className="st-row">
                    <span>조치 결과</span> <Badge>{r.result}</Badge>
                    <button className="btn btn--xs btn--outline" onClick={() => st.setReportStatus(r.id, undefined)}>되돌리기</button>
                  </div>
                ) : (
                  <div className="st-row">
                    {ACTIONS.map((a) => (
                      <button key={a} className={`btn btn--xs ${a === '정지' ? 'btn--live' : 'btn--outline'}`} onClick={() => act(r, a)}>{a}</button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>{tab === '대기' ? '처리할 신고가 없어요. 👍' : '처리한 신고가 없어요.'}</Empty>
        )}
      </Panel>
    </>
  );
}
