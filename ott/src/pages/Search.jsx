import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArtistTile } from '../components/ArtistAvatar';
import ContentCard, { ShortCard } from '../components/ContentCard';
import { CloseIcon, SearchIcon } from '../components/Icons';
import { artistsByFollowers, searchArtists } from '../data/artists';
import { allGenres, searchContents, top10 } from '../data/contents';
import { searchShorts } from '../data/shorts';

const KEYWORDS = ['첫사랑 리허설', 'NOVA:X', '챌린지', '숏드라마', '하린', '월드투어'];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const setQ = (v) => setParams(v ? { q: v } : {}, { replace: true });

  const artists = searchArtists(q);
  const contents = searchContents(q);
  const shorts = searchShorts(q);
  const total = artists.length + contents.length + shorts.length;

  return (
    <div className="page search">
      <div className="search__bar">
        <SearchIcon />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="아티스트, 멤버, 작품, 해시태그로 검색해보세요" />
        {q && <button className="icon-btn" onClick={() => setQ('')} aria-label="지우기"><CloseIcon /></button>}
      </div>

      {!q ? (
        <div className="search__idle">
          <h3>추천 검색어</h3>
          <div className="chips">
            {KEYWORDS.map((k) => <button key={k} className="chip" onClick={() => setQ(k)}>{k}</button>)}
          </div>
          <h3>장르</h3>
          <div className="chips">
            {allGenres().map((g) => <button key={g} className="chip" onClick={() => setQ(g)}>#{g}</button>)}
          </div>
          <h3>인기 아티스트</h3>
          <div className="search__artists">
            {artistsByFollowers().slice(0, 6).map((a) => <ArtistTile key={a.id} artist={a} />)}
          </div>
          <h3>실시간 인기 작품</h3>
          <ol className="rank-list">
            {top10().map((c, i) => (
              <li key={c.id}><button onClick={() => setQ(c.title)}><b>{i + 1}</b> {c.title}</button></li>
            ))}
          </ol>
        </div>
      ) : total ? (
        <>
          <p className="search__count">‘<strong>{q}</strong>’ 검색 결과 {total}건</p>
          {artists.length > 0 && (
            <>
              <h2 className="section-title">아티스트</h2>
              <div className="search__artists">{artists.map((a) => <ArtistTile key={a.id} artist={a} />)}</div>
            </>
          )}
          {contents.length > 0 && (
            <>
              <h2 className="section-title">작품</h2>
              <div className="grid">{contents.map((c) => <ContentCard key={c.id} content={c} />)}</div>
            </>
          )}
          {shorts.length > 0 && (
            <>
              <h2 className="section-title">릴스</h2>
              <div className="grid grid--shorts">{shorts.map((s) => <ShortCard key={s.id} short={s} />)}</div>
            </>
          )}
        </>
      ) : (
        <div className="empty">
          <p>‘{q}’에 대한 검색 결과가 없어요.</p>
          <span>다른 검색어를 입력해보세요.</span>
        </div>
      )}
    </div>
  );
}
