import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraIcon, CopyIcon, EyeIcon, MonitorIcon } from '../components/Icons';
import { Badge, clock, num, PageHead, Panel, seeded, StatCard, Tabs, Toggle, useTick } from '../console/ui';
import { useStudio } from '../context/StudioContext';
import { VIDEOS } from '../data/media';

// 데모용 수집(Ingest) 주소. 실제로는 AWS IVS 등에서 발급받은 주소로 교체합니다.
const INGEST = 'rtmps://ingest.megaview.example:443/app/';
const CATEGORIES = ['일상', '음악', '팬미팅', '컴백', '쇼케이스', '공연', '챌린지', '토크', '단체관람'];
const QUALITY = { '1080p60': 6000, '1080p30': 4500, '720p60': 3500, '720p30': 2500 };
const NICKS = ['별빛팬', 'moonlight_22', '하트뿅뿅', '데뷔축하해', '부산팬', '새벽감성', '입덕3일차', '최애는너', 'spam_bot99'];
const MSGS = ['오늘도 와줘서 고마워 💜', '목소리 너무 좋다', '컴백 언제예요?', 'ㅋㅋㅋㅋㅋ', '사랑해요!!', '여기 광고 링크 클릭 http://spam', '처음 왔어요 반가워요', '노래 불러주세요 🙏', '도배 도배 도배', '화질 최고'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export default function Broadcast() {
  const { channel } = useStudio();
  return <BroadcastView key={channel.id} />;
}

function BroadcastView() {
  const st = useStudio();
  const { channel } = st;
  const live = st.onAir[channel.id];
  const key = st.streamKeys[channel.id];
  const chatCfg = st.getChat(channel.id);
  const now = useTick(1000);

  const [form, setForm] = useState(() => st.getBroadcast(channel.id));
  const [mode, setMode] = useState('obs');
  const [showKey, setShowKey] = useState(false);
  const [toast, setToast] = useState('');
  const [summary, setSummary] = useState(null);
  const [notice, setNotice] = useState('');

  // 스트림 키가 없으면 발급
  useEffect(() => {
    if (!key) st.regenKey(channel.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, channel.id]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  };
  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(`${label}를 복사했어요`);
    } catch {
      flash('복사에 실패했어요');
    }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  // ---------- 브라우저 송출(웹캠 / 화면 공유) ----------
  const camRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [camErr, setCamErr] = useState('');
  const startCapture = async (screen) => {
    setCamErr('');
    try {
      const s = screen
        ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        : await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
    } catch (e) {
      setCamErr(e.name === 'NotAllowedError' ? '카메라/화면 접근이 거부되었어요. 브라우저 권한을 확인해주세요.' : '사용할 수 있는 카메라를 찾지 못했어요.');
    }
  };
  useEffect(() => {
    if (camRef.current) camRef.current.srcObject = stream;
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);

  // ---------- 방송 중 지표 (시뮬레이션) ----------
  const elapsed = live ? (now - live.startedAt) / 1000 : 0;
  const r = seeded(channel.id + Math.floor(elapsed / 3));
  const peakBase = channel.followers * 0.05;
  const viewers = live ? Math.round(peakBase * (1 - Math.exp(-elapsed / 60)) * (0.94 + r() * 0.12)) + 1 : 0;
  const target = QUALITY[form.quality] || 4500;
  const signalOk = mode === 'obs' || !!stream;
  const bitrate = live && signalOk ? Math.round(target * (0.93 + r() * 0.1)) : 0;
  const dropped = live && signalOk ? +(r() * 0.4).toFixed(2) : 0;
  const peakRef = useRef(0);
  peakRef.current = Math.max(peakRef.current, viewers);

  // ---------- 채팅 미리보기 + 관리 ----------
  const [msgs, setMsgs] = useState([]);
  const chatCount = useRef(0);
  const blocked = chatCfg.blocked;
  useEffect(() => {
    if (!live || !form.chat) return;
    const t = setInterval(() => {
      const text = pick(MSGS);
      const nick = pick(NICKS);
      chatCount.current += 1;
      const hit = chatCfg.bannedWords.some((w) => text.includes(w)) || (chatCfg.blockLinks && /https?:\/\//.test(text));
      setMsgs((m) => [...m.slice(-60), { id: Math.random().toString(36).slice(2), nick, text, filtered: hit }]);
    }, 1300);
    return () => clearInterval(t);
  }, [live, form.chat, chatCfg.bannedWords, chatCfg.blockLinks]);
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  const blockUser = (nick) => {
    st.updateChat(channel.id, { blocked: [...new Set([...blocked, nick])] });
    setMsgs((m) => m.filter((x) => x.nick !== nick));
    flash(`${nick} 님을 채팅에서 차단했어요`);
  };

  // ---------- 시작 / 종료 ----------
  const start = () => {
    if (!form.title.trim()) return flash('방송 제목을 입력해주세요');
    if (mode === 'web' && !stream) return flash('먼저 카메라나 화면 공유를 켜주세요');
    st.saveBroadcast(channel.id, form);
    st.startBroadcast(channel.id, { ...form, mode });
    peakRef.current = 0;
    chatCount.current = 0;
    setMsgs([]);
    setSummary(null);
  };
  const end = () => {
    if (!window.confirm('방송을 종료할까요?')) return;
    const s = {
      title: live.title,
      startedAt: live.startedAt,
      endedAt: Date.now(),
      peak: peakRef.current,
      chats: chatCount.current,
      followers: Math.round(peakRef.current * 0.03),
    };
    st.endBroadcast(channel.id, s);
    setSummary(s);
  };
  const updateInfo = () => {
    st.saveBroadcast(channel.id, form);
    st.startBroadcast(channel.id, { ...live, ...form, startedAt: live.startedAt });
    flash('방송 정보를 업데이트했어요');
  };

  return (
    <>
      <PageHead title="방송하기" desc="송출 프로그램(OBS 등) 또는 브라우저에서 바로 라이브를 시작하세요.">
        {live ? (
          <button className="btn btn--sm btn--live" onClick={end}>■ 방송 종료</button>
        ) : (
          <button className="btn btn--sm btn--grad" onClick={start}>● 방송 시작</button>
        )}
      </PageHead>

      {summary && (
        <div className="st-summary">
          <strong>방송이 종료되었어요. 수고하셨어요! 🎉</strong>
          <span>방송 시간 {clock(summary.endedAt - summary.startedAt)} · 최고 동시 시청자 {num(summary.peak)}명 · 채팅 {num(summary.chats)}개 · 신규 팔로워 +{num(summary.followers)}</span>
          <Link to="/studio" className="st-link">대시보드에서 보기 ›</Link>
        </div>
      )}

      <div className="st-grid st-grid--2-1">
        <div className="st-col">
          <Panel
            title="방송 화면"
            action={
              <Tabs value={mode} onChange={(m) => !live && setMode(m)} items={[['obs', '외부 프로그램(OBS)'], ['web', '브라우저 송출']]} />
            }
          >
            <div className="st-preview">
              {mode === 'web' ? (
                stream ? (
                  <video ref={camRef} autoPlay muted playsInline />
                ) : (
                  <div className="st-preview__empty">
                    <p>카메라 또는 화면을 공유해서 바로 방송할 수 있어요.</p>
                    <div className="st-row">
                      <button className="btn btn--sm btn--ghost" onClick={() => startCapture(false)}><CameraIcon width={16} height={16} /> 카메라 켜기</button>
                      <button className="btn btn--sm btn--ghost" onClick={() => startCapture(true)}><MonitorIcon width={16} height={16} /> 화면 공유</button>
                    </div>
                    {camErr && <p className="st-error">{camErr}</p>}
                  </div>
                )
              ) : live ? (
                <video src={VIDEOS[1]} autoPlay muted loop playsInline />
              ) : (
                <div className="st-preview__empty">
                  <p>송출 신호 대기 중</p>
                  <span>OBS 같은 송출 프로그램에 아래 서버 주소와 스트림 키를 넣고 송출을 시작하세요.</span>
                </div>
              )}
              {live && (
                <div className="st-preview__badges">
                  <span className="badge-live">LIVE</span>
                  <span className="live-chip"><EyeIcon width={14} height={14} /> {num(viewers)}</span>
                  <span className="live-chip">{clock(now - live.startedAt)}</span>
                </div>
              )}
              {mode === 'web' && stream && (
                <button className="st-preview__stop" onClick={() => setStream(null)}>카메라 끄기</button>
              )}
            </div>

            {live && (
              <div className="st-stats st-stats--sm">
                <StatCard label="동시 시청자" value={num(viewers)} />
                <StatCard label="비트레이트" value={`${num(bitrate)} kbps`} sub={`목표 ${num(target)} kbps`} />
                <StatCard label="드롭 프레임" value={`${dropped}%`} tone={dropped > 0.3 ? 'warn' : undefined} />
                <StatCard label="송출 상태" value={signalOk ? '양호' : '신호 없음'} tone={signalOk ? 'ok' : 'bad'} sub={form.latency} />
              </div>
            )}
          </Panel>

          {mode === 'obs' && (
            <Panel title="송출 정보" action={<Badge>{live ? '수신 중' : '대기'}</Badge>}>
              <div className="st-field">
                <span>서버 URL</span>
                <div className="st-copy">
                  <code>{INGEST}</code>
                  <button className="icon-btn" onClick={() => copy(INGEST, '서버 URL')} aria-label="복사"><CopyIcon width={16} height={16} /></button>
                </div>
              </div>
              <div className="st-field">
                <span>스트림 키 <em>절대 다른 사람에게 공유하지 마세요</em></span>
                <div className="st-copy">
                  <code>{showKey ? key : '•'.repeat(28)}</code>
                  <button className="btn btn--xs btn--outline" onClick={() => setShowKey((v) => !v)}>{showKey ? '숨기기' : '보기'}</button>
                  <button className="icon-btn" onClick={() => copy(key, '스트림 키')} aria-label="복사"><CopyIcon width={16} height={16} /></button>
                  <button
                    className="btn btn--xs btn--outline"
                    disabled={!!live}
                    onClick={() => window.confirm('스트림 키를 재발급하면 기존 키는 더 이상 사용할 수 없어요. 계속할까요?') && (st.regenKey(channel.id), flash('새 스트림 키를 발급했어요'))}
                  >
                    재발급
                  </button>
                </div>
              </div>
              <ul className="st-hint">
                <li>권장 설정: 키프레임 간격 2초 · H.264 · AAC 160kbps</li>
                <li>{form.quality} 기준 권장 비트레이트 {num(target)} kbps</li>
              </ul>
            </Panel>
          )}
        </div>

        <div className="st-col">
          <Panel title="방송 정보">
            <div className="st-form">
              <label className="st-field">
                <span>방송 제목</span>
                <input value={form.title} onChange={set('title')} maxLength={60} placeholder="예: 컴백 D-1 카운트다운 라이브" />
              </label>
              <div className="st-row">
                <label className="st-field">
                  <span>카테고리</span>
                  <select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                </label>
                <label className="st-field">
                  <span>화질</span>
                  <select value={form.quality} onChange={set('quality')} disabled={!!live}>{Object.keys(QUALITY).map((q) => <option key={q}>{q}</option>)}</select>
                </label>
              </div>
              <label className="st-field">
                <span>태그 (쉼표로 구분)</span>
                <input value={form.tags} onChange={set('tags')} placeholder="컴백, 팬미팅" />
              </label>
              <label className="st-field">
                <span>지연 모드</span>
                <select value={form.latency} onChange={set('latency')} disabled={!!live}>
                  <option>초저지연</option>
                  <option>일반 (안정성 우선)</option>
                </select>
              </label>
              <Toggle label="멤버십 전용 방송" on={form.membersOnly} onChange={(v) => setForm({ ...form, membersOnly: v })} />
              <Toggle label="채팅 허용" on={form.chat} onChange={(v) => setForm({ ...form, chat: v })} />
              {live ? (
                <button className="btn btn--sm btn--outline" onClick={updateInfo}>방송 정보 업데이트</button>
              ) : (
                <button className="btn btn--grad" onClick={start}>● 방송 시작</button>
              )}
            </div>
          </Panel>

          <Panel title="실시간 채팅" action={<Link to="/studio/chat" className="st-link">채팅 설정 ›</Link>}>
            <form
              className="st-notice"
              onSubmit={(e) => {
                e.preventDefault();
                if (notice.trim()) {
                  setMsgs((m) => [...m, { id: `n-${Date.now()}`, nick: '📢 공지', text: notice.trim(), notice: true }]);
                  setNotice('');
                }
              }}
            >
              <input value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="채팅방 공지 입력" disabled={!live} />
              <button className="btn btn--xs btn--outline" disabled={!live}>등록</button>
            </form>
            <ul className="st-chat" ref={chatRef}>
              {!live && <li className="st-chat__sys">방송을 시작하면 채팅이 여기에 표시돼요.</li>}
              {live && !form.chat && <li className="st-chat__sys">채팅이 꺼져 있어요.</li>}
              {msgs.map((m) => (
                <li key={m.id} className={m.notice ? 'is-notice' : m.filtered ? 'is-filtered' : ''}>
                  <b>{m.nick}</b>
                  <span>{m.filtered ? '(금칙어·링크 필터로 숨겨진 메시지)' : m.text}</span>
                  {!m.notice && (
                    <span className="st-chat__actions">
                      <button onClick={() => setMsgs((arr) => arr.filter((x) => x.id !== m.id))}>삭제</button>
                      <button onClick={() => blockUser(m.nick)}>차단</button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
