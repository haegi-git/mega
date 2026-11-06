import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArtist } from '../data/artists';
import ArtistAvatar from './ArtistAvatar';
import { AgeBadge } from './ContentCard';
import { InfoIcon, PlayIcon } from './Icons';

/**
 * slides: [{ key, image, badge, live, title, sub, desc, age, artistIds, primary:{label,to}, secondary:{label,to} }]
 */
export default function HeroBanner({ slides }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length, idx]);

  const s = slides[idx];

  return (
    <section className="hero">
      {slides.map((item, i) => (
        <div
          key={item.key}
          className={`hero__bg ${i === idx ? 'is-active' : ''}`}
          style={{ backgroundImage: `url(${item.image})` }}
        />
      ))}
      <div className="hero__shade" />
      <div className="hero__content" key={s.key}>
        <span className={`hero__badge ${s.live ? 'hero__badge--live' : ''}`}>{s.badge}</span>
        <h1 className="hero__title">{s.title}</h1>
        <div className="hero__meta">
          {s.age && <AgeBadge age={s.age} />}
          <span>{s.sub}</span>
        </div>
        <p className="hero__desc">{s.desc}</p>
        {s.artistIds?.length > 0 && (
          <div className="hero__artists">
            {s.artistIds.slice(0, 5).map((id) => {
              const a = getArtist(id);
              return (
                <Link key={id} to={`/artist/${id}`} className="hero__artist">
                  <ArtistAvatar artist={a} size={30} link={false} />
                  {a.name}
                </Link>
              );
            })}
          </div>
        )}
        <div className="hero__actions">
          <Link to={s.primary.to} className={`btn btn--lg ${s.live ? 'btn--live' : 'btn--grad'}`}>
            <PlayIcon width={20} height={20} /> {s.primary.label}
          </Link>
          <Link to={s.secondary.to} className="btn btn--ghost btn--lg">
            <InfoIcon width={20} height={20} /> {s.secondary.label}
          </Link>
        </div>
      </div>
      <div className="hero__dots">
        {slides.map((item, i) => (
          <button key={item.key} className={i === idx ? 'is-active' : ''} onClick={() => setIdx(i)} aria-label={`${i + 1}번째 배너`} />
        ))}
      </div>
    </section>
  );
}
