// 관리자 콘솔 샘플 데이터 (가상)
const H = 3600_000;
const now = Date.now();

export const SEED_APPLICATIONS = [
  { id: 'seed-app-1', channel: 'STARLIGHT ent. 공식', type: '기획사', manager: '김하늘', email: 'partner@starlight.example', formats: ['숏드라마', '라이브', '릴스(숏폼)'], intro: '신인 걸그룹 데뷔 준비 중인 기획사입니다. 데뷔 리얼리티와 숏드라마를 함께 운영하려 합니다.', submittedAt: now - 30 * H, owner: 'sample' },
  { id: 'seed-app-2', channel: '다온필름', type: '콘텐츠 제작사', manager: '이도윤', email: 'hello@daonfilm.example', formats: ['숏드라마'], intro: '세로형 숏드라마 전문 제작사입니다. 아이돌 캐스팅 작품 3편을 공급할 예정입니다.', submittedAt: now - 52 * H, owner: 'sample' },
  { id: 'seed-app-3', channel: '하윤 HAYOON', type: '아티스트 · 개인', manager: '하윤', email: 'hayoon@example.com', formats: ['라이브', '릴스(숏폼)'], intro: '커버곡 위주로 활동하는 솔로 보컬리스트입니다.', submittedAt: now - 8 * H, owner: 'sample' },
  { id: 'seed-app-4', channel: 'NOVA:X OFFICIAL', type: '기획사', manager: '박지훈', email: 'nx@stellar.example', formats: ['라이브'], intro: '중복 신청입니다.', submittedAt: now - 75 * H, owner: 'sample' },
];

export const REPORTS = [
  { id: 'rp1', type: '채팅 욕설', target: 'spam_bot99', where: 'MOONVEIL 라이브 채팅', reporter: '별빛팬', detail: '반복적으로 욕설과 도배를 하고 있어요.', at: now - 0.4 * H },
  { id: 'rp2', type: '스팸 · 광고', target: 'free_coin_kr', where: 'NOVA:X 라이브 채팅', reporter: '하트뿅뿅', detail: '외부 코인 사이트 링크를 계속 올립니다.', at: now - 1.2 * H },
  { id: 'rp3', type: '저작권', target: '무단 업로드 릴스', where: '릴스 s7', reporter: '웨이브라인 (권리자)', detail: '미공개 연습 영상이 허락 없이 게시되었습니다.', at: now - 3 * H },
  { id: 'rp4', type: '사칭', target: 'LUMINE_haarin', where: '회원 프로필', reporter: 'BLOOM 뮤직', detail: '멤버 하린을 사칭하는 계정입니다.', at: now - 6 * H },
  { id: 'rp5', type: '부적절한 영상', target: '라이브 l2 일부 구간', where: 'NOVA:X 라이브', reporter: '익명', detail: '방송 중 부적절한 장면이 송출되었다는 신고.', at: now - 9 * H },
  { id: 'rp6', type: '채팅 욕설', target: 'angry_fan', where: 'VOLTZ 라이브 채팅', reporter: '데뷔축하해', detail: '다른 팬들에게 공격적인 발언.', at: now - 20 * H },
];

export const SEED_USERS = [
  ['별빛팬', 'starlight***@example.com', '팬 패스', 410],
  ['moonlight_22', 'moon22***@example.com', 'MEGA PASS', 380],
  ['하트뿅뿅', 'heart***@example.com', null, 120],
  ['spam_bot99', 'bot99***@example.com', null, 2],
  ['데뷔축하해', 'debut***@example.com', '팬 패스', 64],
  ['free_coin_kr', 'coin***@example.com', null, 1],
  ['새벽감성', 'dawn***@example.com', 'MEGA PASS', 245],
  ['angry_fan', 'angry***@example.com', null, 33],
].map(([name, email, plan, days]) => ({ name, email, plan, joinedAt: now - days * 24 * H, sample: true }));

export const SERVICES = [
  { name: 'API 게이트웨이', kind: 'EKS', base: 42, inst: 6 },
  { name: '회원 · 인증', kind: 'EKS', base: 38, inst: 3 },
  { name: '콘텐츠 · 검색 API', kind: 'EKS', base: 55, inst: 4 },
  { name: '실시간 채팅 (WebSocket)', kind: 'EKS', base: 24, inst: 8 },
  { name: '라이브 수집 · 송출', kind: 'IVS', base: 1800, inst: null, unit: 'ms 지연' },
  { name: '영상 변환', kind: 'MediaConvert', base: 0, inst: null, queue: true },
  { name: 'CDN', kind: 'CloudFront', base: 18, inst: null },
  { name: '데이터베이스', kind: 'Aurora', base: 6, inst: 2 },
];

export const DEPLOYS = [
  { id: '#1842', svc: '실시간 채팅', ver: 'v2.14.0', stages: ['빌드', '테스트', 'Trivy 스캔', 'ECR 푸시', 'Argo CD 배포'], result: '성공', at: now - 2 * H },
  { id: '#1839', svc: '콘텐츠 · 검색 API', ver: 'v3.2.1', stages: ['빌드', '테스트', 'Trivy 스캔'], result: '실패', note: 'Trivy: HIGH 취약점 1건 (openssl)', at: now - 5 * H },
  { id: '#1835', svc: 'API 게이트웨이', ver: 'v1.9.4', stages: ['빌드', '테스트', 'Trivy 스캔', 'ECR 푸시', 'Argo CD 배포'], result: '성공', at: now - 26 * H },
];

// 신청 내용 기반 자동 검토 (실서비스에서는 AI 검토 + 규칙 엔진으로 대체 가능)
export function autoReview(app, existingNames) {
  const checks = [];
  checks.push({ ok: !!(app.channel && app.manager && app.email), text: '필수 정보 입력' });
  const dup = existingNames.some((n) => n.toLowerCase().replace(/\s|official|공식/gi, '') === app.channel.toLowerCase().replace(/\s|official|공식/gi, ''));
  checks.push({ ok: !dup, text: dup ? '기존 채널과 이름이 겹쳐요 (사칭 · 중복 확인 필요)' : '채널명 중복 없음' });
  checks.push({ ok: (app.intro || '').length >= 20, text: (app.intro || '').length >= 20 ? '채널 소개 충분' : '채널 소개가 짧아요' });
  const rec = [];
  if (app.formats.includes('라이브')) rec.push('초저지연 라이브 활성화');
  if (app.formats.includes('숏드라마')) rec.push('숏드라마 회차 업로드 권한');
  if (app.formats.includes('릴스(숏폼)')) rec.push('릴스 업로드 권한');
  return { checks, rec, pass: checks.every((c) => c.ok) };
}
