import { Route, Routes } from 'react-router-dom';
import Layout, { RequireAuth, ScrollToTop } from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Detail from './pages/Detail';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Browse from './pages/Browse';
import Shorts from './pages/Shorts';
import LiveList from './pages/LiveList';
import LiveRoom from './pages/LiveRoom';
import Artists from './pages/Artists';
import Artist from './pages/Artist';
import Schedule from './pages/Schedule';
import Partner from './pages/Partner';
import MyList from './pages/MyList';
import MyPage from './pages/MyPage';
import Subscribe from './pages/Subscribe';
import NotFound from './pages/NotFound';
import StudioLayout from './studio/StudioLayout';
import StudioDashboard from './studio/StudioDashboard';
import Broadcast from './studio/Broadcast';
import StudioSchedule from './studio/StudioSchedule';
import Contents from './studio/Contents';
import Upload from './studio/Upload';
import ChatSettings from './studio/ChatSettings';
import Analytics from './studio/Analytics';
import Revenue from './studio/Revenue';
import ChannelSettings from './studio/ChannelSettings';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import LiveMonitor from './admin/LiveMonitor';
import System from './admin/System';
import Applications from './admin/Applications';
import ContentReview from './admin/ContentReview';
import Reports from './admin/Reports';
import Users from './admin/Users';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse/:type" element={<Browse />} />
          <Route path="/content/:id" element={<Detail />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/live" element={<LiveList />} />
          <Route path="/live/:id" element={<LiveRoom />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artist/:id" element={<Artist />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/search" element={<Search />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/mylist" element={<RequireAuth><MyList /></RequireAuth>} />
          <Route path="/mypage" element={<RequireAuth><MyPage /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/watch/:id" element={<RequireAuth><Watch /></RequireAuth>} />

        {/* 크리에이터 스튜디오 (방송사 · 채널 관리자) */}
        <Route path="/studio" element={<RequireAuth><StudioLayout /></RequireAuth>}>
          <Route index element={<StudioDashboard />} />
          <Route path="broadcast" element={<Broadcast />} />
          <Route path="schedule" element={<StudioSchedule />} />
          <Route path="contents" element={<Contents />} />
          <Route path="upload" element={<Upload />} />
          <Route path="chat" element={<ChatSettings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="settings" element={<ChannelSettings />} />
        </Route>

        {/* 플랫폼 운영자 콘솔 */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="lives" element={<LiveMonitor />} />
          <Route path="system" element={<System />} />
          <Route path="applications" element={<Applications />} />
          <Route path="contents" element={<ContentReview />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </>
  );
}
