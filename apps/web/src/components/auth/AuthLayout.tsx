import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-paper grid place-items-center px-6">
      <div className="w-full max-w-md bg-paper-warm border-2 border-ink/10 rounded-md p-8 shadow-lg">
        <Link to="/" className="font-display font-extrabold text-ink text-xl block mb-6">
          RedPen
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
