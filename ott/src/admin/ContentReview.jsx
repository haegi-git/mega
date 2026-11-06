import { useState } from 'react';
import { Badge, bytes, dateTime, Empty, PageHead, Panel, Tabs, useTick } from '../console/ui';
import { uploadState, useStudio } from '../context/StudioContext';
import { getArtist } from '../data/artists';

const REASONS = ['저작권 확인 필요', '관람 등급 부적절', '영상 품질 불량', '메타데이터 오류'];

export default function ContentReview() {
  const st = useStudio();
  const now = useTick(1000);
  const [tab, setTab] = useState('대기');
  const [reason, setReason] = useState({});

  const items = st.allUploads.map((u) => ({ ...u, state: uploadState(u, st.reviews[u.id], now) }));
  const pending = items.filter((i) => i.state.status === '검수 대기');
  const processing = items.filter((i) => ['업로드 중', '트랜스코딩 중'].includes(i.state.status));
  const done = items.filter((i) => ['게시됨', '반려'].includes(i.state.status));
  const shown = tab === '대기' ? pending : tab === '처리 중' ? processing : done;

  return (
    <>
      <PageHead title="콘텐츠 검수" desc="크리에이터 스튜디오에서 업로드된 영상을 게시 전에 확인해요." />
      <Panel title={<Tabs value={tab} onChange={setTab} items={[['대기', `검수 대기 ${pending.length}`], ['처리 중', `변환 중 ${processing.length}`], ['완료', `처리 완료 ${done.length}`]]} />}>
        {shown.length ? (
          <div className="st-table-wrap">
            <table className="st-table">
              <thead><tr><th>영상</th><th>채널</th><th>유형</th><th>공개 · 등급</th><th>업로드</th><th>상태</th><th>검수</th></tr></thead>
              <tbody>
                {shown.map((u) => (
                  <tr key={u.id}>
                    <td>{u.title}<small>{u.fileName} · {bytes(u.size)}</small>{u.desc && <small>{u.desc}</small>}</td>
                    <td>{getArtist(u.channelId)?.name}</td>
                    <td>{u.type}</td>
                    <td>{u.visibility} · {u.age === 'ALL' ? '전체' : `${u.age}세`}</td>
                    <td>{dateTime(u.createdAt)}</td>
                    <td><Badge>{u.state.status}</Badge>{u.state.note && <small>{u.state.note}</small>}</td>
                    <td className="st-table__actions">
                      {u.state.status === '검수 대기' ? (
                        <>
                          <select value={reason[u.id] || ''} onChange={(e) => setReason({ ...reason, [u.id]: e.target.value })} aria-label="반려 사유">
                            <option value="">반려 사유 선택</option>
                            {REASONS.map((r) => <option key={r}>{r}</option>)}
                          </select>
                          <button className="btn btn--xs btn--outline" disabled={!reason[u.id]} onClick={() => st.setReview(u.id, '반려', reason[u.id])}>반려</button>
                          <button className="btn btn--xs btn--grad" onClick={() => st.setReview(u.id, '게시됨')}>승인 · 게시</button>
                        </>
                      ) : u.state.status === '게시됨' || u.state.status === '반려' ? (
                        <button className="btn btn--xs btn--outline" onClick={() => st.clearReview(u.id)}>다시 검수</button>
                      ) : (
                        <span className="st-help">변환 완료 후 검수 가능</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>{tab === '대기' ? '검수할 영상이 없어요. 크리에이터 스튜디오에서 영상을 올리면 여기에 표시돼요.' : '항목이 없어요.'}</Empty>
        )}
      </Panel>
    </>
  );
}
