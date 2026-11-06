import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEMO_ACCOUNTS } from '../data/demoAccounts';

// ⚠️ 데모용: 회원 정보를 브라우저 localStorage에 저장합니다.
// 실제 서비스에서는 반드시 서버 인증(API + 해시된 비밀번호 + 토큰)으로 교체하세요.

const AppContext = createContext(null);

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const EMPTY = { myList: [], history: {}, follows: [], likes: [], reminders: [], applications: [] };
export const MEMBER_PLANS = ['팬 패스', 'MEGA PASS'];

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => load('megaview:user', null));
  const [library, setLibrary] = useState(() => load('megaview:library', {}));

  useEffect(() => {
    save('megaview:user', user);
  }, [user]);
  useEffect(() => {
    save('megaview:library', library);
  }, [library]);

  const key = user?.email;
  const mine = useMemo(() => ({ ...EMPTY, ...((key && library[key]) || {}) }), [key, library]);

  const updateMine = useCallback(
    (fn) => {
      if (!key) return;
      setLibrary((prev) => ({ ...prev, [key]: fn({ ...EMPTY, ...(prev[key] || {}) }) }));
    },
    [key]
  );

  const toggleIn = (field, id) =>
    updateMine((cur) => ({
      ...cur,
      [field]: cur[field].includes(id) ? cur[field].filter((x) => x !== id) : [id, ...cur[field]],
    }));

  // ---------- 회원 ----------
  const signup = ({ name, email, password }) => {
    const users = load('megaview:users', []);
    if (users.some((u) => u.email === email) || DEMO_ACCOUNTS.some((d) => d.email === email)) {
      throw new Error('이미 가입된 이메일입니다.');
    }
    const newUser = { name, email, password, plan: null, joinedAt: Date.now() };
    save('megaview:users', [...users, newUser]);
    const { password: _pw, ...publicUser } = newUser;
    setUser(publicUser);
  };

  const login = ({ email, password }) => {
    let users = load('megaview:users', []);
    // 데모 계정은 처음 로그인할 때 이 브라우저의 회원 목록에 추가 (멤버십 변경 등이 유지되도록)
    const demo = DEMO_ACCOUNTS.find((d) => d.email === email);
    if (demo && !users.some((u) => u.email === email)) {
      const { role: _r, ...demoUser } = demo;
      users = [...users, demoUser];
      save('megaview:users', users);
    }
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    // 관리자 콘솔에서 정지한 계정은 로그인 차단
    if (load('megaview:studio', {}).userStatus?.[email] === '정지') {
      throw new Error('운영 정책 위반으로 이용이 정지된 계정입니다. 고객센터에 문의해주세요.');
    }
    const { password: _pw, ...publicUser } = found;
    setUser(publicUser);
  };

  const logout = () => setUser(null);

  const setPlan = (plan) => {
    if (!user) return;
    const users = load('megaview:users', []);
    save('megaview:users', users.map((u) => (u.email === user.email ? { ...u, plan } : u)));
    setUser({ ...user, plan });
  };

  const isMember = MEMBER_PLANS.includes(user?.plan);

  // ---------- 시청 기록 ----------
  const saveProgress = useCallback(
    (id, ep, time, duration) =>
      updateMine((cur) => ({
        ...cur,
        history: { ...cur.history, [id]: { ep, time, duration, updatedAt: Date.now() } },
      })),
    [updateMine]
  );

  const removeHistory = (id) =>
    updateMine((cur) => {
      const history = { ...cur.history };
      delete history[id];
      return { ...cur, history };
    });

  const historyList = useMemo(
    () =>
      Object.entries(mine.history)
        .map(([id, h]) => ({ id, ...h }))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [mine.history]
  );

  // ---------- 파트너 입점 신청 ----------
  const submitApplication = (data) =>
    updateMine((cur) => ({
      ...cur,
      applications: [
        { ...data, id: `app-${Date.now()}`, status: '심사 중', submittedAt: Date.now() },
        ...cur.applications,
      ],
    }));

  // ---------- 관리자: 모든 회원의 입점 신청 ----------
  const allApplications = useMemo(
    () =>
      Object.entries(library).flatMap(([email, lib]) =>
        (lib.applications || []).map((a) => ({ ...a, owner: email }))
      ),
    [library]
  );
  const setApplicationStatus = (email, id, status, note) =>
    setLibrary((prev) => {
      const lib = { ...EMPTY, ...(prev[email] || {}) };
      return {
        ...prev,
        [email]: {
          ...lib,
          applications: lib.applications.map((a) => (a.id === id ? { ...a, status, note, reviewedAt: Date.now() } : a)),
        },
      };
    });

  const value = {
    allApplications,
    setApplicationStatus,
    user,
    signup,
    login,
    logout,
    setPlan,
    isMember,

    myList: mine.myList,
    toggleMyList: (id) => toggleIn('myList', id),
    isInMyList: (id) => mine.myList.includes(id),

    follows: mine.follows,
    toggleFollow: (id) => toggleIn('follows', id),
    isFollowing: (id) => mine.follows.includes(id),

    likes: mine.likes,
    toggleLike: (id) => toggleIn('likes', id),
    isLiked: (id) => mine.likes.includes(id),

    reminders: mine.reminders,
    toggleReminder: (id) => toggleIn('reminders', id),
    hasReminder: (id) => mine.reminders.includes(id),

    saveProgress,
    getProgress: (id) => mine.history[id] || null,
    removeHistory,
    historyList,

    applications: mine.applications,
    submitApplication,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);

// 로그인이 필요한 동작을 감싸는 훅: 비로그인 시 로그인 페이지로 보냄
export function useRequireLogin() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  return (fn) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    fn();
  };
}
