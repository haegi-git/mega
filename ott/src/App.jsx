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
      </Routes>
    </>
  );
}
