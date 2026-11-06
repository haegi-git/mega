import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp, useRequireLogin } from '../context/AppContext';

const TYPES = ['아티스트 · 개인', '기획사', '콘텐츠 제작사'];
const FORMATS = ['숏드라마', '예능 · 자체콘텐츠', '릴스(숏폼)', '라이브', '공연 영상'];
const STEPS = [
  ['01', '입점 신청', '채널 정보와 운영할 콘텐츠를 알려주세요.'],
  ['02', '자동 검토', '제출 정보를 기반으로 채널 설정 초안을 만들어요.'],
  ['03', '운영자 승인', '담당자가 확인 후 승인 결과를 안내해요.'],
  ['04', '채널 오픈', 'VOD 업로드 · 라이브 송출을 바로 시작해요.'],
];

export default function Partner() {
  const { user, applications, submitApplication } = useApp();
  const requireLogin = useRequireLogin();
  const [form, setForm] = useState({ type: TYPES[0], channel: '', manager: '', email: '', formats: [], intro: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleFormat = (f) =>
    setForm({ ...form, formats: form.formats.includes(f) ? form.formats.filter((x) => x !== f) : [...form.formats, f] });

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    requireLogin(() => {
      if (!form.channel.trim()) return setError('채널명을 입력해주세요.');
      if (!form.manager.trim()) return setError('담당자 이름을 입력해주세요.');
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('올바른 이메일을 입력해주세요.');
      if (!form.formats.length) return setError('운영할 콘텐츠 유형을 하나 이상 선택해주세요.');
      submitApplication(form);
      setDone(true);
      setForm({ type: TYPES[0], channel: '', manager: '', email: '', formats: [], intro: '' });
    });
  };

  return (
    <div className="page partner">
      <section className="partner__hero">
        <span className="hero__badge">MEGAVIEW PARTNERS</span>
        <h1>아티스트와 제작사를 위한<br />나만의 채널을 열어보세요</h1>
        <p>숏드라마, 예능, 릴스, 라이브까지. 콘텐츠만 준비하면 전송·확장·보안은 MEGAVIEW가 맡습니다.</p>
      </section>

      <section className="steps">
        {STEPS.map(([n, t, d]) => (
          <div key={n} className="step">
            <b>{n}</b>
            <strong>{t}</strong>
            <span>{d}</span>
          </div>
        ))}
      </section>

      <div className="partner__grid">
        <form className="form partner__form" onSubmit={onSubmit}>
          <h2>채널 입점 신청</h2>
          <div className="field">
            <span>신청 유형</span>
            <div className="chips">
              {TYPES.map((t) => (
                <button type="button" key={t} className={`chip ${form.type === t ? 'is-active' : ''}`} onClick={() => setForm({ ...form, type: t })}>{t}</button>
              ))}
            </div>
          </div>
          <label className="field"><span>채널명</span><input name="channel" value={form.channel} onChange={onChange} placeholder="예: NOVA:X OFFICIAL" /></label>
          <label className="field"><span>담당자</span><input name="manager" value={form.manager} onChange={onChange} placeholder="이름" /></label>
          <label className="field"><span>연락 이메일</span><input name="email" type="email" value={form.email} onChange={onChange} placeholder="partner@example.com" /></label>
          <div className="field">
            <span>운영할 콘텐츠</span>
            <div className="chips">
              {FORMATS.map((f) => (
                <button type="button" key={f} className={`chip ${form.formats.includes(f) ? 'is-active' : ''}`} onClick={() => toggleFormat(f)}>{f}</button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>채널 소개 (선택)</span>
            <textarea name="intro" rows={4} value={form.intro} onChange={onChange} placeholder="어떤 콘텐츠를 어떤 팬들에게 보여주고 싶은지 알려주세요." />
          </label>
          {error && <p className="form__error">{error}</p>}
          {done && <p className="form__ok">✓ 신청이 접수되었어요. 검토 후 이메일로 안내드릴게요.</p>}
          <button className="btn btn--grad btn--lg btn--block" type="submit">{user ? '신청하기' : '로그인하고 신청하기'}</button>
          <p className="form__note">※ 데모 사이트로 실제 심사는 진행되지 않습니다.</p>
        </form>

        <aside className="partner__side">
          <h3>내 신청 내역</h3>
          {!user ? (
            <p className="muted"><Link to="/login" state={{ from: '/partner' }}>로그인</Link>하면 신청 내역을 볼 수 있어요.</p>
          ) : applications.length ? (
            <ul className="apps">
              {applications.map((a) => (
                <li key={a.id}>
                  <div>
                    <strong>{a.channel}</strong>
                    <span>{a.type} · {a.formats.join(', ')}</span>
                    <span>{new Date(a.submittedAt).toLocaleString('ko-KR')}</span>
                  </div>
                  <div className="apps__right">
                    <em className={`status status--${a.status === '승인' ? 'ok' : a.status === '반려' ? 'bad' : 'wait'}`}>{a.status}</em>
                    {a.status === '승인' && <Link to="/studio" className="btn btn--xs btn--grad">스튜디오 열기</Link>}
                    {a.note && <span>{a.note}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">아직 신청 내역이 없어요.</p>
          )}
          <h3>입점 혜택</h3>
          <ul className="benefits">
            <li>🎬 VOD · 숏드라마 업로드와 자동 화질 변환</li>
            <li>🔴 라이브 송출 및 편성표 노출</li>
            <li>💜 팔로워 알림 · 멤버십 전용 콘텐츠 설정</li>
            <li>📊 시청 지표 · 수익 리포트 제공</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
