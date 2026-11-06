import { useState } from 'react';
import { Empty, PageHead, Panel, Toggle } from '../console/ui';
import { useStudio } from '../context/StudioContext';

function ChipEditor({ items, onChange, placeholder, empty }) {
  const [v, setV] = useState('');
  const add = (e) => {
    e.preventDefault();
    const t = v.trim();
    if (t && !items.includes(t)) onChange([...items, t]);
    setV('');
  };
  return (
    <>
      <form className="st-inline" onSubmit={add}>
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} />
        <button className="btn btn--xs btn--outline">추가</button>
      </form>
      {items.length ? (
        <div className="st-chips">
          {items.map((i) => (
            <span key={i}>{i}<button onClick={() => onChange(items.filter((x) => x !== i))} aria-label={`${i} 삭제`}>×</button></span>
          ))}
        </div>
      ) : <Empty>{empty}</Empty>}
    </>
  );
}

export default function ChatSettings() {
  const st = useStudio();
  const { channel } = st;
  const c = st.getChat(channel.id);
  const up = (patch) => st.updateChat(channel.id, patch);

  return (
    <>
      <PageHead title="채팅 · 팬 관리" desc="라이브 채팅 규칙과 매니저, 차단 사용자를 관리해요. 변경 사항은 바로 적용돼요." />
      <div className="st-grid st-grid--1-1">
        <Panel title="채팅 규칙">
          <div className="st-form">
            <Toggle label="팔로워만 채팅 가능" on={c.followerOnly} onChange={(v) => up({ followerOnly: v })} />
            <Toggle label="링크가 포함된 메시지 숨기기" on={c.blockLinks} onChange={(v) => up({ blockLinks: v })} />
            <label className="st-toggle-row">
              <span>슬로우 모드</span>
              <select value={c.slow} onChange={(e) => up({ slow: Number(e.target.value) })}>
                <option value={0}>끄기</option>
                {[3, 5, 10, 30].map((s) => <option key={s} value={s}>{s}초에 1번</option>)}
              </select>
            </label>
          </div>
        </Panel>
        <Panel title="금칙어">
          <p className="st-help">금칙어가 포함된 채팅은 자동으로 숨겨져요.</p>
          <ChipEditor items={c.bannedWords} onChange={(v) => up({ bannedWords: v })} placeholder="금칙어 입력" empty="등록된 금칙어가 없어요." />
        </Panel>
        <Panel title="채팅 매니저">
          <p className="st-help">매니저는 방송 중 채팅 삭제와 사용자 차단을 할 수 있어요.</p>
          <ChipEditor items={c.managers} onChange={(v) => up({ managers: v })} placeholder="닉네임 입력" empty="매니저가 없어요." />
        </Panel>
        <Panel title="차단한 사용자">
          {c.blocked.length ? (
            <ul className="st-list">
              {c.blocked.map((n) => (
                <li key={n}>
                  <div className="st-list__body"><strong>{n}</strong><span>채팅 차단됨</span></div>
                  <button className="btn btn--xs btn--outline" onClick={() => up({ blocked: c.blocked.filter((x) => x !== n) })}>차단 해제</button>
                </li>
              ))}
            </ul>
          ) : <Empty>차단한 사용자가 없어요. 방송 중 채팅에서 바로 차단할 수 있어요.</Empty>}
        </Panel>
      </div>
    </>
  );
}
