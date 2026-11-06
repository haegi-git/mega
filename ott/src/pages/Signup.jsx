import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthShell } from './Login';
import { useApp } from '../context/AppContext';

const TERMS = [
  { key: 'age', label: '만 14세 이상입니다', required: true },
  { key: 'service', label: '서비스 이용약관 동의', required: true },
  { key: 'privacy', label: '개인정보 수집 및 이용 동의', required: true },
  { key: 'marketing', label: '마케팅 정보 수신 동의', required: false },
];

export default function Signup() {
  const { signup } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [agree, setAgree] = useState({});
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const allChecked = TERMS.every((t) => agree[t.key]);
  const toggleAll = () => setAgree(allChecked ? {} : Object.fromEntries(TERMS.map((t) => [t.key, true])));

  const pwRules = [
    { ok: form.password.length >= 8, label: '8자 이상' },
    { ok: /[A-Za-z]/.test(form.password) && /\d/.test(form.password), label: '영문+숫자 포함' },
  ];

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('이름(닉네임)을 입력해주세요.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('올바른 이메일 형식이 아닙니다.');
    if (!pwRules.every((r) => r.ok)) return setError('비밀번호 조건을 확인해주세요.');
    if (form.password !== form.confirm) return setError('비밀번호가 일치하지 않습니다.');
    if (!TERMS.filter((t) => t.required).every((t) => agree[t.key])) return setError('필수 약관에 동의해주세요.');
    try {
      signup({ name: form.name.trim(), email: form.email, password: form.password });
      navigate(location.state?.from || '/artists', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthShell>
      <h1>회원가입</h1>
      <p className="auth__sub">가입하고 아티스트를 팔로우하면 라이브 알림을 받을 수 있어요</p>
      <form onSubmit={onSubmit} className="form">
        <input name="name" placeholder="이름 (닉네임)" value={form.name} onChange={onChange} />
        <input name="email" type="email" placeholder="이메일" value={form.email} onChange={onChange} autoComplete="email" />
        <input name="password" type="password" placeholder="비밀번호" value={form.password} onChange={onChange} autoComplete="new-password" />
        <ul className="pw-rules">
          {pwRules.map((r) => (
            <li key={r.label} className={r.ok ? 'ok' : ''}>✓ {r.label}</li>
          ))}
        </ul>
        <input name="confirm" type="password" placeholder="비밀번호 확인" value={form.confirm} onChange={onChange} autoComplete="new-password" />

        <div className="terms">
          <label className="checkbox checkbox--all">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            전체 동의
          </label>
          {TERMS.map((t) => (
            <label key={t.key} className="checkbox">
              <input type="checkbox" checked={!!agree[t.key]} onChange={(e) => setAgree({ ...agree, [t.key]: e.target.checked })} />
              <span>
                <em className={t.required ? 'req' : 'opt'}>{t.required ? '[필수]' : '[선택]'}</em> {t.label}
              </span>
            </label>
          ))}
        </div>

        {error && <p className="form__error">{error}</p>}
        <button className="btn btn--primary btn--block btn--lg" type="submit">
          가입하기
        </button>
      </form>
      <p className="auth__foot">
        이미 계정이 있으신가요? <Link to="/login" state={location.state}>로그인</Link>
      </p>
    </AuthShell>
  );
}
