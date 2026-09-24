import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage, fieldErrors } from '../api/client';
import { Field, PageHeader, RoleBadge, StatusChip, formatDate } from '../components/ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function TeamTasksPage() {
  const notify = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ userId: '', title: '', description: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/manager/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function assign(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError('');
    try {
      await api.post('/manager/tasks', {
        userId: form.userId ? Number(form.userId) : null,
        title: form.title,
        description: form.description || undefined,
      });
      const assignee = users.find((u) => String(u.id) === form.userId);
      notify(`Assigned "${form.title}" to ${assignee?.name ?? 'the user'}`);
      setForm({ userId: form.userId, title: '', description: '' });
      load();
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (Object.keys(fields).length === 0) setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Team tasks" subtitle="See what everyone is working on and assign new tasks." />

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <div className="two-col">
        <form className="panel assign" onSubmit={assign}>
          <h2>Assign a task</h2>
          {formError && (
            <p className="alert" role="alert">
              {formError}
            </p>
          )}
          <Field label="Assign to" error={errors.userId}>
            <select className="input" value={form.userId} onChange={set('userId')}>
              <option value="">Choose a person</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Title" error={errors.title}>
            <input className="input" value={form.title} onChange={set('title')} />
          </Field>
          <Field label="Details" error={errors.description}>
            <textarea className="input" rows={4} value={form.description} onChange={set('description')} />
          </Field>
          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? 'Assigning…' : 'Assign task'}
          </button>
        </form>

        <div className="people">
          {loading ? (
            <p className="muted">Loading team…</p>
          ) : users.length === 0 ? (
            <div className="empty">
              <p>There are no users yet.</p>
            </div>
          ) : (
            users.map((u) => (
              <section key={u.id} className="person">
                <header className="person-head">
                  <div>
                    <h3>{u.name}</h3>
                    <p className="muted">{u.email}</p>
                  </div>
                  <div className="badges">
                    {u.roles.map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                  </div>
                </header>
                {u.tasks.length === 0 ? (
                  <p className="muted">No tasks assigned yet.</p>
                ) : (
                  <ul className="tasks">
                    {u.tasks.map((t) => (
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
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}
