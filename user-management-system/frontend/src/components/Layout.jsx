import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Mark from './Mark.jsx';
import { RoleBadge } from './ui.jsx';

export default function Layout() {
  const { user, logout, hasRole } = useAuth();

  const links = [];
  if (hasRole('ADMIN')) links.push({ to: '/admin/users', label: 'Users' });
  if (hasRole('MANAGER')) links.push({ to: '/manager/team', label: 'Team tasks' });
  links.push({ to: '/me', label: 'Profile and tasks' });

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Mark className="brand-mark" />
          <span>User management</span>
        </div>

        <nav className="nav" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="who">{user.email}</div>
          <div className="badges">
            {user.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
          <button className="btn btn-outline-light btn-sm" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
