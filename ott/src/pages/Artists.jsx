import { useState } from 'react';
import { Link } from 'react-router-dom';
import ArtistAvatar, { FollowButton } from '../components/ArtistAvatar';
import { useApp } from '../context/AppContext';
import { ARTIST_FILTERS, artistsByFollowers } from '../data/artists';
import { byArtist } from '../data/contents';
import { formatCount } from '../data/media';
import { shortsByArtist } from '../data/shorts';

export default function Artists() {
  const [filter, setFilter] = useState('전체');
  const { follows } = useApp();
  const list = artistsByFollowers().filter(ARTIST_FILTERS[filter]);

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>아티스트</h1>
          <p className="page__desc">좋아하는 아티스트를 팔로우하고 VOD · 릴스 · 라이브 소식을 받아보세요.</p>
        </div>
        {follows.length > 0 && <Link to="/mylist" className="btn btn--sm btn--outline">팔로잉 {follows.length}</Link>}
      </div>
      <div className="chips">
        {Object.keys(ARTIST_FILTERS).map((f) => (
          <button key={f} className={`chip ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="artist-grid">
        {list.map((a) => (
          <Link to={`/artist/${a.id}`} key={a.id} className="artist-card">
            <div className="artist-card__banner" style={{ backgroundImage: `url(${a.banner})` }} />
            <ArtistAvatar artist={a} size={76} link={false} />
            <strong>{a.name}</strong>
            <span className="artist-card__ko">{a.ko} · {a.kind}</span>
            <span className="artist-card__stats">
              팔로워 {formatCount(a.followers)} · VOD {byArtist(a.id).length} · 릴스 {shortsByArtist(a.id).length}
            </span>
            <FollowButton artist={a} />
          </Link>
        ))}
      </div>
    </div>
  );
}
