import { useState } from 'react';
import { useApp, useRequireLogin } from '../context/AppContext';

const PLANS = [
  { name: '무료', price: 0, features: ['숏드라마 1~3화 무료', '릴스 무제한', '공개 라이브 시청', '광고 포함'], off: ['멤버십 전용 라이브', 'VOD 선공개'] },
  { name: '팬 패스', price: 4900, best: true, features: ['숏드라마 · 예능 전편', '멤버십 전용 라이브', 'VOD 24시간 선공개', '라이브 채팅 배지'], off: ['공연 실황 FHD'] },
  { name: 'MEGA PASS', price: 9900, features: ['팬 패스 모든 혜택', '공연 실황 FHD · 광고 없음', '동시 시청 4대', '오프라인 저장'], off: [] },
];

const FAQ = [
  ['팬 패스와 MEGA PASS의 차이는 무엇인가요?', 'MEGA PASS는 팬 패스 혜택에 더해 공연 실황 고화질, 광고 제거, 동시 시청 4대, 오프라인 저장을 제공합니다.'],
  ['멤버십 전용 라이브는 무엇인가요?', '아티스트가 멤버십 이용자에게만 공개하는 팬미팅·비하인드 라이브입니다.'],
  ['언제든 해지할 수 있나요?', '네, 마이페이지에서 언제든 해지할 수 있으며 남은 기간까지 이용할 수 있습니다.'],
];

export default function Subscribe() {
  const { user, setPlan } = useApp();
  const requireLogin = useRequireLogin();
  const [selected, setSelected] = useState(user?.plan || '팬 패스');
  const [done, setDone] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const onSubscribe = () =>
    requireLogin(() => {
      setPlan(selected === '무료' ? null : selected); // 데모: 실제 결제 없음
      setDone(true);
    });

  return (
    <div className="page subscribe">
      <div className="subscribe__head">
        <span className="hero__badge">MEMBERSHIP</span>
        <h1>최애를 더 가까이, 멤버십</h1>
        <p>숏드라마 전편부터 멤버십 전용 라이브까지. 언제든 해지할 수 있어요.</p>
      </div>

      <div className="plans">
        {PLANS.map((p) => (
          <button key={p.name} className={`plan ${selected === p.name ? 'is-active' : ''}`} onClick={() => setSelected(p.name)}>
            {p.best && <span className="plan__best">추천</span>}
            {(user?.plan || '무료') === p.name && user && <span className="plan__current">이용 중</span>}
            <h3>{p.name}</h3>
            <p className="plan__price">
              {p.price ? <>월 <strong>{p.price.toLocaleString()}</strong>원</> : <strong>0원</strong>}
            </p>
            <ul>
              {p.features.map((f) => <li key={f}>✓ {f}</li>)}
              {p.off.map((f) => <li key={f} className="off">✕ {f}</li>)}
            </ul>
          </button>
        ))}
      </div>

      <div className="subscribe__cta">
        <button className="btn btn--grad btn--lg" onClick={onSubscribe}>
          {selected === '무료' ? '무료로 이용하기' : `${selected} 시작하기`}
        </button>
        <p>※ 데모 사이트로 실제 결제는 이루어지지 않습니다.</p>
        {done && <p className="subscribe__done">✓ {selected} 플랜이 적용되었습니다!</p>}
      </div>

      <section className="faq">
        <h2>자주 묻는 질문</h2>
        {FAQ.map(([q, a], i) => (
          <div key={q} className={`faq__item ${openFaq === i ? 'is-open' : ''}`}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}>{q} <span>{openFaq === i ? '−' : '+'}</span></button>
            {openFaq === i && <p>{a}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
