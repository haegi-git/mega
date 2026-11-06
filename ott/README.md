# MEGAVIEW — 아이돌 숏드라마 · 릴스 · 라이브 플랫폼 (프론트엔드 데모)

웹드라마(숏드라마)로 신규 사용자를 끌어들이고, 출연 아티스트의 채널 · 릴스 · 라이브로 이어지는 K-POP 특화 OTT 데모입니다.
React 18 + Vite + React Router.

> 사용자 흐름: **숏드라마 시청 → 출연 아티스트에 관심 → 아티스트 채널 → VOD · 릴스 · LIVE → 팔로우 · 알림 · 재방문**

## 실행

```bash
cd ott
npm install      # PowerShell에서 막히면 npm.cmd install
npm run dev      # http://localhost:5173
```

## 페이지

| 경로 | 설명 |
|---|---|
| `/` | 홈: 라이브 배너, 지금 라이브 중, 인기 아티스트, 오리지널 숏드라마, 릴스, TOP10, 다가오는 라이브, 입점 안내 |
| `/browse/:type` | 숏드라마 · 아이돌 예능 · 공연 목록 (장르 · 아티스트 필터, 정렬) |
| `/content/:id` | 작품 상세: 회차, **출연 아티스트 → 채널 연결**, 관련 릴스, 비슷한 작품 |
| `/watch/:id?ep=n` | VOD 재생: 이어보기, 다음 화 자동재생, 마지막 화 종료 시 출연 아티스트 채널 추천 |
| `/shorts` | 릴스: 세로 스와이프 피드, 자동재생, 좋아요 · 댓글 · 공유 · 팔로우 |
| `/live` | 라이브 목록: 방송 중 · 방송 예정 · 다시보기 |
| `/live/:id` | 라이브 시청: 실시간 채팅, 하트, 시청자 수, 멤버십 전용 잠금, 예정 방송 카운트다운 · 알림 |
| `/artists`, `/artist/:id` | 아티스트 목록 / 아티스트 채널 (홈 · VOD · 릴스 · 라이브 · 소개) |
| `/schedule` | 라이브 편성표 (7일, 팔로우 아티스트만 보기, 알림 설정) |
| `/partner` | 파트너센터: 아티스트 · 기획사 · 제작사 채널 입점 신청 및 신청 내역 |
| `/subscribe` | 멤버십 (무료 / 팬 패스 / MEGA PASS) — 결제 없음 |
| `/mylist`, `/mypage` | 팔로우 · 찜 · 시청기록 · 좋아요한 릴스 / 마이페이지 |
| `/login`, `/signup` | 로그인 / 회원가입 |

## 구조

```
src/
  data/
    artists.js    가상 아티스트 · 기획사
    contents.js   숏드라마 · 예능 · 공연 VOD
    shorts.js     릴스
    lives.js      라이브 (시작 시각은 "지금" 기준으로 자동 계산)
    media.js      샘플 영상 · 이미지 URL
  context/AppContext.jsx   로그인 · 팔로우 · 찜 · 좋아요 · 알림 · 시청기록 · 입점신청 (localStorage)
  components/              Header, Layout, HeroBanner, ContentRow, ContentCard, ArtistAvatar, Icons
  pages/                   각 페이지
  index.css                전체 스타일
```

## 참고

- 등장하는 아티스트 · 기획사 · 작품은 모두 **가상**입니다.
- 회원 정보 등은 브라우저 localStorage에 저장되는 **데모용**입니다. 실서비스에서는 백엔드 API로 교체해야 합니다.
- 라이브는 샘플 영상을 반복 재생해 실시간처럼 보여주고, 채팅은 시뮬레이션입니다. 실제로는 AWS IVS 같은 라이브 서비스와 WebSocket 채팅으로 연결하면 됩니다.
- 이미지는 picsum.photos 임시 이미지, 영상은 공개 CC 샘플 영상입니다. `src/data/media.js`에서 바꿀 수 있습니다.
