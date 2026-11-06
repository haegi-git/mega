import { useState } from 'react';
import { Badge, Empty, PageHead, Panel, StatCard } from '../console/ui';
import { useApp } from '../context/AppContext';
import { useStudio } from '../context/StudioContext';
import { SEED_USERS } from './adminData';

const loadUsers = () => {
  try {
    // 비밀번호는 절대 화면으로 가져오지 않음
    return JSON.parse(localStorage.getItem('megaview:users') || '[]').map(({ password: _pw, ...u }) => u);
  } catch {
    return [];
  }
};

export default function Users() {
  const st = useStudio();
  const { user: me } = useApp();
  const [q, setQ] = useState('');
  const [plan, setPlan] = useState('전체');

  const users = [...loadUsers(), ...SEED_USERS].map((u) => ({
    ...u,
    status: st.userStatus[u.email] || st.userStatus[`report:${u.name}`] || '활성',
  }));
  const shown = users
    .filter((u) => !q || u.name.includes(q) || u.email.includes(q))
    .filter((u) => plan === '전체' || (plan === '무료' ? !u.plan : u.plan === plan));

  const toggle = (u) => {
    const key = st.userStatus[`report:${u.name}`] ? `report:${u.name}` : u.email;
    st.setUserStatus(key, u.status === '정지' ? undefined : '정지');
  };

  return (
    <>
      <PageHead title="회원 관리" desc="회원 검색, 멤버십 확인, 이용 정지를 관리해요." />
      <div className="st-stats">
        <StatCard label="전체 회원 (데모)" value={`${users.length}명`} />
        <StatCard label="멤버십 이용" value={`${users.filter((u) => u.plan).length}명`} />
        <StatCard label="이용 정지" value={`${users.filter((u) => u.status === '정지').length}명`} tone="bad" />
      </div>
      <Panel
        title="회원 목록"
        action={
          <div className="st-row">
            <select value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="멤버십 필터">
              {['전체', '무료', '팬 패스', 'MEGA PASS'].map((p) => <option key={p}>{p}</option>)}
            </select>
            <input className="st-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 · 이메일 검색" />
          </div>
        }
      >
        {shown.length ? (
          <div className="st-table-wrap">
            <table className="st-table">
              <thead><tr><th>이름</th><th>이메일</th><th>멤버십</th><th>가입일</th><th>상태</th><th /></tr></thead>
              <tbody>
                {shown.map((u) => (
                  <tr key={u.email}>
                    <td>{u.name}{u.sample ? <small>샘플 회원</small> : <small>실제 가입 회원</small>}</td>
                    <td>{u.email}</td>
                    <td>{u.plan || '무료'}</td>
                    <td>{new Date(u.joinedAt).toLocaleDateString('ko-KR')}</td>
                    <td><Badge>{u.status}</Badge></td>
                    <td className="st-table__actions">
                      {u.email === me?.email ? (
                        <span className="st-help">현재 로그인 계정</span>
                      ) : (
                        <button className={`btn btn--xs ${u.status === '정지' ? 'btn--outline' : 'btn--live'}`} onClick={() => toggle(u)}>
                          {u.status === '정지' ? '정지 해제' : '이용 정지'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>검색 결과가 없어요.</Empty>}
        <p className="st-help">정지된 실제 가입 회원은 다음 로그인부터 접속이 차단돼요.</p>
      </Panel>
    </>
  );
}
