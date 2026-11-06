import { BroadcastIcon, FilmIcon, FlagIcon, GridIcon, InboxIcon, ServerIcon, UsersIcon } from '../components/Icons';
import ConsoleLayout from '../console/ConsoleLayout';
import { useApp } from '../context/AppContext';
import { uploadState, useStudio } from '../context/StudioContext';
import { REPORTS, SEED_APPLICATIONS } from './adminData';

const ic = { width: 18, height: 18 };
const count = (n) => n > 0 && <em className="st-count">{n}</em>;

export default function AdminLayout() {
  const { allApplications } = useApp();
  const st = useStudio();

  const pendingApps =
    allApplications.filter((a) => a.status === '심사 중').length +
    SEED_APPLICATIONS.filter((a) => !st.appStatus[a.id]).length;
  const pendingReview = st.allUploads.filter((u) => uploadState(u, st.reviews[u.id]).status === '검수 대기').length;
  const pendingReports = REPORTS.filter((r) => !st.reportStatus[r.id]).length;

  const nav = [
    {
      title: '운영',
      items: [
        { to: '/admin', end: true, label: '운영 대시보드', icon: <GridIcon {...ic} /> },
        { to: '/admin/lives', label: '라이브 모니터링', icon: <BroadcastIcon {...ic} /> },
        { to: '/admin/system', label: '시스템 · 배포', icon: <ServerIcon {...ic} /> },
      ],
    },
    {
      title: '심사 · 검수',
      items: [
        { to: '/admin/applications', label: '채널 입점 심사', icon: <InboxIcon {...ic} />, badge: count(pendingApps) },
        { to: '/admin/contents', label: '콘텐츠 검수', icon: <FilmIcon {...ic} />, badge: count(pendingReview) },
      ],
    },
    {
      title: '안전',
      items: [
        { to: '/admin/reports', label: '신고 관리', icon: <FlagIcon {...ic} />, badge: count(pendingReports) },
        { to: '/admin/users', label: '회원 관리', icon: <UsersIcon {...ic} /> },
      ],
    },
  ];

  const banner = <div className="st-demo st-demo--admin">데모 관리자 모드: 실제 서비스에서는 운영자 권한(역할 기반 접근 제어)이 있는 계정만 들어올 수 있어요.</div>;

  return <ConsoleLayout kind="admin" nav={nav} banner={banner} />;
}
