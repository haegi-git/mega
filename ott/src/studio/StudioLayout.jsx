import ArtistAvatar from '../components/ArtistAvatar';
import {
  BroadcastIcon, CalendarIcon, ChartIcon, ChatIcon, FilmIcon, GridIcon, SettingsIcon, UploadIcon, WalletIcon,
} from '../components/Icons';
import ConsoleLayout from '../console/ConsoleLayout';
import { useStudio } from '../context/StudioContext';
import { ARTISTS } from '../data/artists';

const ic = { width: 18, height: 18 };

export default function StudioLayout() {
  const { channel, onAir, setChannelId } = useStudio();
  const live = onAir[channel.id];

  const nav = [
    {
      title: '채널',
      items: [
        { to: '/studio', end: true, label: '대시보드', icon: <GridIcon {...ic} /> },
        { to: '/studio/broadcast', label: '방송하기', icon: <BroadcastIcon {...ic} />, badge: live && <em className="st-onair">ON AIR</em> },
        { to: '/studio/schedule', label: '방송 예약', icon: <CalendarIcon {...ic} /> },
      ],
    },
    {
      title: '콘텐츠',
      items: [
        { to: '/studio/contents', label: '콘텐츠 관리', icon: <FilmIcon {...ic} /> },
        { to: '/studio/upload', label: '영상 업로드', icon: <UploadIcon {...ic} /> },
      ],
    },
    {
      title: '커뮤니티',
      items: [{ to: '/studio/chat', label: '채팅 · 팬 관리', icon: <ChatIcon {...ic} /> }],
    },
    {
      title: '분석 · 수익',
      items: [
        { to: '/studio/analytics', label: '통계', icon: <ChartIcon {...ic} /> },
        { to: '/studio/revenue', label: '수익 · 멤버십', icon: <WalletIcon {...ic} /> },
      ],
    },
    {
      title: '설정',
      items: [{ to: '/studio/settings', label: '채널 설정', icon: <SettingsIcon {...ic} /> }],
    },
  ];

  const top = (
    <div className="st-channel">
      <ArtistAvatar artist={channel} size={44} link={false} live={!!live} />
      <div>
        <strong>{channel.name}</strong>
        <select value={channel.id} onChange={(e) => setChannelId(e.target.value)} aria-label="관리할 채널">
          {ARTISTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
    </div>
  );

  const banner = (
    <div className="st-demo">데모 모드: 왼쪽 위에서 관리할 채널을 바꿔가며 둘러볼 수 있어요. 실제 송출·결제는 일어나지 않습니다.</div>
  );

  return <ConsoleLayout kind="studio" nav={nav} top={top} banner={banner} />;
}
