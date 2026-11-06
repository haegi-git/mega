import { useState } from 'react';
import { BarList, dayLabel, LineChart, num, PageHead, Panel, seeded, StatCard, Tabs } from '../console/ui';
import { useStudio } from '../context/StudioContext';
import { byArtist, CATEGORIES } from '../data/contents';
import { formatCount } from '../data/media';

export default function Analytics() {
  const { channel } = useStudio();
  const [days, setDays] = useState('7');
  const n = Number(days);
  const r = seeded(channel.id + days);

  const series = Array.from({ length: n }, (_, i) => ({
    label: dayLabel(i - n + 1),
    value: Math.round(channel.followers * 0.03 * (0.5 + r() * 0.8) * (1 + i / (n * 2))),
  }));
  const prev = series.map((d) => ({ ...d, value: Math.round(d.value * (0.75 + r() * 0.2)) }));
  const total = series.reduce((s, d) => s + d.value, 0);
  const prevTotal = prev.reduce((s, d) => s + d.value, 0);

  // 핵심 가설: 숏드라마 → 아티스트 채널 유입
  const funnel = [
    { label: '숏드라마 상세 → 출연 아티스트', value: 31 + Math.round(r() * 8), color: 'linear-gradient(90deg,#8b5cf6,#ec4899)' },
    { label: '릴스 피드', value: 22 + Math.round(r() * 6) },
    { label: '홈 추천', value: 16 + Math.round(r() * 5) },
    { label: '검색', value: 11 + Math.round(r() * 4) },
    { label: '라이브 알림', value: 8 + Math.round(r() * 4) },
    { label: '외부 공유', value: 4 + Math.round(r() * 3) },
  ];
  const devices = [
    { label: '모바일 앱', value: 58 }, { label: '모바일 웹', value: 21 }, { label: 'PC', value: 15 }, { label: 'TV', value: 6 },
  ];
  const regions = [
    { label: '대한민국', value: 54 }, { label: '일본', value: 14 }, { label: '미국', value: 9 }, { label: '인도네시아', value: 8 }, { label: '기타', value: 15 },
  ];

  const top = byArtist(channel.id).map((c) => ({ ...c, views: Math.round(c.popularity * 4321 * (0.8 + r() * 0.4)), done: 48 + Math.round(r() * 40) }));

  return (
    <>
      <PageHead title="통계" desc="시청자 · 유입 경로 · 시청 품질(QoE)을 확인해요.">
        <Tabs value={days} onChange={setDays} items={[['7', '7일'], ['30', '30일'], ['90', '90일']]} />
      </PageHead>

      <div className="st-stats">
        <StatCard label="총 시청자" value={formatCount(total)} diff={((total - prevTotal) / prevTotal) * 100} sub="이전 기간 대비" />
        <StatCard label="총 시청 시간" value={`${num((total * 18.4) / 60)}시간`} diff={9.8} />
        <StatCard label="최고 동시 시청자 (라이브)" value={num(channel.followers * 0.09)} diff={12.2} />
        <StatCard label="신규 팔로워" value={`+${num(channel.followers * 0.0004 * n)}`} diff={5.6} />
      </div>

      <Panel title="일별 시청자" action={<span className="st-legend"><i /> 이번 기간 <i className="prev" /> 이전 기간</span>}>
        <LineChart data={series} compare={prev} format={(v) => formatCount(Math.round(v))} />
      </Panel>

      <div className="st-grid st-grid--1-1">
        <Panel title="채널 유입 경로">
          <BarList items={funnel} />
          <p className="st-help">숏드라마를 보고 출연 아티스트 채널로 들어온 시청자가 가장 많아요.</p>
        </Panel>
        <Panel title="시청 품질 (QoE)">
          <div className="st-stats st-stats--sm st-stats--2">
            <StatCard label="재생 시작 시간" value={`${(1 + r() * 0.5).toFixed(2)}초`} tone="ok" />
            <StatCard label="버퍼링 비율" value={`${(0.2 + r() * 0.5).toFixed(2)}%`} tone="ok" />
            <StatCard label="재생 실패율" value={`${(0.03 + r() * 0.1).toFixed(2)}%`} tone="ok" />
            <StatCard label="평균 비트레이트" value={`${(4 + r() * 1.5).toFixed(1)} Mbps`} />
          </div>
        </Panel>
        <Panel title="시청 기기"><BarList items={devices} /></Panel>
        <Panel title="시청 지역"><BarList items={regions} /></Panel>
      </div>

      <Panel title="인기 콘텐츠">
        <table className="st-table">
          <thead><tr><th>#</th><th>제목</th><th>유형</th><th>조회수</th><th>평균 완주율</th></tr></thead>
          <tbody>
            {top.sort((a, b) => b.views - a.views).map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td>{c.title}</td>
                <td>{CATEGORIES[c.type]}</td>
                <td>{formatCount(c.views)}</td>
                <td><div className="st-mini"><div style={{ width: `${c.done}%` }} /></div>{c.done}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
