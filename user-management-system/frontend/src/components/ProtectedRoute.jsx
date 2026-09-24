import { Link, Navigate, useLocation } from 'react-router-dom';
import { homePath, useAuth } from '../context/AuthContext.jsx';

/** Requires a signed-in user and, when `roles` is given, at least one of those roles. */
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.some((r) => user.roles.includes(r))) {
    return (
      <div className="empty">
        <h1>You don't have access to this page</h1>
        <p className="muted">Your account doesn't have the role this page needs.</p>
        <Link className="btn btn-primary" to={homePath(user)}>
          Go to your home page
        </Link>
      </div>
    );
  }

  return children;
}
