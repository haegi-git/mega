// 라이브 방송 목업 데이터. 시작 시각은 "지금" 기준으로 계산해서 항상 방송 중/예정 항목이 보이게 합니다.
import { img, VIDEOS } from './media';

const MIN = 60 * 1000;
const NOW = Date.now();

// offset: 지금으로부터 몇 분 뒤 시작하는지 (음수 = 이미 시작)
const RAW = [
  { artistId: 'moonveil', title: '🌙 컴백 D-1 카운트다운 라이브', category: '컴백', offset: -35, duration: 120, viewers: 182400 },
  { artistId: 'novax', title: '숙소에서 야식 먹방 라이브 🍜', category: '일상', offset: -12, duration: 90, viewers: 96300 },
  { artistId: 'echo9', title: '데뷔 100일 기념 팬들과 수다 타임', category: '팬미팅', offset: -50, duration: 150, viewers: 41200, membersOnly: true },
  { artistId: 'seoha', title: '새벽 감성 어쿠스틱 라이브 🎸', category: '음악', offset: 90, duration: 60 },
  { artistId: 'voltz', title: 'VOLTZ 5th Mini Album 쇼케이스 생중계', category: '쇼케이스', offset: 240, duration: 90 },
  { artistId: 'lumine', title: 'LUMINE 하린 생일 파티 🎂', category: '팬미팅', offset: 60 * 24 + 60, duration: 90 },
  { artistId: 'petalbomb', title: '#BLOOM챌린지 릴레이 라이브', category: '챌린지', offset: 60 * 26, duration: 60 },
  { artistId: 'kanghyun', title: '〈편의점 아이돌〉 마지막화 같이 보기', category: '단체관람', offset: 60 * 48 + 30, duration: 90 },
  { artistId: 'novax', title: 'NOVA:X 팬콘서트 〈ORBIT〉 생중계', category: '공연', offset: 60 * 72, duration: 150, membersOnly: true },
  { artistId: 'moonveil', title: '컴백 1주차 비하인드 토크', category: '토크', offset: 60 * 98, duration: 60 },
  { artistId: 'echo9', title: 'ECHO9 연습실 최초 공개', category: '일상', offset: 60 * 122, duration: 60 },
  { artistId: 'lumine', title: '신곡 안무 연습 라이브', category: '연습', offset: -60 * 20, duration: 60, viewers: 88000 },
  { artistId: 'voltz', title: 'VOLTZ 랜덤게임 생방송 특집', category: '예능', offset: -60 * 30, duration: 80, viewers: 120500 },
];

export const LIVES = RAW.map((l, i) => {
  const startAt = NOW + l.offset * MIN;
  return {
    ...l,
    id: `l${i + 1}`,
    startAt,
    endAt: startAt + l.duration * MIN,
    viewers: l.viewers || 0,
    thumb: img(`live-${i}`, 640, 360),
    backdrop: img(`live-${i}-bg`, 1600, 900),
    video: VIDEOS[(i + 1) % VIDEOS.length],
  };
});

export const statusOf = (live, now = Date.now()) =>
  now < live.startAt ? 'scheduled' : now < live.endAt ? 'live' : 'ended';

export const getLive = (id) => LIVES.find((l) => l.id === id);
export const liveNow = () =>
  LIVES.filter((l) => statusOf(l) === 'live').sort((a, b) => b.viewers - a.viewers);
export const upcoming = () =>
  LIVES.filter((l) => statusOf(l) === 'scheduled').sort((a, b) => a.startAt - b.startAt);
export const pastLives = () =>
  LIVES.filter((l) => statusOf(l) === 'ended').sort((a, b) => b.startAt - a.startAt);
export const livesByArtist = (artistId) => LIVES.filter((l) => l.artistId === artistId);
export const isArtistLive = (artistId) => liveNow().some((l) => l.artistId === artistId);

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
export const formatTime = (t) =>
  new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
export const formatDay = (t) => {
  const d = new Date(t);
  const today = new Date();
  const diff = Math.round(
    (new Date(d.toDateString()) - new Date(today.toDateString())) / (24 * 60 * MIN)
  );
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEK[d.getDay()]})`;
};
