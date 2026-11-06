import { createContext, useContext, useEffect, useState } from 'react';
import { ARTISTS, getArtist } from '../data/artists';

// ⚠️ 데모용 "가짜 백엔드": 스튜디오·관리자 데이터를 브라우저 localStorage 하나에 모아 저장합니다.
// 실제 서비스에서는 각 항목이 API(채널·방송·업로드·심사·신고 서비스)로 분리됩니다.

const KEY = 'megaview:studio';
const DEFAULT = {
  channelId: 'novax',   // 스튜디오에서 관리 중인 채널 (데모: 자유롭게 전환)
  channels: {},         // 채널 설정 덮어쓰기 {id: {intro, colors, tags, notice, perks}}
  streamKeys: {},       // {id: 'live_xxx'}
  broadcast: {},        // 방송 설정 {id: {title, category, ...}}
  onAir: {},            // 방송 중 {id: {startedAt, title, ...}}
  sessions: [],         // 지난 방송 기록
  uploads: [],          // 업로드한 영상
  schedules: [],        // 스튜디오에서 예약한 라이브
  chat: {},             // 채팅 설정 {id: {...}}
  reviews: {},          // 콘텐츠 검수 결과 {uploadId: {status, note}}
  appStatus: {},        // (샘플) 입점 신청 심사 결과
  reportStatus: {},     // 신고 처리 결과
  userStatus: {},       // 회원 상태 {email: '정지'}
  liveActions: {},      // 라이브 조치 {liveId: '경고' | '강제 종료'}
};

const load = () => {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return DEFAULT;
  }
};

const randomKey = () => {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const arr = new Uint32Array(24);
  crypto.getRandomValues(arr);
  return 'live_' + Array.from(arr, (n) => chars[n % chars.length]).join('');
};

export const DEFAULT_CHAT = {
  bannedWords: ['욕설', '광고', '도배'],
  slow: 0,
  followerOnly: false,
  blockLinks: true,
  managers: ['별빛팬', 'moonlight_22'],
  blocked: [],
};

// 업로드 처리 단계: 시간 경과로 계산 (업로드 → 트랜스코딩 → 검수 대기), 이후 운영자 검수 결과 반영
export const UPLOAD_STEPS = ['업로드', '트랜스코딩', '운영자 검수', '게시'];
export function uploadState(u, review, now = Date.now()) {
  if (review) return { status: review.status, step: review.status === '게시됨' ? 4 : 2, progress: 1, note: review.note };
  const t = (now - u.createdAt) / 1000;
  if (t < 4) return { status: '업로드 중', step: 0, progress: t / 4 };
  if (t < 10) return { status: '트랜스코딩 중', step: 1, progress: (t - 4) / 6 };
  return { status: '검수 대기', step: 2, progress: 0 };
}

// 관리자 콘솔이 비어 보이지 않도록 넣어둔 샘플 업로드
export const SEED_UPLOADS = [
  { id: 'seed-up-1', channelId: 'petalbomb', title: '#BLOOM챌린지 비하인드 (릴스)', type: '릴스', visibility: '공개', age: 'ALL', fileName: 'bloom_behind_final.mp4', size: 48_200_000, createdAt: Date.now() - 3600_000 * 5, desc: '챌린지 촬영 현장 비하인드' },
  { id: 'seed-up-2', channelId: 'echo9', title: '연습생 404호 21화 (스페셜)', type: '숏드라마 회차', visibility: '멤버십 전용', age: '12', fileName: 'trainee404_ep21_master.mov', size: 812_000_000, createdAt: Date.now() - 3600_000 * 26, desc: '시즌 종료 기념 스페셜 에피소드' },
];

const StudioContext = createContext(null);

export function StudioProvider({ children }) {
  const [s, setS] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s]);

  const set = (key, fn) => setS((p) => ({ ...p, [key]: typeof fn === 'function' ? fn(p[key]) : fn }));
  // 맵 형태 항목의 한 칸 수정: 객체면 병합, 아니면 값 교체, undefined면 삭제
  const setIn = (key, id, patch) =>
    set(key, (m) => {
      const next = { ...m };
      if (patch === undefined) delete next[id];
      else if (patch && typeof patch === 'object' && !Array.isArray(patch)) next[id] = { ...(m[id] || {}), ...patch };
      else next[id] = patch;
      return next;
    });

  const base = getArtist(s.channelId) || ARTISTS[0];
  const channel = { ...base, ...(s.channels[base.id] || {}) };

  const value = {
    ...s,
    channel,
    setChannelId: (id) => set('channelId', id),
    updateChannel: (id, patch) => setIn('channels', id, patch),

    regenKey: (id) => setIn('streamKeys', id, randomKey()),
    getBroadcast: (id) => ({
      title: `${getArtist(id)?.name} 라이브`,
      category: '일상',
      tags: '',
      membersOnly: false,
      quality: '1080p60',
      latency: '초저지연',
      chat: true,
      ...(s.broadcast[id] || {}),
    }),
    saveBroadcast: (id, data) => setIn('broadcast', id, data),
    startBroadcast: (id, data) => setIn('onAir', id, { ...data, startedAt: Date.now() }),
    endBroadcast: (id, summary) => {
      setIn('onAir', id, undefined);
      set('sessions', (arr) => [{ id: `ses-${Date.now()}`, channelId: id, ...summary }, ...arr].slice(0, 50));
    },

    getChat: (id) => ({ ...DEFAULT_CHAT, ...(s.chat[id] || {}) }),
    updateChat: (id, patch) => setIn('chat', id, { ...DEFAULT_CHAT, ...(s.chat[id] || {}), ...patch }),

    addUpload: (u) => set('uploads', (arr) => [{ ...u, id: `up-${Date.now()}`, createdAt: Date.now() }, ...arr]),
    removeUpload: (id) => set('uploads', (arr) => arr.filter((u) => u.id !== id)),
    allUploads: [...s.uploads, ...SEED_UPLOADS],
    setReview: (id, status, note) => setIn('reviews', id, { status, note, at: Date.now() }),
    clearReview: (id) => setIn('reviews', id, undefined),

    addSchedule: (item) => set('schedules', (arr) => [...arr, { ...item, id: `sch-${Date.now()}` }]),
    removeSchedule: (id) => set('schedules', (arr) => arr.filter((x) => x.id !== id)),

    setAppStatus: (id, status, note) => setIn('appStatus', id, { status, note, at: Date.now() }),
    setReportStatus: (id, status) => setIn('reportStatus', id, { status, at: Date.now() }),
    setUserStatus: (email, status) => setIn('userStatus', email, status),
    setLiveAction: (id, action) => setIn('liveActions', id, action),
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export const useStudio = () => useContext(StudioContext);
