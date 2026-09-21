import { useAuth } from '@/hooks/useAuth';

export default function ClientDashboard() {
  const { user } = useAuth();
  return (
    <>
      <p className="pen text-2xl">welcome back</p>
      <h1 className="mb-8">{user?.fullName ?? 'Parent'}, here are your papers</h1>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <article key={n} className="p-5 bg-paper-warm border border-ink/10 rounded-md">
            <p className="text-xs text-ink-faint mb-1">Physics · Paper {n}</p>
            <h3 className="mb-3">{n < 3 ? 'Marked' : 'In review'}</h3>
            <p className="text-sm text-ink-soft">
              {n < 3 ? '73 / 100 — annotated script ready to download.' : 'Report expected in 24 hours.'}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
