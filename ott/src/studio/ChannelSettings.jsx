import { useState } from 'react';
import { Link } from 'react-router-dom';
import ArtistAvatar from '../components/ArtistAvatar';
import { PageHead, Panel, Toggle } from '../console/ui';
import { useStudio } from '../context/StudioContext';

export default function ChannelSettings() {
  const { channel } = useStudio();
  return <SettingsForm key={channel.id} />;
}

function SettingsForm() {
  const st = useStudio();
  const { channel } = st;
  const [form, setForm] = useState({
    intro: channel.intro,
    colors: channel.colors,
    tags: channel.tags.join(', '),
    notice: channel.notice || '',
    notifyLive: channel.notifyLive ?? true,
    notifyUpload: channel.notifyUpload ?? true,
  });
  const [saved, setSaved] = useState(false);
  const preview = { ...channel, colors: form.colors };

  const save = (e) => {
    e.preventDefault();
    st.updateChannel(channel.id, {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <PageHead title="채널 설정" desc="채널 소개와 대표 색상, 팔로워 알림을 설정해요.">
        <Link to={`/artist/${channel.id}`} className="btn btn--sm btn--outline">내 채널 보기 ↗</Link>
      </PageHead>
      <form className="st-grid st-grid--2-1" onSubmit={save}>
        <Panel title="기본 정보">
          <div className="st-form">
            <label className="st-field"><span>채널명</span><input value={channel.name} disabled /><em className="st-help">채널명 변경은 운영자 승인이 필요해요.</em></label>
            <label className="st-field"><span>채널 소개</span><textarea rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} maxLength={300} /></label>
            <label className="st-field"><span>태그 (쉼표로 구분)</span><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label>
            <label className="st-field"><span>채널 공지</span><input value={form.notice} onChange={(e) => setForm({ ...form, notice: e.target.value })} placeholder="예: 이번 주 금요일 컴백 라이브!" /></label>
            <div className="st-row">
              {[0, 1].map((i) => (
                <label key={i} className="st-field">
                  <span>대표 색상 {i + 1}</span>
                  <input
                    type="color"
                    value={form.colors[i]}
                    onChange={(e) => {
                      const colors = [...form.colors];
                      colors[i] = e.target.value;
                      setForm({ ...form, colors });
                    }}
                  />
                </label>
              ))}
            </div>
            <Toggle label="라이브 시작 시 팔로워에게 알림" on={form.notifyLive} onChange={(v) => setForm({ ...form, notifyLive: v })} />
            <Toggle label="새 영상 게시 시 팔로워에게 알림" on={form.notifyUpload} onChange={(v) => setForm({ ...form, notifyUpload: v })} />
            <div className="st-row st-row--end">
              {saved && <span className="st-ok">✓ 저장했어요</span>}
              <button className="btn btn--grad">저장</button>
            </div>
          </div>
        </Panel>
        <Panel title="미리보기">
          <div className="st-chpreview" style={{ background: `linear-gradient(135deg, ${form.colors[0]}, ${form.colors[1]})` }}>
            <ArtistAvatar artist={preview} size={72} link={false} live={false} />
            <strong>{channel.name}</strong>
            <span>{channel.kind} · {channel.agency}</span>
          </div>
          <p className="st-chpreview__intro">{form.intro}</p>
          {form.notice && <p className="st-chpreview__notice">📢 {form.notice}</p>}
          <div className="st-chips st-chips--plain">{form.tags.split(',').filter((t) => t.trim()).map((t) => <span key={t}>#{t.trim()}</span>)}</div>
        </Panel>
      </form>
    </>
  );
}
