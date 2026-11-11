import { Link } from 'react-router-dom';

/** 找不到頁面 */
export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-5xl text-sage">404</p>
      <h1 className="mt-3 text-2xl font-bold">這條小徑還沒有被走出來</h1>
      <p className="mt-2 text-muted">找不到這個頁面，回到首頁重新出發吧。</p>
      <Link to="/" className="btn-primary mt-6">回到首頁</Link>
    </div>
  );
}
