import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { errorMessage, fieldErrors } from '../api/client';
import Modal from '../components/Modal.jsx';
import { Field, PageHeader, RoleBadge } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const ALL_ROLES = ['ADMIN', 'MANAGER', 'USER'];
const ROLE_LABELS = { ADMIN: 'Admin', MANAGER: 'Manager', USER: 'User' };

export default function UsersPage() {
  const { user: me } = useAuth();
  const notify = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState(null); // { type: 'create' | 'edit' | 'roles' | 'delete', user? }

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roles.some((r) => r.toLowerCase().includes(q))
    );
  }, [users, query]);

  const close = useCallback(() => setDialog(null), []);
  const saved = (message) => {
    setDialog(null);
    notify(message);
    load();
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Create accounts, change roles and remove people who no longer need access."
        action={
          <button className="btn btn-primary" onClick={() => setDialog({ type: 'create' })}>
            Add user
          </button>
        }
      />

      <div className="toolbar">
        <input
          className="input search"
          type="search"
          placeholder="Search by name, email or role"
          aria-label="Search users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="muted">
          {filtered.length} of {users.length} users
        </span>
      </div>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Loading users…</p>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p>{users.length === 0 ? 'There are no users yet.' : 'No users match your search.'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isMe = u.email === me.email;
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      {isMe && <span className="you">You</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <div className="badges">
                        {u.roles.map((r) => (
                          <RoleBadge key={r} role={r} />
                        ))}
                      </div>
                    </td>
                    <td className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setDialog({ type: 'edit', user: u })}>
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={isMe}
                        title={isMe ? "You can't change your own roles" : undefined}
                        onClick={() => setDialog({ type: 'roles', user: u })}
                      >
                        Roles
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-danger-text"
                        disabled={isMe}
                        title={isMe ? "You can't delete your own account" : undefined}
                        onClick={() => setDialog({ type: 'delete', user: u })}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialog?.type === 'create' && <UserFormDialog mode="create" onClose={close} onSaved={saved} />}
      {dialog?.type === 'edit' && <UserFormDialog mode="edit" user={dialog.user} onClose={close} onSaved={saved} />}
      {dialog?.type === 'roles' && <RolesDialog user={dialog.user} onClose={close} onSaved={saved} />}
      {dialog?.type === 'delete' && <DeleteDialog user={dialog.user} onClose={close} onSaved={saved} />}
    </>
  );
}

function RoleCheckboxes({ selected, onToggle }) {
  return (
    <fieldset className="roles-set">
      <legend className="field-label">Roles</legend>
      {ALL_ROLES.map((role) => (
        <label key={role} className="check">
          <input type="checkbox" checked={selected.includes(role)} onChange={() => onToggle(role)} />
          {ROLE_LABELS[role]}
        </label>
      ))}
    </fieldset>
  );
}

function UserFormDialog({ mode, user, onClose, onSaved }) {
  const editing = mode === 'edit';
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    roles: ['USER'],
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleRole = (role) =>
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError('');
    try {
      if (editing) {
        await api.put(`/admin/users/${user.id}`, {
          name: form.name,
          email: form.email,
          password: form.password || undefined, // blank keeps the current password
        });
      } else {
        await api.post('/admin/users', {
          name: form.name,
          email: form.email,
          password: form.password,
          roles: form.roles.length ? form.roles : undefined, // backend defaults to User
        });
      }
      onSaved(editing ? `Saved changes to ${form.name}` : `Added ${form.name}`);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (Object.keys(fields).length === 0) setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={editing ? `Edit ${user.name}` : 'Add user'} onClose={onClose}>
      <form onSubmit={submit}>
        {formError && (
          <p className="alert" role="alert">
            {formError}
          </p>
        )}
        <Field label="Name" error={errors.name}>
          <input className="input" value={form.name} onChange={set('name')} autoFocus />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" type="email" value={form.email} onChange={set('email')} />
        </Field>
        <Field
          label={editing ? 'New password' : 'Password'}
          error={errors.password}
          hint={
            editing
              ? 'Leave blank to keep the current password.'
              : 'At least 8 characters, with upper and lower case letters, a number and a symbol.'
          }
        >
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
          />
        </Field>
        {!editing && <RoleCheckboxes selected={form.roles} onToggle={toggleRole} />}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RolesDialog({ user, onClose, onSaved }) {
  const [roles, setRoles] = useState(user.roles);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (role) =>
    setRoles((current) => (current.includes(role) ? current.filter((r) => r !== role) : [...current, role]));

  async function submit(e) {
    e.preventDefault();
    if (roles.length === 0) {
      setError('Choose at least one role.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.put(`/admin/users/${user.id}/roles`, { roles });
      onSaved(`Updated roles for ${user.name}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Roles for ${user.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <p className="muted">The roles you select replace the ones this user has now.</p>
        <RoleCheckboxes selected={roles} onToggle={toggle} />
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save roles'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteDialog({ user, onClose, onSaved }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await api.delete(`/admin/users/${user.id}`);
      onSaved(`Deleted ${user.name}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={`Delete ${user.name}?`} onClose={onClose}>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      <p>
        This removes {user.email} and every task assigned to them. It can't be undone.
      </p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={confirm} disabled={busy}>
          {busy ? 'Deleting…' : 'Delete user'}
        </button>
      </div>
    </Modal>
  );
}
