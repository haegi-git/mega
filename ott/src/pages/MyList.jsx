import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArtistTile } from '../components/ArtistAvatar';
import ContentCard, { ContinueCard, ShortCard } from '../components/ContentCard';
import { TrashIcon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { getArtist } from '../data/artists';
import { getContent } from '../data/contents';
import { getShort } from '../data/shorts';

export default function MyList() {
  const { follows, myList, historyList, likes, removeHistory } = useApp();
  const [tab, setTab] = useState('follows');

  const followItems = follows.map(getArtist).filter(Boolean);
  const listItems = myList.map(getContent).filter(Boolean);
  const historyItems = historyList.map((h) => ({ h, c: getContent(h.id) })).filter(({ c }) => c);
  const likedShorts = likes.map(getShort).filter(Boolean);

  const tabs = [
    ['follows', `팔로우 (${followItems.length})`],
    ['list', `찜한 작품 (${listItems.length})`],
    ['history', `시청 기록 (${historyItems.length})`],
    ['likes', `좋아요한 릴스 (${likedShorts.length})`],
  ];

  const Empty = ({ text, to, label }) => (
    <div className="empty">
      <p>{text}</p>
      {to && <Link to={to} className="btn btn--grad">{label}</Link>}
    </div>
  );

  return (
    <div className="page">
      <div className="page__head"><h1>MY</h1></div>
      <div className="tabs">
        {tabs.map(([k, label]) => (
          <button key={k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === 'follows' && (followItems.length ? (
        <div className="search__artists">{followItems.map((a) => <ArtistTile key={a.id} artist={a} />)}</div>
      ) : <Empty text="아직 팔로우한 아티스트가 없어요." to="/artists" label="아티스트 둘러보기" />)}

      {tab === 'list' && (listItems.length ? (
        <div className="grid">{listItems.map((c) => <ContentCard key={c.id} content={c} />)}</div>
      ) : <Empty text="아직 찜한 작품이 없어요." to="/browse/drama" label="숏드라마 보러가기" />)}

      {tab === 'history' && (historyItems.length ? (
        <div className="grid grid--wide">
          {historyItems.map(({ c, h }) => (
            <div key={c.id} className="history-item">
              <ContinueCard content={c} progress={h} />
              <button className="history-item__del" onClick={() => removeHistory(c.id)} aria-label="기록 삭제" title="기록 삭제">
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      ) : <Empty text="시청 기록이 없어요." />)}

      {tab === 'likes' && (likedShorts.length ? (
        <div className="grid grid--shorts">{likedShorts.map((s) => <ShortCard key={s.id} short={s} />)}</div>
      ) : <Empty text="좋아요한 릴스가 없어요." to="/shorts" label="릴스 보러가기" />)}
    </div>
  );
}
