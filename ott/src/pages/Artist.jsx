import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArtistAvatar, { FollowButton, gradientOf } from '../components/ArtistAvatar';
import ContentCard, { LiveCard, ShortCard } from '../components/ContentCard';
import ContentRow from '../components/ContentRow';
import { useApp } from '../context/AppContext';
import { getArtist } from '../data/artists';
import { byArtist } from '../data/contents';
import { livesByArtist, statusOf } from '../data/lives';
import { formatCount } from '../data/media';
import { shortsByArtist } from '../data/shorts';
import { ScheduleList } from './LiveList';
import NotFound from './NotFound';

export default function Artist() {
  const { id } = useParams();
  const artist = getArtist(id);
  const [tab, setTab] = useState('home');
  const { isFollowing } = useApp();

  if (!artist) return <NotFound />;

  const vods = byArtist(artist.id);
  const shorts = shortsByArtist(artist.id);
  const lives = livesByArtist(artist.id);
  const onAir = lives.filter((l) => statusOf(l) === 'live');
  const next = lives.filter((l) => statusOf(l) === 'scheduled').sort((a, b) => a.startAt - b.startAt);
  const past = lives.filter((l) => statusOf(l) === 'ended');
  const followers = artist.followers + (isFollowing(artist.id) ? 1 : 0);

  const tabs = [
    ['home', '홈'],
    ['vod', `VOD ${vods.length}`],
    ['shorts', `릴스 ${shorts.length}`],
    ['live', `라이브 ${lives.length}`],
    ['about', '소개'],
  ];

  return (
    <div className="channel" style={{ '--a1': artist.colors[0], '--a2': artist.colors[1] }}>
      <section className="channel__banner" style={{ backgroundImage: `url(${artist.banner})` }}>
        <div className="channel__shade" />
      </section>
      <section className="channel__head">
        <ArtistAvatar artist={artist} size={128} link={false} />
        <div className="channel__meta">
          <span className="channel__kind">{artist.kind} · {artist.agency}</span>
          <h1>{artist.name} <small>{artist.ko}</small></h1>
          <p>팔로워 <b>{formatCount(followers)}</b> · VOD {vods.length} · 릴스 {shorts.length} · {artist.debut} 데뷔</p>
          <div className="channel__tags">{artist.tags.map((t) => <span key={t}>#{t}</span>)}</div>
        </div>
        <div className="channel__actions">
          <FollowButton artist={artist} />
        </div>
      </section>

      {onAir[0] && (
        <Link to={`/live/${onAir[0].id}`} className="channel__onair" style={{ background: gradientOf(artist) }}>
          <span className="badge-live">LIVE</span>
          <strong>{onAir[0].title}</strong>
          <span>{formatCount(onAir[0].viewers)}명 시청 중 · 지금 입장하기 →</span>
        </Link>
      )}

      <div className="channel__body">
        <div className="tabs">
          {tabs.map(([k, label]) => (
            <button key={k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {tab === 'home' && (
          <div className="channel__home">
            <ContentRow title="출연 · 자체 콘텐츠" items={vods} />
            <ContentRow title="릴스">
              {shorts.map((s) => <ShortCard key={s.id} short={s} />)}
            </ContentRow>
            {next.length > 0 && (
              <section className="channel__section">
                <h2 className="section-title">다가오는 라이브</h2>
                <ScheduleList lives={next.slice(0, 3)} />
              </section>
            )}
          </div>
        )}

        {tab === 'vod' && (
          vods.length ? <div className="grid">{vods.map((c) => <ContentCard key={c.id} content={c} />)}</div>
            : <div className="empty"><p>아직 등록된 VOD가 없어요.</p></div>
        )}

        {tab === 'shorts' && (
          <div className="grid grid--shorts">{shorts.map((s) => <ShortCard key={s.id} short={s} />)}</div>
        )}

        {tab === 'live' && (
          <>
            {onAir.length > 0 && (
              <div className="grid grid--live" style={{ marginBottom: 32 }}>{onAir.map((l) => <LiveCard key={l.id} live={l} />)}</div>
            )}
            <h2 className="section-title">방송 예정</h2>
            <ScheduleList lives={next} />
            {past.length > 0 && (
              <>
                <h2 className="section-title">지난 라이브</h2>
                <div className="grid grid--live">{past.map((l) => <LiveCard key={l.id} live={l} />)}</div>
              </>
            )}
          </>
        )}

        {tab === 'about' && (
          <div className="about">
            <p className="about__intro">{artist.intro}</p>
            <dl className="info-table">
              <dt>소속</dt><dd>{artist.agency}</dd>
              <dt>데뷔</dt><dd>{artist.debut}년</dd>
              <dt>구분</dt><dd>{artist.kind}</dd>
              {artist.members.length > 0 && (<><dt>멤버</dt><dd>{artist.members.join(' · ')}</dd></>)}
            </dl>
            {artist.members.length > 0 && (
              <div className="members">
                {artist.members.map((m, i) => (
                  <div key={m} className="member">
                    <span style={{ background: gradientOf(artist), filter: `hue-rotate(${i * 25}deg)` }}>{m[0]}</span>
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
