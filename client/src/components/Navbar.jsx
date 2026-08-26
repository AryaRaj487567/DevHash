import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ theme, onToggleTheme }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">{'#'}</span>
          DevHash
        </Link>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link hide-sm ${isActive ? 'active' : ''}`}>
            Feed
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link hide-sm ${isActive ? 'active' : ''}`}
              >
                Dashboard
              </NavLink>
              <Link to="/editor/new" className="btn">
                Write
              </Link>
              <NavLink to="/settings" className="nav-link">
                {user?.name?.split(' ')[0] || 'Account'}
              </NavLink>
              <button
                type="button"
                className="ghost-btn hide-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log in
              </Link>
              <Link to="/register" className="btn">
                Create account
              </Link>
            </>
          )}
          <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
