// 릴스(숏폼) 목업 데이터
import { img, VIDEOS } from './media';

const RAW = [
  ['novax', '연습실 비하인드 🔥 칼군무 원테이크', ['연습실', '퍼포먼스']],
  ['petalbomb', '#BLOOM챌린지 같이 해요 🌸', ['챌린지']],
  ['moonveil', '월드투어 마지막 날 무대 뒤 🌙', ['비하인드', '월드투어']],
  ['lumine', '하린이의 첫 숏드라마 촬영 현장 🎬', ['첫사랑리허설', '촬영장']],
  ['voltz', '랜덤게임 벌칙 레전드 ㅋㅋㅋ', ['예능', '레전드']],
  ['seoha', '새벽 2시, 기타 하나로 부른 신곡 🎸', ['라이브', '어쿠스틱']],
  ['echo9', '데뷔 D-1 멤버들의 각오 💪', ['데뷔', '9시의소년들']],
  ['kanghyun', '〈편의점 아이돌〉 NG 모음 😂', ['NG', '숏드라마']],
  ['novax', '리온 X 하린 대본 리딩 현장', ['첫사랑리허설']],
  ['petalbomb', '멤버들이 직접 찍은 브이로그 📹', ['브이로그']],
  ['moonveil', '세라의 메이크업 튜토리얼 💄', ['뷰티']],
  ['voltz', '7명이 한 번에 부르는 라이브 🎤', ['라이브']],
  ['lumine', '제주 여행 미공개 컷 🌊', ['여행일지']],
  ['echo9', '막내 시온의 첫 직캠 🎥', ['직캠']],
  ['seoha', '팬이 보내준 사연으로 만든 노래', ['팬송']],
  ['kanghyun', 'OST 녹음실 비하인드 🎧', ['OST', '녹음실']],
];

const COMMENTS = [
  ['별빛팬', '이거 무한 반복 중 ㅠㅠ'],
  ['moonlight_22', '오늘도 레전드 갱신했다'],
  ['하트뿅', '챌린지 따라 해봤는데 너무 어려워요ㅋㅋ'],
  ['데뷔축하', '본편도 꼭 보러 갈게요!'],
  ['ㅇㅇ', '알고리즘 감사합니다 🙏'],
  ['팬1호', '숏드라마에서 보고 입덕했어요'],
];

export const SHORTS = RAW.map(([artistId, caption, tags], i) => ({
  id: `s${i + 1}`,
  artistId,
  caption,
  tags,
  likes: 12000 + ((i * 7919) % 180000),
  comments: COMMENTS.map((c, k) => ({ nick: c[0], text: c[1], id: `${i}-${k}` })).slice(0, 3 + (i % 4)),
  commentCount: 300 + ((i * 271) % 4000),
  video: VIDEOS[i % VIDEOS.length],
  startAt: (i * 13) % 40, // 같은 샘플 영상이라도 다른 구간을 보여주기 위함
  thumb: img(`short-${i}`, 360, 640),
}));

export const getShort = (id) => SHORTS.find((s) => s.id === id);
export const shortsByArtist = (artistId) => SHORTS.filter((s) => s.artistId === artistId);
export const popularShorts = () => [...SHORTS].sort((a, b) => b.likes - a.likes);
export const searchShorts = (q) => {
  const k = q.trim();
  if (!k) return [];
  return SHORTS.filter((s) => s.caption.includes(k) || s.tags.some((t) => t.includes(k)));
};
