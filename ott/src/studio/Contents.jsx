import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, bytes, dateTime, Empty, PageHead, Panel, Tabs, useTick } from '../console/ui';
import { uploadState, useStudio } from '../context/StudioContext';
import { byArtist, CATEGORIES } from '../data/contents';
import { formatCount } from '../data/media';
import { shortsByArtist } from '../data/shorts';

export default function Contents() {
  const st = useStudio();
  const { channel } = st;
  const now = useTick(1000);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');

  const rows = [
    ...st.allUploads
      .filter((u) => u.channelId === channel.id)
      .map((u) => {
        const s = uploadState(u, st.reviews[u.id], now);
        return { id: u.id, kind: u.type === '릴스' ? 'shorts' : 'vod', title: u.title, type: u.type, visibility: u.visibility, status: s.status, note: s.note, views: null, date: u.createdAt, size: u.size, upload: u };
      }),
    ...byArtist(channel.id).map((c) => ({
      id: c.id, kind: 'vod', title: c.title, type: CATEGORIES[c.type], visibility: '공개', status: '게시됨',
      views: Math.round(c.popularity * 4321), date: new Date(`${c.year}-03-01`).getTime(), link: `/content/${c.id}`,
    })),
    ...shortsByArtist(channel.id).map((s) => ({
      id: s.id, kind: 'shorts', title: s.caption, type: '릴스', visibility: '공개', status: '게시됨',
      views: s.likes * 9, date: Date.now() - Number(s.id.slice(1)) * 86400000, link: `/shorts?id=${s.id}`,
    })),
  ]
    .filter((r) => tab === 'all' || r.kind === tab)
    .filter((r) => !q || r.title.includes(q));

  return (
    <>
      <PageHead title="콘텐츠 관리" desc="업로드한 VOD · 숏드라마 · 릴스의 공개 상태와 성과를 관리해요.">
        <Link to="/studio/upload" className="btn btn--sm btn--grad">+ 영상 업로드</Link>
      </PageHead>
      <Panel
        title={<Tabs value={tab} onChange={setTab} items={[['all', '전체'], ['vod', 'VOD · 숏드라마'], ['shorts', '릴스']]} />}
        action={<input className="st-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="제목 검색" />}
      >
        {rows.length ? (
          <div className="st-table-wrap">
            <table className="st-table">
              <thead>
                <tr><th>제목</th><th>유형</th><th>공개 설정</th><th>상태</th><th>조회수</th><th>등록일</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.title}
                      {r.size && <small>{r.upload.fileName} · {bytes(r.size)}</small>}
                      {r.note && <small className="st-error">반려 사유: {r.note}</small>}
                    </td>
                    <td>{r.type}</td>
                    <td>{r.visibility}</td>
                    <td><Badge>{r.status}</Badge></td>
                    <td>{r.views != null ? formatCount(r.views) : '-'}</td>
                    <td>{dateTime(r.date)}</td>
                    <td className="st-table__actions">
                      {r.link && <Link to={r.link} className="btn btn--xs btn--outline">보기</Link>}
                      {r.upload && !r.upload.id.startsWith('seed') && (
                        <button className="btn btn--xs btn--outline" onClick={() => window.confirm('이 영상을 삭제할까요?') && st.removeUpload(r.id)}>삭제</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>콘텐츠가 없어요.</Empty>
        )}
      </Panel>
    </>
  );
}
