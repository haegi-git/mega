import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ArtistAvatar from '../components/ArtistAvatar';
import { getArtist } from '../data/artists';
import {
  Back10Icon,
  ChevronLeft,
  FullscreenIcon,
  Fwd10Icon,
  MuteIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  VolumeIcon,
} from '../components/Icons';
import { useApp } from '../context/AppContext';
import { getContent } from '../data/contents';

const fmt = (s) => {
  if (!isFinite(s)) return '0:00';
  s = Math.floor(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

export default function Watch() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { saveProgress, getProgress } = useApp();
  const content = getContent(id);

  const isSeries = content && content.type !== 'concert';
  const epNo = Math.max(1, Number(params.get('ep')) || 1);
  const episode = isSeries ? content.episodes[epNo - 1] : null;
  const src = episode?.video || content?.video;
  const nextEp = isSeries && epNo < content.episodes.length ? epNo + 1 : null;

  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const hideTimer = useRef(null);
  const lastSaved = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [flash, setFlash] = useState('');
  const [finished, setFinished] = useState(false);

  // 마지막 재생 위치 (언마운트 시점엔 videoRef가 비어 있으므로 별도 보관)
  const stat = useRef({ time: 0, duration: 0 });

  const persist = useCallback(() => {
    const { time: t, duration: d } = stat.current;
    if (d && content) saveProgress(content.id, epNo, t, d);
  }, [content, epNo, saveProgress]);

  // 회차 변경/페이지 이탈 시 진행상황 저장
  useEffect(() => () => {
    persist();
  }, [persist]);

  // 회차가 바뀌면 플레이어 상태 초기화
  useEffect(() => {
    stat.current = { time: 0, duration: 0 };
    setLoading(true);
    setError(false);
    setFinished(false);
    setTime(0);
    setDuration(0);
  }, [src, epNo]);

  const poke = useCallback(() => {
    setShowUI(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowUI(false);
    }, 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const seek = useCallback((delta) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0);
    setFlash(delta > 0 ? `+${delta}초` : `${delta}초`);
    setTimeout(() => setFlash(''), 600);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space' || e.key === 'k') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowRight') seek(10);
      else if (e.key === 'ArrowLeft') seek(-10);
      else if (e.key === 'f') toggleFullscreen();
      else if (e.key === 'm') toggleMute();
      else if (e.key === 'Escape' && !document.fullscreenElement) navigate(`/content/${id}`);
      poke();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, seek, toggleFullscreen, poke, navigate, id]);

  useEffect(() => () => {
    clearTimeout(hideTimer.current);
  }, []);

  if (!content) {
    return (
      <div className="watch watch--error">
        <p>콘텐츠를 찾을 수 없습니다.</p>
        <button className="btn btn--primary" onClick={() => navigate('/')}>홈으로</button>
      </div>
    );
  }

  const onLoaded = () => {
    const v = videoRef.current;
    setDuration(v.duration);
    setLoading(false);
    const p = getProgress(content.id);
    if (p && p.ep === epNo && p.time > 5 && p.time < v.duration - 10) v.currentTime = p.time;
    v.play().catch(() => {});
  };

  const onTime = () => {
    const v = videoRef.current;
    setTime(v.currentTime);
    stat.current = { time: v.currentTime, duration: v.duration };
    if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
    if (Date.now() - lastSaved.current > 5000) {
      lastSaved.current = Date.now();
      persist();
    }
  };

  const onEnded = () => {
    persist();
    if (nextEp) navigate(`/watch/${content.id}?ep=${nextEp}`, { replace: true });
    else {
      setShowUI(true);
      setFinished(true);
    }
  };

  const onScrub = (e) => {
    const v = videoRef.current;
    const t = Number(e.target.value);
    v.currentTime = t;
    setTime(t);
  };

  const onVolume = (e) => {
    const v = videoRef.current;
    const val = Number(e.target.value);
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const pct = duration ? (time / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      className={`watch ${showUI ? '' : 'watch--hide-ui'}`}
      onMouseMove={poke}
      onTouchStart={poke}
    >
      <video
        key={src + epNo}
        ref={videoRef}
        src={src}
        className="watch__video"
        playsInline
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onLoadedMetadata={onLoaded}
        onTimeUpdate={onTime}
        onPlay={() => { setPlaying(true); poke(); }}
        onPause={() => { setPlaying(false); setShowUI(true); persist(); }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onSeeked={() => setLoading(false)}
        onEnded={onEnded}
        onError={() => { setError(true); setLoading(false); }}
      />

      {loading && !error && <div className="spinner" />}
      {error && (
        <div className="watch__msg">
          영상을 불러오지 못했습니다. 네트워크 상태를 확인해주세요.
        </div>
      )}
      {flash && <div className="watch__flash">{flash}</div>}

      {/* 마지막 화가 끝나면 출연 아티스트 채널로 연결 */}
      {finished && (
        <div className="watch__end">
          <p>재미있게 보셨나요? 출연 아티스트의 채널도 만나보세요</p>
          <div className="watch__end-list">
            {content.artistIds.map((aid) => {
              const a = getArtist(aid);
              return (
                <Link key={aid} to={`/artist/${aid}`} className="watch__end-artist">
                  <ArtistAvatar artist={a} size={72} link={false} />
                  <strong>{a.name}</strong>
                  <span>채널 보기 ›</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="watch__top">
        <button className="icon-btn" onClick={() => navigate(`/content/${content.id}`)} aria-label="뒤로가기">
          <ChevronLeft width={30} height={30} />
        </button>
        <div className="watch__title">
          <strong>{content.title}</strong>
          {episode && <span>{episode.title} · {episode.summary}</span>}
        </div>
      </div>

      {!playing && !loading && !error && (
        <button className="watch__bigplay" onClick={togglePlay} aria-label="재생">
          <PlayIcon width={44} height={44} />
        </button>
      )}

      <div className="watch__bottom">
        <div className="seek">
          <div className="seek__buf" style={{ width: `${bufPct}%` }} />
          <div className="seek__fill" style={{ width: `${pct}%` }} />
          <input type="range" min={0} max={duration || 0} step={0.1} value={time} onChange={onScrub} aria-label="재생 위치" />
        </div>
        <div className="controls">
          <div className="controls__left">
            <button className="icon-btn" onClick={togglePlay} aria-label={playing ? '일시정지' : '재생'}>
              {playing ? <PauseIcon width={28} height={28} /> : <PlayIcon width={28} height={28} />}
            </button>
            <button className="icon-btn" onClick={() => seek(-10)} aria-label="10초 뒤로"><Back10Icon width={28} height={28} /></button>
            <button className="icon-btn" onClick={() => seek(10)} aria-label="10초 앞으로"><Fwd10Icon width={28} height={28} /></button>
            <div className="volume">
              <button className="icon-btn" onClick={toggleMute} aria-label="음소거">
                {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={onVolume} aria-label="볼륨" />
            </div>
            <span className="controls__time">{fmt(time)} / {fmt(duration)}</span>
          </div>
          <div className="controls__right">
            {nextEp && (
              <button className="btn btn--sm btn--ghost" onClick={() => { persist(); navigate(`/watch/${content.id}?ep=${nextEp}`, { replace: true }); }}>
                <NextIcon width={18} height={18} /> 다음 화
              </button>
            )}
            <button className="icon-btn" onClick={toggleFullscreen} aria-label="전체화면"><FullscreenIcon /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
