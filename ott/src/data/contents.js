// VOD 콘텐츠 목업 데이터. 실제 서비스에서는 API 응답으로 대체하세요.
import { getArtist } from './artists';
import { img, VIDEOS } from './media';

export const CATEGORIES = {
  drama: '숏드라마',
  show: '아이돌 예능',
  concert: '공연',
};

const RAW = [
  // 숏드라마 (회당 2~8분)
  { id: 'first-love-rehearsal', title: '첫사랑 리허설', type: 'drama', artistIds: ['novax', 'lumine'], genres: ['로맨스', '청춘'], year: 2026, age: '12', rating: 9.2, episodeCount: 24, tags: ['original', 'new'], popularity: 99, desc: '졸업 공연 리허설에서 다시 만난 첫사랑. NOVA:X 리온과 LUMINE 하린이 주연을 맡은, 3분마다 설레는 숏드라마.' },
  { id: 'trainee-404', title: '연습생 404호', type: 'drama', artistIds: ['echo9'], genres: ['코미디', '성장'], year: 2026, age: 'ALL', rating: 8.8, episodeCount: 20, tags: ['original', 'new'], popularity: 93, desc: '기숙사 404호에 모인 연습생 여섯 명. 데뷔조 발표까지 남은 시간은 단 한 달, 그런데 방에서 자꾸 이상한 일이 생긴다.' },
  { id: 'debut-d30', title: '데뷔까지 D-30', type: 'drama', artistIds: ['voltz'], genres: ['드라마', '성장'], year: 2025, age: '12', rating: 8.6, episodeCount: 30, tags: [], popularity: 88, desc: '데뷔 무산 위기의 7인조. 남은 30일 동안 그들은 무대에 설 수 있을까. VOLTZ 멤버 전원 출연.' },
  { id: 'convenience-idol', title: '편의점 아이돌', type: 'drama', artistIds: ['kanghyun', 'petalbomb'], genres: ['로맨틱코미디'], year: 2025, age: '12', rating: 8.4, episodeCount: 18, tags: [], popularity: 85, desc: '은퇴한 톱 아이돌이 동네 편의점 야간 알바로 위장 취업했다. 그런데 단골 손님이 하필 그의 찐팬이라면?' },
  { id: 'behind-stage', title: '무대 뒤의 너', type: 'drama', artistIds: ['moonveil'], genres: ['미스터리', '로맨스'], year: 2026, age: '15', rating: 8.9, episodeCount: 16, tags: ['original'], popularity: 90, desc: '콘서트 당일 사라진 멤버, 무대 뒤에 남겨진 쪽지 한 장. MOONVEIL이 직접 연기하는 미스터리 숏드라마.' },
  { id: 'encore-confess', title: '고백은 앵콜로', type: 'drama', artistIds: ['seoha', 'kanghyun'], genres: ['로맨스', '음악'], year: 2025, age: 'ALL', rating: 8.3, episodeCount: 12, tags: [], popularity: 80, desc: '무명 싱어송라이터와 그녀의 노래를 몰래 듣던 배우. 앵콜 무대에서 시작되는 음악 로맨스.' },
  { id: 'secret-fanmeeting', title: '비밀 팬미팅', type: 'drama', artistIds: ['petalbomb'], genres: ['코미디'], year: 2026, age: 'ALL', rating: 7.9, episodeCount: 15, tags: ['new'], popularity: 74, desc: '팬 한 명만을 위한 비밀 팬미팅이 열린다. 당첨된 사람은 다름 아닌 라이벌 그룹의 매니저?!' },
  { id: 'my-manager', title: '나의 매니저님', type: 'drama', artistIds: ['novax'], genres: ['로맨스', '오피스'], year: 2025, age: '12', rating: 8.1, episodeCount: 20, tags: [], popularity: 78, desc: '까칠한 신입 매니저와 사고뭉치 막내 아이돌의 하루하루. NOVA:X 한별 첫 주연작.' },

  // 아이돌 예능
  { id: 'novax-escape', title: 'NOVA:X 숙소 대탈출', type: 'show', artistIds: ['novax'], genres: ['버라이어티'], year: 2026, age: 'ALL', rating: 8.7, episodeCount: 8, tags: ['original'], popularity: 89, desc: '숙소에 갇힌 다섯 멤버! 미션을 풀어야만 문이 열린다. NOVA:X의 리얼 탈출 버라이어티.' },
  { id: 'lumine-trip', title: 'LUMINE 여행일지 in 제주', type: 'show', artistIds: ['lumine'], genres: ['여행'], year: 2025, age: 'ALL', rating: 8.2, episodeCount: 6, tags: [], popularity: 82, desc: '데뷔 후 첫 단체 여행. 매니저 없이 떠난 LUMINE 네 멤버의 3박 4일.' },
  { id: 'voltz-random', title: 'VOLTZ 랜덤게임 천국', type: 'show', artistIds: ['voltz'], genres: ['게임', '버라이어티'], year: 2026, age: 'ALL', rating: 8.5, episodeCount: 10, tags: ['new'], popularity: 84, desc: '벌칙은 멤버들이 직접 정한다. 웃음이 멈추지 않는 VOLTZ의 랜덤게임 대결.' },
  { id: 'echo9-debut', title: 'ECHO9 데뷔 리얼리티 : 9시의 소년들', type: 'show', artistIds: ['echo9'], genres: ['리얼리티'], year: 2026, age: 'ALL', rating: 8.6, episodeCount: 8, tags: ['original', 'new'], popularity: 86, desc: '매일 밤 9시, 연습생들의 데뷔 서바이벌이 공개된다. ECHO9 탄생의 모든 순간.' },
  { id: 'moonveil-kitchen', title: '문베일 키친', type: 'show', artistIds: ['moonveil'], genres: ['요리'], year: 2025, age: 'ALL', rating: 7.8, episodeCount: 6, tags: [], popularity: 70, desc: '요리 실력 0점 멤버들이 팬들을 위한 한 끼를 준비한다. 과연 무사히 완성할 수 있을까.' },

  // 공연
  { id: 'mega-festa', title: 'MEGAVIEW IDOL FESTA 2026', type: 'concert', artistIds: ['novax', 'lumine', 'voltz', 'moonveil', 'echo9'], genres: ['페스티벌'], year: 2026, age: 'ALL', rating: 9.4, runtime: 180, tags: ['original', 'new'], popularity: 95, desc: '5팀의 아티스트가 한 무대에! MEGAVIEW가 단독 중계한 아이돌 페스티벌 풀버전.' },
  { id: 'moonveil-tour', title: 'MOONVEIL WORLD TOUR [ECLIPSE] IN SEOUL', type: 'concert', artistIds: ['moonveil'], genres: ['콘서트'], year: 2026, age: 'ALL', rating: 9.3, runtime: 150, tags: [], popularity: 92, desc: '첫 월드투어의 서울 앙코르 공연 실황. 미공개 비하인드 영상 포함.' },
  { id: 'voltz-showcase', title: 'VOLTZ 4th Mini Album 쇼케이스', type: 'concert', artistIds: ['voltz'], genres: ['쇼케이스'], year: 2026, age: 'ALL', rating: 8.4, runtime: 70, tags: [], popularity: 79, desc: '신곡 무대 최초 공개! 멤버들이 직접 들려주는 앨범 비하인드 토크까지.' },
  { id: 'seoha-summer', title: '서하 단독 콘서트 〈여름밤〉', type: 'concert', artistIds: ['seoha'], genres: ['콘서트'], year: 2025, age: 'ALL', rating: 8.9, runtime: 125, tags: [], popularity: 76, desc: '여름밤 야외 공연장을 가득 채운 서하의 목소리. 어쿠스틱 편곡 무대 수록.' },
  { id: 'petal-fancon', title: 'PETAL BOMB 1st FANCON ‘BLOOM’', type: 'concert', artistIds: ['petalbomb'], genres: ['팬콘서트'], year: 2026, age: 'ALL', rating: 8.2, runtime: 110, tags: [], popularity: 72, desc: '데뷔 첫 팬콘서트. 팬들과 함께한 게임 코너와 챌린지 무대.' },
];

const EP_SUMMARIES = [
  '예상치 못한 만남이 모든 것을 바꾸기 시작한다.',
  '숨겨왔던 비밀 하나가 수면 위로 떠오른다.',
  '서로를 향한 오해가 깊어지고, 선택의 순간이 다가온다.',
  '연습실 불이 꺼진 뒤, 진짜 이야기가 시작된다.',
  '모두가 지켜보는 무대 위, 돌이킬 수 없는 실수.',
  '드디어 전해진 진심. 하지만 타이밍이 엇갈린다.',
];

export const CONTENTS = RAW.map((c, i) => ({
  ...c,
  poster: img(`mv-${c.id}-poster`, 400, 600),
  backdrop: img(`mv-${c.id}-bg`, 1600, 900),
  video: VIDEOS[i % VIDEOS.length],
  episodes:
    c.type === 'concert'
      ? []
      : Array.from({ length: c.episodeCount }, (_, k) => ({
          no: k + 1,
          title: `${k + 1}화`,
          summary: EP_SUMMARIES[(i + k) % EP_SUMMARIES.length],
          duration: c.type === 'drama' ? 2 + ((i * 3 + k) % 7) : 18 + ((i + k * 3) % 10),
          thumb: img(`mv-${c.id}-ep${k + 1}`, 480, 270),
          video: VIDEOS[(i + k) % VIDEOS.length],
        })),
}));

export const isSeries = (c) => c.type !== 'concert';
export const getContent = (id) => CONTENTS.find((c) => c.id === id);
export const byType = (type) => CONTENTS.filter((c) => c.type === type);
export const byArtist = (artistId) => byPopularity(CONTENTS.filter((c) => c.artistIds.includes(artistId)));
export const byPopularity = (list = CONTENTS) => [...list].sort((a, b) => b.popularity - a.popularity);
export const top10 = () => byPopularity().slice(0, 10);
export const newReleases = (type) =>
  byPopularity(CONTENTS.filter((c) => c.tags.includes('new') && (!type || c.type === type)));
export const originals = (type) =>
  byPopularity(CONTENTS.filter((c) => c.tags.includes('original') && (!type || c.type === type)));

export const similarTo = (content) =>
  byPopularity(
    CONTENTS.filter(
      (c) =>
        c.id !== content.id &&
        (c.artistIds.some((a) => content.artistIds.includes(a)) || c.type === content.type)
    )
  ).slice(0, 12);

export const searchContents = (q) => {
  const k = q.trim().toLowerCase();
  if (!k) return [];
  return CONTENTS.filter(
    (c) =>
      c.title.toLowerCase().includes(k) ||
      c.genres.some((g) => g.includes(k)) ||
      CATEGORIES[c.type].includes(k) ||
      c.artistIds.some((id) => {
        const a = getArtist(id);
        return a.name.toLowerCase().includes(k) || a.ko.includes(k) || a.members.some((m) => m.includes(k));
      })
  );
};

export const allGenres = (list = CONTENTS) => [...new Set(list.flatMap((c) => c.genres))];

export const metaLine = (c) => {
  if (c.type === 'concert') return [c.year, CATEGORIES[c.type], `${c.runtime}분`].join(' · ');
  const avg = Math.round(c.episodes.reduce((s, e) => s + e.duration, 0) / c.episodes.length);
  return [c.year, CATEGORIES[c.type], `${c.episodes.length}부작`, `회당 ${avg}분`].join(' · ');
};

export const artistNames = (c) => c.artistIds.map((id) => getArtist(id)?.name).filter(Boolean).join(', ');
