import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArtistAvatar, { FollowButton } from '../components/ArtistAvatar';
import { LiveCard } from '../components/ContentCard';
import { BellIcon, EyeIcon, FullscreenIcon, HeartIcon, LockIcon, MuteIcon, SendIcon, VolumeIcon } from '../components/Icons';
import { useApp, useRequireLogin } from '../context/AppContext';
import { getArtist } from '../data/artists';
import { formatDay, formatTime, getLive, liveNow, statusOf } from '../data/lives';
import { formatCount } from '../data/media';
import NotFound from './NotFound';

const NICKS = ['별빛팬', 'moonlight_22', '하트뿅뿅', '데뷔축하해', '오늘도출근', '부산팬', '새벽감성', '입덕3일차', '최애는너', 'ㅇㅇ'];
const MSGS = [
  'ㅠㅠㅠ 너무 좋아', '오늘 비주얼 무슨 일이야', '{name} 사랑해!!', '부산에서 보고 있어요~', '컴백 기대 중 🔥',
  'ㅋㅋㅋㅋㅋㅋㅋ', '목소리 너무 좋다', '첫 라이브 입장했어요!', '하트 누르자 💜', '노래 한 소절만 불러주세요 🙏',
  '숏드라마 보고 왔어요!', '해외에서 보는 중 🌏', '밥은 먹었어요?', '이 조합 최고야',
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function LiveRoomPage() {
  const { id } = useParams();
  const live = getLive(id);
  if (!live) return <NotFound />;
  return <LiveRoom key={id} live={live} />;
}

function LiveRoom({ live }) {
  const artist = getArtist(live.artistId);
  const { user, isMember, hasReminder, toggleReminder } = useApp();
  const requireLogin = useRequireLogin();
  const [now, setNow] = useState(Date.now());
  const status = statusOf(live, now);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const others = liveNow().filter((l) => l.id !== live.id).slice(0, 4);

  // ---------- 방송 예정 ----------
  if (status === 'scheduled') {
    const left = Math.max(0, live.startAt - now);
    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    const on = hasReminder(live.id);
    return (
      <div className="page live-wait" style={{ '--bg': `url(${live.backdrop})` }}>
        <div className="live-wait__card">
          <ArtistAvatar artist={artist} size={88} />
          <span className="sched__cat">{live.category} · {formatDay(live.startAt)} {formatTime(live.startAt)} 시작</span>
          <h1>{live.title}</h1>
          <p>{artist.name}</p>
          <div className="countdown">
            <div><b>{String(h).padStart(2, '0')}</b><span>시간</span></div>
            <div><b>{String(m).padStart(2, '0')}</b><span>분</span></div>
            <div><b>{String(s).padStart(2, '0')}</b><span>초</span></div>
          </div>
          <div className="live-wait__actions">
            <button className={`btn btn--lg ${on ? 'btn--outline' : 'btn--grad'}`} onClick={() => requireLogin(() => toggleReminder(live.id))}>
              <BellIcon width={18} height={18} filled={on} /> {on ? '알림 설정됨' : '시작 알림 받기'}
            </button>
            <Link to={`/artist/${artist.id}`} className="btn btn--lg btn--ghost">아티스트 채널</Link>
          </div>
        </div>
      </div>
    );
  }

  const locked = live.membersOnly && !isMember;

  return (
    <div className="live-room">
      <div className="live-room__main">
        {locked ? (
          <div className="live-room__stage live-room__locked" style={{ backgroundImage: `url(${live.backdrop})` }}>
            <div>
              <LockIcon width={40} height={40} />
              <h2>멤버십 전용 라이브</h2>
              <p>팬 패스 또는 MEGA PASS 이용자만 시청할 수 있어요.</p>
              {user ? (
                <Link to="/subscribe" className="btn btn--grad">멤버십 시작하기</Link>
              ) : (
                <button className="btn btn--grad" onClick={() => requireLogin(() => {})}>로그인하기</button>
              )}
            </div>
          </div>
        ) : (
          <LivePlayer live={live} ended={status === 'ended'} now={now} />
        )}

        <div className="live-room__info">
          <div className="live-room__title">
            {status === 'live' ? <span className="badge-live">LIVE</span> : <span className="badge-soon">다시보기</span>}
            <h1>{live.title}</h1>
          </div>
          <div className="live-room__artist">
            <ArtistAvatar artist={artist} size={52} />
            <div>
              <Link to={`/artist/${artist.id}`}><strong>{artist.name}</strong></Link>
              <span>팔로워 {formatCount(artist.followers)} · {live.category}</span>
            </div>
            <FollowButton artist={artist} />
          </div>
        </div>

        {others.length > 0 && (
          <>
            <h2 className="section-title">다른 라이브</h2>
            <div className="grid grid--live">
              {others.map((l) => <LiveCard key={l.id} live={l} />)}
            </div>
          </>
        )}
      </div>

      <Chat live={live} artist={artist} active={status === 'live' && !locked} />
    </div>
  );
}

function LivePlayer({ live, ended, now }) {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [viewers, setViewers] = useState(live.viewers);
  const [hearts, setHearts] = useState([]);

  // 실시간 느낌: 방송 경과 시간만큼 영상 위치를 맞추고 반복 재생
  const onLoaded = () => {
    const v = videoRef.current;
    if (!ended) v.currentTime = ((Date.now() - live.startAt) / 1000) % Math.max(1, v.duration - 1);
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  };

  // 시청자 수 변동 + 다른 팬들의 하트
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => {
      setViewers((v) => Math.max(100, Math.round(v * (1 + (Math.random() - 0.45) * 0.01))));
      if (Math.random() < 0.6) addHeart();
    }, 1500);
    return () => clearInterval(t);
  }, [ended]);

  const addHeart = () => {
    const id = Math.random().toString(36).slice(2);
    setHearts((h) => [...h.slice(-20), { id, left: 10 + Math.random() * 60, hue: Math.floor(Math.random() * 60) + 300 }]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 2000);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const elapsed = Math.max(0, Math.floor((now - live.startAt) / 1000));
  const hh = Math.floor(elapsed / 3600);
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="live-room__stage" ref={wrapRef}>
      <video
        ref={videoRef}
        src={live.video}
        className="live-room__video"
        playsInline
        loop={!ended}
        controls={ended}
        onLoadedMetadata={onLoaded}
      />
      {!ended && (
        <>
          <div className="live-room__badges">
            <span className="badge-live">LIVE</span>
            <span className="live-chip"><EyeIcon width={14} height={14} /> {viewers.toLocaleString('ko-KR')}</span>
            <span className="live-chip">{hh ? `${hh}:` : ''}{mm}:{ss}</span>
          </div>
          <div className="live-room__hearts">
            {hearts.map((h) => (
              <span key={h.id} style={{ left: `${h.left}%`, color: `hsl(${h.hue} 90% 65%)` }}>
                <HeartIcon filled width={26} height={26} />
              </span>
            ))}
          </div>
          <div className="live-room__controls">
            <button className="icon-btn" onClick={toggleMute} aria-label="음소거">
              {muted ? <MuteIcon /> : <VolumeIcon />}
            </button>
            {muted && <button className="live-chip live-chip--btn" onClick={toggleMute}>🔇 탭하여 소리 켜기</button>}
            <span style={{ flex: 1 }} />
            <button className="heart-btn" onClick={addHeart} aria-label="하트 보내기">
              <HeartIcon filled width={22} height={22} />
            </button>
            <button className="icon-btn" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : wrapRef.current?.requestFullscreen?.())} aria-label="전체화면">
              <FullscreenIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Chat({ live, artist, active }) {
  const { user } = useApp();
  const requireLogin = useRequireLogin();
  const [msgs, setMsgs] = useState([{ id: 'sys', sys: true, text: `${artist.name}의 라이브 채팅방에 오신 것을 환영해요! 서로 배려하는 채팅 부탁드려요 💜` }]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  // 다른 시청자 채팅 시뮬레이션
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      const member = artist.members.length ? pick(artist.members) : artist.ko;
      setMsgs((m) => [
        ...m.slice(-80),
        { id: Math.random().toString(36).slice(2), nick: pick(NICKS), text: pick(MSGS).replace('{name}', member) },
      ]);
    }, 900 + Math.random() * 800);
    return () => clearInterval(t);
  }, [active, artist]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const send = (e) => {
    e.preventDefault();
    requireLogin(() => {
      if (!text.trim()) return;
      setMsgs((m) => [...m, { id: `me-${Date.now()}`, nick: user.name, text: text.trim(), me: true }]);
      setText('');
    });
  };

  return (
    <aside className="chat">
      <div className="chat__head">
        <strong>실시간 채팅</strong>
        {live.membersOnly && <span className="badge-member"><LockIcon width={12} height={12} /> 멤버십</span>}
      </div>
      <ul className="chat__list" ref={listRef}>
        {msgs.map((m) =>
          m.sys ? (
            <li key={m.id} className="chat__sys">{m.text}</li>
          ) : (
            <li key={m.id} className={m.me ? 'is-me' : ''}>
              <b>{m.nick}</b> {m.text}
            </li>
          )
        )}
        {!active && <li className="chat__sys">채팅이 종료되었어요.</li>}
      </ul>
      <form className="chat__form" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? '채팅을 입력하세요' : '로그인 후 채팅할 수 있어요'}
          maxLength={100}
          disabled={!active}
        />
        <button className="icon-btn" type="submit" disabled={!active} aria-label="보내기"><SendIcon width={20} height={20} /></button>
      </form>
    </aside>
  );
}
