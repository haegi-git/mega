import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArtistAvatar, { FollowButton } from '../components/ArtistAvatar';
import ContentCard, { AgeBadge, ShortCard } from '../components/ContentCard';
import { CheckIcon, PlayIcon, PlusIcon, ShareIcon } from '../components/Icons';
import { useApp, useRequireLogin } from '../context/AppContext';
import { getArtist } from '../data/artists';
import { artistNames, CATEGORIES, getContent, isSeries, metaLine, similarTo } from '../data/contents';
import { formatCount } from '../data/media';
import { SHORTS } from '../data/shorts';
import NotFound from './NotFound';

export default function Detail() {
  const { id } = useParams();
  const content = getContent(id);
  return content ? <DetailView key={id} content={content} /> : <NotFound />;
}

function DetailView({ content }) {
  const navigate = useNavigate();
  const { isInMyList, toggleMyList, getProgress } = useApp();
  const requireLogin = useRequireLogin();
  const series = isSeries(content);
  const [tab, setTab] = useState(series ? 'episodes' : 'info');
  const [toast, setToast] = useState('');

  const progress = getProgress(content.id);
  const inList = isInMyList(content.id);
  const artists = content.artistIds.map(getArtist);
  const relatedShorts = SHORTS.filter((s) => content.artistIds.includes(s.artistId)).slice(0, 8);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었어요');
    } catch {
      showToast('링크 복사에 실패했어요');
    }
  };

  const playEp = progress?.ep || 1;
  const playLabel = progress ? `이어보기${series ? ` · ${progress.ep}화` : ''}` : series ? '1화 바로보기' : '재생';

  const tabs = [
    ...(series ? [['episodes', `회차 (${content.episodes.length})`]] : []),
    ['artists', `출연 아티스트 (${artists.length})`],
    ['info', '상세정보'],
    ['similar', '비슷한 콘텐츠'],
  ];

  return (
    <div className="detail">
      <section className="detail__hero" style={{ backgroundImage: `url(${content.backdrop})` }}>
        <div className="detail__shade" />
        <div className="detail__info">
          <div className="detail__crumbs">
            <Link to={`/browse/${content.type}`}>{CATEGORIES[content.type]}</Link>
            {content.genres.map((g) => <span key={g}>· {g}</span>)}
          </div>
          {content.tags.includes('original') && <span className="hero__badge">MEGAVIEW ORIGINAL</span>}
          <h1 className="detail__title">{content.title}</h1>
          <div className="hero__meta">
            <AgeBadge age={content.age} />
            <span>{metaLine(content)}</span>
            <span className="hero__rating">★ {content.rating}</span>
          </div>
          <p className="detail__desc">{content.desc}</p>

          {/* 핵심 흐름: 작품 → 출연 아티스트 채널 */}
          <div className="detail__cast">
            {artists.map((a) => (
              <Link key={a.id} to={`/artist/${a.id}`} className="cast-chip">
                <ArtistAvatar artist={a} size={34} link={false} />
                <span>
                  <strong>{a.name}</strong>
                  <em>채널 보기 ›</em>
                </span>
              </Link>
            ))}
          </div>

          <div className="hero__actions">
            <button className="btn btn--grad btn--lg" onClick={() => navigate(`/watch/${content.id}?ep=${playEp}`)}>
              <PlayIcon width={20} height={20} /> {playLabel}
            </button>
            <button
              className={`btn btn--circle ${inList ? 'is-on' : ''}`}
              onClick={() => requireLogin(() => { toggleMyList(content.id); showToast(inList ? '찜 목록에서 삭제했어요' : '찜 목록에 추가했어요'); })}
              aria-label="찜하기" title="찜하기"
            >
              {inList ? <CheckIcon /> : <PlusIcon />}
            </button>
            <button className="btn btn--circle" onClick={onShare} aria-label="공유하기" title="공유하기"><ShareIcon /></button>
          </div>
          {progress && progress.duration > 0 && (
            <div className="detail__progress">
              <div className="progress"><div style={{ width: `${(progress.time / progress.duration) * 100}%` }} /></div>
            </div>
          )}
        </div>
      </section>

      <section className="detail__body">
        <div className="tabs">
          {tabs.map(([k, label]) => (
            <button key={k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {tab === 'episodes' && (
          <ul className="episodes">
            {content.episodes.map((ep) => {
              const watching = progress?.ep === ep.no;
              return (
                <li key={ep.no}>
                  <Link to={`/watch/${content.id}?ep=${ep.no}`} className="episode">
                    <div className="episode__thumb">
                      <img src={ep.thumb} alt="" loading="lazy" />
                      <span className="episode__play"><PlayIcon width={26} height={26} /></span>
                      {watching && progress.duration > 0 && (
                        <div className="progress"><div style={{ width: `${(progress.time / progress.duration) * 100}%` }} /></div>
                      )}
                    </div>
                    <div className="episode__text">
                      <strong>{ep.title} {watching && <em className="episode__now">시청 중</em>}</strong>
                      <span className="episode__dur">{ep.duration}분</span>
                      <p>{ep.summary}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {tab === 'artists' && (
          <>
            <div className="cast-list">
              {artists.map((a) => (
                <div key={a.id} className="cast-card">
                  <ArtistAvatar artist={a} size={72} />
                  <div>
                    <Link to={`/artist/${a.id}`}><strong>{a.name}</strong></Link>
                    <span>{a.kind} · 팔로워 {formatCount(a.followers)}</span>
                    <p>{a.intro}</p>
                  </div>
                  <FollowButton artist={a} />
                </div>
              ))}
            </div>
            {relatedShorts.length > 0 && (
              <>
                <h2 className="section-title">출연 아티스트의 릴스</h2>
                <div className="grid grid--shorts">{relatedShorts.map((s) => <ShortCard key={s.id} short={s} />)}</div>
              </>
            )}
          </>
        )}

        {tab === 'info' && (
          <dl className="info-table">
            <dt>제목</dt><dd>{content.title}</dd>
            <dt>분류</dt><dd>{CATEGORIES[content.type]} · {content.genres.join(', ')}</dd>
            <dt>공개연도</dt><dd>{content.year}년</dd>
            <dt>관람등급</dt><dd>{content.age === 'ALL' ? '전체 관람가' : `${content.age}세 이상 관람가`}</dd>
            <dt>{series ? '회차' : '러닝타임'}</dt><dd>{series ? `총 ${content.episodes.length}화` : `${content.runtime}분`}</dd>
            <dt>출연</dt><dd>{artistNames(content)}</dd>
            <dt>줄거리</dt><dd>{content.desc}</dd>
          </dl>
        )}

        {tab === 'similar' && (
          <div className="grid">{similarTo(content).map((c) => <ContentCard key={c.id} content={c} />)}</div>
        )}
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
