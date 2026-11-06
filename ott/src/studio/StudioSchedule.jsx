import { useState } from 'react';
import { Badge, dateTime, Empty, PageHead, Panel, Toggle } from '../console/ui';
import { useStudio } from '../context/StudioContext';
import { livesByArtist, statusOf } from '../data/lives';

const CATS = ['일상', '음악', '팬미팅', '컴백', '쇼케이스', '공연', '챌린지', '토크'];
const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function StudioSchedule() {
  const st = useStudio();
  const { channel } = st;
  const [form, setForm] = useState({
    title: '',
    startAt: toLocalInput(Date.now() + 2 * 3600_000),
    duration: 60,
    category: '일상',
    membersOnly: false,
    notify: true,
  });
  const [msg, setMsg] = useState('');

  const mine = st.schedules.filter((s) => s.channelId === channel.id).sort((a, b) => a.startAt - b.startAt);
  const platform = livesByArtist(channel.id).filter((l) => statusOf(l) !== 'ended');

  const submit = (e) => {
    e.preventDefault();
    const startAt = new Date(form.startAt).getTime();
    if (!form.title.trim()) return setMsg('방송 제목을 입력해주세요.');
    if (!startAt || startAt < Date.now()) return setMsg('현재 이후 시간으로 예약해주세요.');
    st.addSchedule({ ...form, title: form.title.trim(), startAt, duration: Number(form.duration), channelId: channel.id });
    setMsg(`예약 완료! ${form.notify ? '팔로워에게 알림이 발송돼요.' : ''}`);
    setForm({ ...form, title: '' });
  };

  return (
    <>
      <PageHead title="방송 예약" desc="예약한 라이브는 서비스의 편성표와 아티스트 채널에 노출돼요." />
      <div className="st-grid st-grid--1-2">
        <Panel title="새 라이브 예약">
          <form className="st-form" onSubmit={submit}>
            <label className="st-field"><span>방송 제목</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 컴백 쇼케이스 생중계" /></label>
            <label className="st-field"><span>시작 일시</span><input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /></label>
            <div className="st-row">
              <label className="st-field">
                <span>예상 시간</span>
                <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>
                  {[30, 60, 90, 120, 180].map((m) => <option key={m} value={m}>{m}분</option>)}
                </select>
              </label>
              <label className="st-field">
                <span>카테고리</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
            </div>
            <Toggle label="멤버십 전용" on={form.membersOnly} onChange={(v) => setForm({ ...form, membersOnly: v })} />
            <Toggle label="팔로워에게 예약 알림 보내기" on={form.notify} onChange={(v) => setForm({ ...form, notify: v })} />
            {msg && <p className="st-msg">{msg}</p>}
            <button className="btn btn--grad">예약하기</button>
          </form>
        </Panel>

        <Panel title="예약 목록">
          {mine.length + platform.length === 0 ? (
            <Empty>예약된 라이브가 없어요.</Empty>
          ) : (
            <table className="st-table">
              <thead><tr><th>일시</th><th>제목</th><th>구분</th><th>상태</th><th /></tr></thead>
              <tbody>
                {platform.map((l) => (
                  <tr key={l.id}>
                    <td>{dateTime(l.startAt)}</td>
                    <td>{l.title}<small>{l.category} · {l.duration}분{l.membersOnly ? ' · 멤버십' : ''}</small></td>
                    <td>플랫폼 편성</td>
                    <td><Badge>{statusOf(l) === 'live' ? '진행 중' : '대기'}</Badge></td>
                    <td />
                  </tr>
                ))}
                {mine.map((s) => (
                  <tr key={s.id}>
                    <td>{dateTime(s.startAt)}</td>
                    <td>{s.title}<small>{s.category} · {s.duration}분{s.membersOnly ? ' · 멤버십' : ''}</small></td>
                    <td>직접 예약</td>
                    <td><Badge>{s.startAt > Date.now() ? '대기' : '진행 중'}</Badge></td>
                    <td><button className="btn btn--xs btn--outline" onClick={() => st.removeSchedule(s.id)}>취소</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </>
  );
}
