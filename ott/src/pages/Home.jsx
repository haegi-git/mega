import { Link } from 'react-router-dom';
import { ArtistTile } from '../components/ArtistAvatar';
import { ContinueCard, LiveCard, ShortCard } from '../components/ContentCard';
import ContentRow from '../components/ContentRow';
import HeroBanner from '../components/HeroBanner';
import { useApp } from '../context/AppContext';
import { artistsByFollowers, getArtist } from '../data/artists';
import { byPopularity, byType, getContent, metaLine, newReleases, originals, top10 } from '../data/contents';
import { liveNow, upcoming } from '../data/lives';
import { formatCount } from '../data/media';
import { popularShorts } from '../data/shorts';
import { ScheduleList } from './LiveList';

function buildSlides() {
  const slides = [];
  const live = liveNow()[0];
  if (live) {
    const a = getArtist(live.artistId);
    slides.push({
      key: live.id, image: live.backdrop, live: true, badge: '● LIVE NOW',
      title: live.title, sub: `${a.name} · ${formatCount(live.viewers)}명 시청 중`, desc: a.intro,
      artistIds: [a.id],
      primary: { label: '라이브 입장', to: `/live/${live.id}` },
      secondary: { label: '아티스트 채널', to: `/artist/${a.id}` },
    });
  }
  ['first-love-rehearsal', 'mega-festa', 'trainee-404', 'behind-stage'].forEach((id) => {
    const c = getContent(id);
    slides.push({
      key: c.id, image: c.backdrop, age: c.age,
      badge: c.tags.includes('original') ? `MEGAVIEW ORIGINAL ${c.type === 'drama' ? '숏드라마' : ''}` : '추천',
      title: c.title, sub: metaLine(c), desc: c.desc, artistIds: c.artistIds,
      primary: { label: c.type === 'concert' ? '공연 보기' : '1화 바로보기', to: `/watch/${c.id}?ep=1` },
      secondary: { label: '상세정보', to: `/content/${c.id}` },
    });
  });
  return slides;
}

export default function Home() {
  const { user, historyList, follows } = useApp();

  const continueItems = historyList
    .map((h) => ({ h, c: getContent(h.id) }))
    .filter(({ c, h }) => c && h.duration && h.time / h.duration < 0.95);

  const followedNew = byPopularity(
    byPopularity().filter((c) => c.artistIds.some((id) => follows.includes(id)))
  );

  const lives = liveNow();

  return (
    <div className="home">
      <HeroBanner slides={buildSlides()} />
      <div className="home__rows">
        {lives.length > 0 && (
          <ContentRow title={<><span className="dot-live" /> 지금 라이브 중</>} moreLink="/live">
            {lives.map((l) => <LiveCard key={l.id} live={l} />)}
          </ContentRow>
        )}

        <ContentRow title="인기 아티스트" moreLink="/artists">
          {artistsByFollowers().map((a) => <ArtistTile key={a.id} artist={a} />)}
        </ContentRow>

        {user && continueItems.length > 0 && (
          <ContentRow title={`${user.name}님이 보던 콘텐츠`}>
            {continueItems.map(({ c, h }) => <ContinueCard key={c.id} content={c} progress={h} />)}
          </ContentRow>
        )}

        <ContentRow title="MEGAVIEW 오리지널 숏드라마" items={originals('drama')} moreLink="/browse/drama" />

        <ContentRow title="지금 뜨는 릴스" moreLink="/shorts">
          {popularShorts().slice(0, 12).map((s) => <ShortCard key={s.id} short={s} />)}
        </ContentRow>

        <ContentRow title="오늘의 TOP 10" items={top10()} ranked />

        {user && followedNew.length > 0 && (
          <ContentRow title="팔로우한 아티스트의 콘텐츠" items={followedNew} />
        )}

        <ContentRow title="새로 올라온 숏드라마" items={newReleases('drama').concat(byType('drama').filter((c) => !c.tags.includes('new')))} moreLink="/browse/drama" />
        <ContentRow title="아이돌 자체 예능" items={byPopularity(byType('show'))} moreLink="/browse/show" />

        <section className="row home__schedule">
          <div className="row__head">
            <h2>다가오는 라이브</h2>
            <Link to="/schedule" className="row__more">편성표 보기 ›</Link>
          </div>
          <div className="home__schedule-body">
            <ScheduleList lives={upcoming().slice(0, 4)} />
          </div>
        </section>

        <ContentRow title="공연 실황 다시보기" items={byPopularity(byType('concert'))} moreLink="/browse/concert" />

        <section className="promo">
          <div>
            <span className="hero__badge">FOR ARTISTS & STUDIOS</span>
            <h2>당신의 아티스트, 당신의 채널</h2>
            <p>숏드라마부터 라이브까지 — 기획사와 제작사라면 지금 MEGAVIEW에 채널을 열어보세요.</p>
          </div>
          <Link to="/partner" className="btn btn--lg btn--light">입점 신청하기</Link>
        </section>
      </div>
    </div>
  );
}
