import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api/client';
import { PageHeader, RoleBadge, StatusChip, formatDate } from '../components/ui.jsx';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [me, mine] = await Promise.all([api.get('/user/me'), api.get('/user/tasks')]);
        if (!cancelled) {
          setProfile(me.data);
          setTasks(mine.data);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader title="Profile and tasks" subtitle="Your account details and the tasks assigned to you." />

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Loading your profile…</p>
      ) : (
        profile && (
          <>
            <section className="panel profile">
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{profile.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{profile.email}</dd>
                </div>
                <div>
                  <dt>Roles</dt>
                  <dd className="badges">
                    {profile.roles.map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                  </dd>
                </div>
              </dl>
            </section>

            <h2 className="section-title">My tasks</h2>
            {tasks.length === 0 ? (
              <div className="empty">
                <p>Nothing is assigned to you right now. New tasks from your manager will show up here.</p>
              </div>
            ) : (
              <ul className="tasks panel">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <div className="task-main">
                      <strong>{t.title}</strong>
                      {t.description && <p className="muted">{t.description}</p>}
                    </div>
                    <div className="task-meta">
                      <StatusChip status={t.status} />
                      <span className="muted">{formatDate(t.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )
      )}
    </>
  );
}
