// 공개 샘플 영상 (CC 라이선스). 실제 영상은 public/videos 에 넣고 '/videos/파일명.mp4' 로 교체하세요.
export const VIDEOS = [
  'https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4',
  'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4',
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
];

// 임시 이미지 (picsum). 실제 포스터·썸네일 URL로 교체하세요.
export const img = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const formatCount = (n) => {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}만`;
  return n.toLocaleString('ko-KR');
};
