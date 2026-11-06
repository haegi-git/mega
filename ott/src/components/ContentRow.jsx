import { useRef } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from './ContentCard';
import { ChevronLeft, ChevronRight } from './Icons';

export default function ContentRow({ title, items, moreLink, ranked, children }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (!children && (!items || items.length === 0)) return null;

  return (
    <section className="row">
      <div className="row__head">
        <h2>{title}</h2>
        {moreLink && (
          <Link to={moreLink} className="row__more">
            전체보기 <ChevronRight width={16} height={16} />
          </Link>
        )}
      </div>
      <div className="row__wrap">
        <button className="row__arrow row__arrow--left" onClick={() => scroll(-1)} aria-label="이전">
          <ChevronLeft />
        </button>
        <div className={`row__track ${ranked ? 'row__track--ranked' : ''}`} ref={ref}>
          {children ||
            items.map((c, i) => <ContentCard key={c.id} content={c} rank={ranked ? i + 1 : undefined} />)}
        </div>
        <button className="row__arrow row__arrow--right" onClick={() => scroll(1)} aria-label="다음">
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
