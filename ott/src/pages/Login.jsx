import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Header';
import { useApp } from '../context/AppContext';
import { DEMO_ACCOUNTS } from '../data/demoAccounts';

export function AuthShell({ children }) {
  return (
    <div className="auth">
      <div className="auth__bg" />
      <header className="auth__header">
        <Logo />
      </header>
      <div className="auth__box">{children}</div>
    </div>
  );
}

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('이메일과 비밀번호를 입력해주세요.');
    try {
      login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthShell>
      <h1>로그인</h1>
      <p className="auth__sub">MEGAVIEW 계정으로 최애의 모든 순간을 만나보세요</p>
      <form onSubmit={onSubmit} className="form">
        <input name="email" type="email" placeholder="이메일" value={form.email} onChange={onChange} autoComplete="email" />
        <input name="password" type="password" placeholder="비밀번호" value={form.password} onChange={onChange} autoComplete="current-password" />
        {error && <p className="form__error">{error}</p>}
        <label className="checkbox">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          로그인 상태 유지
        </label>
        <button className="btn btn--primary btn--block btn--lg" type="submit">
          로그인하기
        </button>
      </form>
      <div className="auth__links">
        <a href="#" onClick={(e) => e.preventDefault()}>아이디 찾기</a>
        <span>|</span>
        <a href="#" onClick={(e) => e.preventDefault()}>비밀번호 찾기</a>
      </div>
      <div className="demo-login">
        <p>🧪 데모 계정으로 바로 둘러보기</p>
        {DEMO_ACCOUNTS.map((d) => (
          <button
            key={d.email}
            type="button"
            className="demo-login__btn"
            onClick={() => {
              try {
                login({ email: d.email, password: d.password });
                navigate(d.email.startsWith('admin') && from === '/' ? '/studio' : from, { replace: true });
              } catch (err) {
                setError(err.message);
              }
            }}
          >
            <strong>{d.name}</strong>
            <span>{d.role}</span>
          </button>
        ))}
      </div>
      <div className="auth__divider"><span>또는</span></div>
      <div className="social">
        <button type="button" className="social__btn social__btn--kakao" onClick={() => setError('데모에서는 소셜 로그인을 지원하지 않습니다.')}>카카오로 계속하기</button>
        <button type="button" className="social__btn social__btn--naver" onClick={() => setError('데모에서는 소셜 로그인을 지원하지 않습니다.')}>네이버로 계속하기</button>
      </div>
      <p className="auth__foot">
        아직 계정이 없으신가요? <Link to="/signup" state={location.state}>회원가입</Link>
      </p>
    </AuthShell>
  );
}
