// 시연 · 테스트용 데모 계정 (어느 브라우저에서든 바로 로그인 가능)
// ⚠️ 데모 전용 값입니다. 실제 서비스에서는 절대 코드에 계정 정보를 넣지 마세요.
export const DEMO_ACCOUNTS = [
  {
    name: '데모팬',
    email: 'fan@megaview.demo',
    password: 'demo1234',
    plan: '팬 패스',
    role: '팬 (멤버십 이용 중)',
    joinedAt: new Date('2026-01-15').getTime(),
  },
  {
    name: '데모운영자',
    email: 'admin@megaview.demo',
    password: 'admin1234',
    plan: 'MEGA PASS',
    role: '스튜디오 · 관리자 콘솔 시연',
    joinedAt: new Date('2025-11-01').getTime(),
  },
];
