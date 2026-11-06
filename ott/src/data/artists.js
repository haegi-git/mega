import { img } from './media';

// 가상의 아티스트 · 기획사입니다. (실존 인물·그룹과 무관)
const RAW = [
  {
    id: 'novax', name: 'NOVA:X', ko: '노바엑스', mark: 'NX', kind: '보이그룹', agency: '스텔라 엔터테인먼트',
    debut: 2023, followers: 1820000, colors: ['#7c3aed', '#ec4899'],
    members: ['리온', '태하', '준', '시우', '한별'], tags: ['퍼포먼스', '자체제작'],
    intro: '“우주에서 온 소년들” 콘셉트로 데뷔한 5인조 보이그룹. 칼군무와 매주 공개되는 자체 예능으로 사랑받고 있다.',
  },
  {
    id: 'lumine', name: 'LUMINE', ko: '루미네', mark: 'LU', kind: '걸그룹', agency: 'BLOOM 뮤직',
    debut: 2024, followers: 1340000, colors: ['#f59e0b', '#ec4899'],
    members: ['하린', '유나', '소이', '채원'], tags: ['청량', '보컬'],
    intro: '빛처럼 맑은 음색의 4인조 걸그룹. 멤버 하린은 숏드라마 〈첫사랑 리허설〉로 배우 활동도 시작했다.',
  },
  {
    id: 'seoha', name: 'SEOHA', ko: '서하', mark: '서하', kind: '솔로', agency: '오르골 레코즈',
    debut: 2021, followers: 960000, colors: ['#06b6d4', '#6366f1'],
    members: [], tags: ['싱어송라이터', '어쿠스틱'],
    intro: '직접 곡을 쓰고 부르는 싱어송라이터. 새벽 감성 라이브로 유명하다.',
  },
  {
    id: 'voltz', name: 'VOLTZ', ko: '볼츠', mark: 'VZ', kind: '보이그룹', agency: '하이볼트 엔터',
    debut: 2022, followers: 1510000, colors: ['#22c55e', '#06b6d4'],
    members: ['도윤', '카이', '민혁', '레오', '지환', '우빈', '태오'], tags: ['에너지', '예능캐'],
    intro: '무대 위 에너지는 고압 전류급! 7인조 보이그룹 VOLTZ. 예능감으로도 유명하다.',
  },
  {
    id: 'moonveil', name: 'MOONVEIL', ko: '문베일', mark: 'MV', kind: '걸그룹', agency: '스텔라 엔터테인먼트',
    debut: 2022, followers: 2100000, colors: ['#6366f1', '#a855f7'],
    members: ['세라', '지안', '루나', '다인', '예서'], tags: ['몽환', '월드투어'],
    intro: '달빛 아래 베일을 쓴 소녀들. 몽환적인 콘셉트와 라이브 실력으로 첫 월드투어를 성공적으로 마쳤다.',
  },
  {
    id: 'kanghyun', name: 'KANG HYUN', ko: '강현', mark: '강현', kind: '솔로', agency: '필름앤송',
    debut: 2020, followers: 780000, colors: ['#ef4444', '#f97316'],
    members: [], tags: ['배우', 'OST'],
    intro: '가수 겸 배우. 숏드라마 〈편의점 아이돌〉, 〈고백은 앵콜로〉의 주연이자 OST까지 직접 불렀다.',
  },
  {
    id: 'petalbomb', name: 'PETAL BOMB', ko: '페탈밤', mark: 'PB', kind: '걸그룹', agency: 'BLOOM 뮤직',
    debut: 2025, followers: 640000, colors: ['#ec4899', '#f43f5e'],
    members: ['나비', '소희', '아라', '미유'], tags: ['챌린지', '러블리'],
    intro: '꽃잎처럼 터지는 매력! 데뷔곡 챌린지로 숏폼에서 먼저 뜬 4인조 걸그룹.',
  },
  {
    id: 'echo9', name: 'ECHO9', ko: '에코나인', mark: 'E9', kind: '보이그룹', agency: '웨이브라인',
    debut: 2026, followers: 310000, colors: ['#14b8a6', '#84cc16'], rookie: true,
    members: ['현', '이안', '건', '루크', '태린', '시온'], tags: ['신인', '리얼리티'],
    intro: '데뷔 리얼리티 〈9시의 소년들〉로 탄생한 2026년 신인 보이그룹.',
  },
];

export const ARTISTS = RAW.map((a) => ({
  ...a,
  banner: img(`${a.id}-banner`, 1600, 600),
  photo: img(`${a.id}-photo`, 600, 600),
}));

export const getArtist = (id) => ARTISTS.find((a) => a.id === id);
export const artistsByFollowers = () => [...ARTISTS].sort((a, b) => b.followers - a.followers);

export const ARTIST_FILTERS = {
  전체: () => true,
  보이그룹: (a) => a.kind === '보이그룹',
  걸그룹: (a) => a.kind === '걸그룹',
  솔로: (a) => a.kind === '솔로',
  신인: (a) => a.rookie || a.debut >= 2025,
};

export const searchArtists = (q) => {
  const k = q.trim().toLowerCase();
  if (!k) return [];
  return ARTISTS.filter(
    (a) =>
      a.name.toLowerCase().includes(k) ||
      a.ko.includes(k) ||
      a.agency.toLowerCase().includes(k) ||
      a.members.some((m) => m.includes(k))
  );
};
