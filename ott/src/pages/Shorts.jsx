import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ArtistAvatar, { FollowButton } from '../components/ArtistAvatar';
import { ChatIcon, CloseIcon, HeartIcon, MusicIcon, MuteIcon, PlayIcon, ShareIcon, VolumeIcon } from '../components/Icons';
import { useApp, useRequireLogin } from '../context/AppContext';
import { getArtist } from '../data/artists';
import { formatCount } from '../data/media';
import { SHORTS } from '../data/shorts';

const CLIP = 30; // 릴스 한 편 길이(초)

export default function Shorts() {
  const [params] = useSearchParams();
  const startId = params.get('id');
  const [active, setActive] = useState(() => Math.max(0, SHORTS.findIndex((s) => s.id === startId)));
  const [muted, setMuted] = useState(true); // 브라우저 자동재생 정책 때문에 음소거로 시작
  const feedRef = useRef(null);
  const itemRefs = useRef([]);

  // 시작 위치로 스크롤
  useEffect(() => {
    itemRefs.current[active]?.scrollIntoView({ block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 화면에 보이는 릴스를 활성화
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.index))),
      { root: feedRef.current, threshold: 0.6 }
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // 키보드 ↑↓ 이동
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const go = (i) => itemRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (e.key === 'ArrowDown') { e.preventDefault(); go(Math.min(SHORTS.length - 1, active + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); go(Math.max(0, active - 1)); }
      if (e.key === 'm') setMuted((m) => !m);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <div className="shorts" ref={feedRef}>
      {SHORTS.map((s, i) => (
        <section key={s.id} className="shorts__item" data-index={i} ref={(el) => (itemRefs.current[i] = el)}>
          <ShortPlayer
            short={s}
            active={i === active}
            near={Math.abs(i - active) <= 1}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
          />
        </section>
      ))}
    </div>
  );
}

function ShortPlayer({ short, active, near, muted, onToggleMute }) {
  const videoRef = useRef(null);
  const { isLiked, toggleLike } = useApp();
  const requireLogin = useRequireLogin();
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState(false);
  const [toast, setToast] = useState('');
  const artist = getArtist(short.artistId);
  const liked = isLiked(short.id);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      v.pause();
      setComments(false);
    }
  }, [active, near]);

  const onLoaded = () => {
    const v = videoRef.current;
    if (v.duration > short.startAt + 5) v.currentTime = short.startAt;
    if (active) v.play().catch(() => setPaused(true));
  };

  const onTime = () => {
    const v = videoRef.current;
    const t = v.currentTime - short.startAt;
    if (t >= CLIP) v.currentTime = short.startAt; // 30초 구간 반복
    setProgress(Math.max(0, Math.min(1, t / CLIP)));
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/shorts?id=${short.id}`);
      setToast('링크를 복사했어요');
    } catch {
      setToast('링크 복사 실패');
    }
    setTimeout(() => setToast(''), 1600);
  };

  return (
    <div className="short">
      <div className="short__frame">
        <video
          ref={videoRef}
          className="short__video"
          src={near ? short.video : undefined}
          poster={short.thumb}
          muted={muted}
          playsInline
          preload="metadata"
          onLoadedMetadata={onLoaded}
          onTimeUpdate={onTime}
          onClick={togglePlay}
        />
        {paused && active && (
          <button className="short__playbtn" onClick={togglePlay} aria-label="재생">
            <PlayIcon width={40} height={40} />
          </button>
        )}
        <button className="short__mute" onClick={onToggleMute} aria-label={muted ? '소리 켜기' : '음소거'}>
          {muted ? <MuteIcon width={20} height={20} /> : <VolumeIcon width={20} height={20} />}
        </button>

        <div className="short__info">
          <div className="short__artist">
            <ArtistAvatar artist={artist} size={36} />
            <Link to={`/artist/${artist.id}`}>{artist.name}</Link>
            <FollowButton artist={artist} small />
          </div>
          <p className="short__caption">{short.caption}</p>
          <p className="short__tags">{short.tags.map((t) => `#${t}`).join(' ')}</p>
          <p className="short__music"><MusicIcon width={14} height={14} /> {artist.name} - Original Sound</p>
        </div>
        <div className="short__progress"><div style={{ width: `${progress * 100}%` }} /></div>

        {comments && (
          <div className="short__sheet">
            <div className="short__sheet-head">
              <strong>댓글 {formatCount(short.commentCount)}</strong>
              <button className="icon-btn" onClick={() => setComments(false)} aria-label="닫기"><CloseIcon width={20} height={20} /></button>
            </div>
            <ul>
              {short.comments.map((c) => (
                <li key={c.id}><b>{c.nick}</b> {c.text}</li>
              ))}
            </ul>
            <p className="short__sheet-note">데모에서는 댓글 작성을 지원하지 않아요.</p>
          </div>
        )}
        {toast && <div className="short__toast">{toast}</div>}
      </div>

      <div className="short__actions">
        <button className={liked ? 'is-on' : ''} onClick={() => requireLogin(() => toggleLike(short.id))} aria-label="좋아요">
          <span><HeartIcon filled={liked} /></span>
          {formatCount(short.likes + (liked ? 1 : 0))}
        </button>
        <button onClick={() => setComments((v) => !v)} aria-label="댓글">
          <span><ChatIcon /></span>
          {formatCount(short.commentCount)}
        </button>
        <button onClick={share} aria-label="공유">
          <span><ShareIcon /></span>
          공유
        </button>
        <ArtistAvatar artist={artist} size={44} />
      </div>
    </div>
  );
}
