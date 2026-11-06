import { useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { ARTISTS } from '../data/artists';
import { allGenres, byType, CATEGORIES } from '../data/contents';
import NotFound from './NotFound';

const SORTS = {
  popular: { label: '인기순', fn: (a, b) => b.popularity - a.popularity },
  latest: { label: '최신순', fn: (a, b) => b.year - a.year || b.popularity - a.popularity },
  rating: { label: '평점순', fn: (a, b) => b.rating - a.rating },
  title: { label: '가나다순', fn: (a, b) => a.title.localeCompare(b.title, 'ko') },
};

const INTRO = {
  drama: '아이돌이 직접 연기하는 3~8분짜리 숏드라마. 출퇴근길에 한 편씩!',
  show: '무대 밖 진짜 모습. 아티스트가 직접 출연하는 자체 예능.',
  concert: '놓친 공연도 다시. 콘서트 · 쇼케이스 · 페스티벌 실황.',
};

export default function Browse() {
  const { type } = useParams();
  return CATEGORIES[type] ? <BrowseView key={type} type={type} /> : <NotFound />;
}

function BrowseView({ type }) {
  const [genre, setGenre] = useState('전체');
  const [artist, setArtist] = useState('전체');
  const [sort, setSort] = useState('popular');

  const list = useMemo(() => byType(type), [type]);
  const genres = useMemo(() => ['전체', ...allGenres(list)], [list]);
  const artists = useMemo(() => ARTISTS.filter((a) => list.some((c) => c.artistIds.includes(a.id))), [list]);

  const shown = list
    .filter((c) => genre === '전체' || c.genres.includes(genre))
    .filter((c) => artist === '전체' || c.artistIds.includes(artist))
    .sort(SORTS[sort].fn);

  return (
    <div className="page">
      <div className="type-tabs">
        {Object.entries(CATEGORIES).map(([k, label]) => (
          <NavLink key={k} to={`/browse/${k}`} className={({ isActive }) => (isActive ? 'is-active' : '')}>{label}</NavLink>
        ))}
      </div>
      <div className="page__head">
        <p className="page__desc">{INTRO[type]}</p>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="select">
          {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </div>
      <div className="filter-row">
        <span>장르</span>
        <div className="chips">
          {genres.map((g) => (
            <button key={g} className={`chip ${genre === g ? 'is-active' : ''}`} onClick={() => setGenre(g)}>{g}</button>
          ))}
        </div>
      </div>
      <div className="filter-row">
        <span>아티스트</span>
        <div className="chips">
          <button className={`chip ${artist === '전체' ? 'is-active' : ''}`} onClick={() => setArtist('전체')}>전체</button>
          {artists.map((a) => (
            <button key={a.id} className={`chip ${artist === a.id ? 'is-active' : ''}`} onClick={() => setArtist(a.id)}>{a.name}</button>
          ))}
        </div>
      </div>
      {shown.length ? (
        <div className="grid">{shown.map((c) => <ContentCard key={c.id} content={c} />)}</div>
      ) : (
        <div className="empty"><p>조건에 맞는 콘텐츠가 없어요.</p></div>
      )}
    </div>
  );
}
