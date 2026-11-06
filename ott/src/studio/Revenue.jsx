import { Badge, LineChart, num, PageHead, Panel, seeded, StatCard, Toggle, won } from '../console/ui';
import { useStudio } from '../context/StudioContext';

const PERKS = [
  ['liveOnly', '멤버십 전용 라이브'],
  ['early', 'VOD 24시간 선공개'],
  ['badge', '채팅 멤버십 배지'],
  ['behind', '멤버십 전용 비하인드 릴스'],
];

export default function Revenue() {
  const st = useStudio();
  const { channel } = st;
  const r = seeded(`${channel.id}-rev`);
  const members = Math.round(channel.followers * 0.012);
  const perks = { liveOnly: true, early: true, badge: true, behind: false, ...(channel.perks || {}) };

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    const m = members * (0.7 + i * 0.06) * 4900;
    const donation = channel.followers * (0.5 + r() * 0.8);
    const ad = channel.followers * (0.3 + r() * 0.3);
    const gross = m + donation + ad;
    return { label: `${d.getMonth() + 1}월`, m, donation, ad, fee: gross * 0.3, net: gross * 0.7, done: i < 5 };
  });
  const cur = months[5];

  return (
    <>
      <PageHead title="수익 · 멤버십" desc="정산 금액은 플랫폼 수수료(30%) 차감 후 금액이에요. (데모 수치)" />
      <div className="st-stats">
        <StatCard label="이번 달 예상 정산액" value={won(cur.net)} diff={8.3} />
        <StatCard label="멤버십 구독자" value={num(members)} diff={4.1} />
        <StatCard label="멤버십 수익" value={won(cur.m)} />
        <StatCard label="후원 · 광고 수익" value={won(cur.donation + cur.ad)} />
      </div>

      <div className="st-grid st-grid--2-1">
        <Panel title="월별 정산액">
          <LineChart data={months.map((m) => ({ label: m.label, value: m.net }))} format={(v) => `${Math.round(v / 10000)}만`} />
        </Panel>
        <Panel title="멤버십 혜택 설정">
          <div className="st-form">
            {PERKS.map(([k, label]) => (
              <Toggle key={k} label={label} on={perks[k]} onChange={(v) => st.updateChannel(channel.id, { perks: { ...perks, [k]: v } })} />
            ))}
          </div>
          <p className="st-help">정산 계좌 · 세금 정보 등록은 데모에서 지원하지 않아요.</p>
        </Panel>
      </div>

      <Panel title="정산 내역">
        <div className="st-table-wrap">
          <table className="st-table">
            <thead><tr><th>월</th><th>멤버십</th><th>후원</th><th>광고</th><th>수수료</th><th>정산액</th><th>상태</th></tr></thead>
            <tbody>
              {[...months].reverse().map((m) => (
                <tr key={m.label}>
                  <td>{m.label}</td><td>{won(m.m)}</td><td>{won(m.donation)}</td><td>{won(m.ad)}</td>
                  <td>-{won(m.fee)}</td><td><b>{won(m.net)}</b></td><td><Badge>{m.done ? '정산 완료' : '정산 예정'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
