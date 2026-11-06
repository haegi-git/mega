import { Link } from 'react-router-dom';
import { useApp, useRequireLogin } from '../context/AppContext';
import { formatCount } from '../data/media';
import { isArtistLive } from '../data/lives';

export const gradientOf = (a) => `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`;

export default function ArtistAvatar({ artist, size = 56, live, link = true }) {
  const isLive = live ?? isArtistLive(artist.id);
  const inner = (
    <span
      className={`a-avatar ${isLive ? 'is-live' : ''}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.28), background: gradientOf(artist) }}
      title={artist.name}
    >
      {artist.mark}
      {isLive && size >= 48 && <em className="a-avatar__live">LIVE</em>}
    </span>
  );
  return link ? (
    <Link to={`/artist/${artist.id}`} className="a-avatar-link" aria-label={`${artist.name} 채널`}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function FollowButton({ artist, small }) {
  const { isFollowing, toggleFollow } = useApp();
  const requireLogin = useRequireLogin();
  const on = isFollowing(artist.id);
  return (
    <button
      className={`btn ${small ? 'btn--xs' : 'btn--sm'} ${on ? 'btn--outline' : 'btn--grad'}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        requireLogin(() => toggleFollow(artist.id));
      }}
    >
      {on ? '팔로잉' : '+ 팔로우'}
    </button>
  );
}

// 홈·검색 등에서 쓰는 원형 아티스트 타일
export function ArtistTile({ artist }) {
  return (
    <div className="artist-tile">
      <ArtistAvatar artist={artist} size={96} />
      <Link to={`/artist/${artist.id}`} className="artist-tile__name">
        {artist.name}
      </Link>
      <span className="artist-tile__sub">팔로워 {formatCount(artist.followers)}</span>
    </div>
  );
}
