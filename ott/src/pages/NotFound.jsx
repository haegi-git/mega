import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page empty empty--page">
      <h1>404</h1>
      <p>요청하신 페이지를 찾을 수 없어요.</p>
      <Link to="/" className="btn btn--primary">홈으로 가기</Link>
    </div>
  );
}
