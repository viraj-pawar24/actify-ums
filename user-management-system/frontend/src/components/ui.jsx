const ROLE_LABELS = { ADMIN: 'Admin', MANAGER: 'Manager', USER: 'User' };
const STATUS_LABELS = { PENDING: 'Pending', IN_PROGRESS: 'In progress', DONE: 'Done' };

export function RoleBadge({ role }) {
  return <span className={`badge badge-${role.toLowerCase()}`}>{ROLE_LABELS[role] ?? role}</span>;
}

export function StatusChip({ status }) {
  return <span className={`status status-${status.toLowerCase()}`}>{STATUS_LABELS[status] ?? status}</span>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Field({ label, error, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
