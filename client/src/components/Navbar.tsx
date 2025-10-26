import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <span className="desktop-only">🏈🏀 ROCK SPORTS</span>
          <span className="mobile-only">🏈🏀 ROCK</span>
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <span className="desktop-only">🏠 Dashboard</span>
                <span className="mobile-only">🏠</span>
              </Link>
              {user.role !== 'admin' && (
                <>
                  <Link to="/sports" className="nav-link">
                    <span className="desktop-only">🏈🏀 Live Sports</span>
                    <span className="mobile-only">🏈🏀</span>
                  </Link>
                  <Link to="/basketball" className="nav-link">
                    <span className="desktop-only">🏀 NBA</span>
                    <span className="mobile-only">🏀</span>
                  </Link>
                  <Link to="/betting" className="nav-link">
                    <span className="desktop-only">🎯 Place Bet</span>
                    <span className="mobile-only">🎯</span>
                  </Link>
                  <Link to="/history" className="nav-link">
                    <span className="desktop-only">📊 History</span>
                    <span className="mobile-only">📊</span>
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                  <span className="desktop-only">🏦 Admin</span>
                  <span className="mobile-only">🏦</span>
                </Link>
              )}
              <div className="credits">
                {user.role === 'admin' ? (
                  <>
                    <span className="desktop-only">👑 Admin</span>
                    <span className="mobile-only">👑</span>
                  </>
                ) : (
                  <>
                    <span className="desktop-only">💰 ${user.credits.toFixed(2)}</span>
                    <span className="mobile-only">💰 ${user.credits.toFixed(0)}</span>
                  </>
                )}
              </div>
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 12px', fontSize: '12px' }}>
                <span className="desktop-only">🚪 Logout</span>
                <span className="mobile-only">🚪</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">🔑 Login</Link>
              <Link to="/register" className="nav-link">🚀 Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
