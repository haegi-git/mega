import { Link } from 'react-router-dom';
import { getArtist } from '../data/artists';
import { artistNames, CATEGORIES } from '../data/contents';
import { formatDay, formatTime, statusOf } from '../data/lives';
import { formatCount } from '../data/media';
import ArtistAvatar from './ArtistAvatar';
import { EyeIcon, HeartIcon, LockIcon, PlayIcon } from './Icons';

export function AgeBadge({ age }) {
  return <span className={`age age--${age}`}>{age === 'ALL' ? 'ALL' : age}</span>;
}

export function Tags({ tags }) {
  return (
    <div className="card__tags">
      {tags.includes('original') && <span className="tag tag--original">ORIGINAL</span>}
      {tags.includes('new') && <span className="tag tag--new">NEW</span>}
    </div>
  );
}

// 포스터형 VOD 카드
export default function ContentCard({ content, rank }) {
  return (
    <Link to={`/content/${content.id}`} className={`card ${rank ? 'card--rank' : ''}`}>
      {rank && <span className="card__rank">{rank}</span>}
      <div className="card__poster">
        <img src={content.poster} alt={content.title} loading="lazy" />
        <Tags tags={content.tags} />
        {content.type === 'drama' && <span className="card__kind">숏드</span>}
        <div className="card__overlay">
          <strong>{content.title}</strong>
          <span>{artistNames(content)}</span>
        </div>
      </div>
      {!rank && (
        <>
          <p className="card__title">{content.title}</p>
          <p className="card__sub">{CATEGORIES[content.type]} · {content.artistIds.map((id) => getArtist(id).name)[0]}</p>
        </>
      )}
    </Link>
  );
}

// 이어보기 카드
export function ContinueCard({ content, progress }) {
  const pct = progress.duration ? Math.min(100, (progress.time / progress.duration) * 100) : 0;
  const ep = content.type === 'concert' ? '' : `${progress.ep}화 · `;
  return (
    <Link to={`/watch/${content.id}?ep=${progress.ep}`} className="card card--wide">
      <div className="card__poster">
        <img src={content.backdrop.replace('1600/900', '640/360')} alt={content.title} loading="lazy" />
        <div className="card__play"><PlayIcon width={30} height={30} /></div>
        <div className="progress"><div style={{ width: `${pct}%` }} /></div>
      </div>
      <p className="card__title">{content.title}</p>
      <p className="card__sub">{ep}{Math.round(pct)}% 시청</p>
    </Link>
  );
}

// 라이브 카드 (방송 중 / 예정)
export function LiveCard({ live }) {
  const a = getArtist(live.artistId);
  const status = statusOf(live);
  const onAir = status === 'live';
  return (
    <Link to={`/live/${live.id}`} className="card card--wide live-card">
      <div className="card__poster">
        <img src={live.thumb} alt={live.title} loading="lazy" />
        {status === 'scheduled' ? (
          <span className="badge-soon">{formatDay(live.startAt)} {formatTime(live.startAt)}</span>
        ) : status === 'ended' ? (
          <span className="badge-soon">다시보기</span>
        ) : (
          <>
            <span className="badge-live">LIVE</span>
            <span className="live-card__viewers"><EyeIcon width={14} height={14} /> {formatCount(live.viewers)}</span>
          </>
        )}
        {live.membersOnly && <span className="badge-member"><LockIcon width={12} height={12} /> 멤버십</span>}
      </div>
      <div className="live-card__info">
        <ArtistAvatar artist={a} size={38} link={false} live={onAir} />
        <div>
          <p className="card__title">{live.title}</p>
          <p className="card__sub">{a.name} · {live.category}</p>
        </div>
      </div>
    </Link>
  );
}

// 릴스 카드 (세로형)
export function ShortCard({ short }) {
  const a = getArtist(short.artistId);
  return (
    <Link to={`/shorts?id=${short.id}`} className="card short-card">
      <div className="card__poster">
        <img src={short.thumb} alt={short.caption} loading="lazy" />
        <div className="short-card__meta">
          <span className="short-card__artist" style={{ background: a.colors[0] }}>{a.name}</span>
          <span><HeartIcon width={13} height={13} filled /> {formatCount(short.likes)}</span>
        </div>
      </div>
      <p className="card__title">{short.caption}</p>
    </Link>
  );
}
