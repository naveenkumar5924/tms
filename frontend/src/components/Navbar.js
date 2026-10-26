import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-glass" />
      <div className="navbar-container">
        <div className="brand-and-toggle">
          <Link to="/" className="navbar-brand">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#g)" />
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#2563eb" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="brand-text">TMS</span>
          </Link>

          <button className={`nav-toggle ${open ? 'open' : ''}`} aria-label="Toggle menu" onClick={() => setOpen(s => !s)}>
            <span />
            <span />
            <span />
          </button>
        </div>

        {isAuthenticated ? (
          <>
            <div className={`nav-links ${open ? 'mobile-open' : ''}`} onClick={() => setOpen(false)}>
              <Link to="/complaints/new" className="nav-link">Raise Complaint</Link>
              {user?.role !== 'SuperAdmin' && <Link to="/my-complaints" className="nav-link">My Complaints</Link>}
              {user?.role === 'SuperAdmin' && (
                <>
                  <Link to="/departments" className="nav-link">Departments</Link>
                  <Link to="/programmes" className="nav-link">Programmes</Link>
                  <Link to="/blocks" className="nav-link">Blocks</Link>
                  <Link to="/rooms" className="nav-link">Rooms</Link>
                  <Link to="/roles" className="nav-link">Roles</Link>
                  <Link to="/users" className="nav-link">Users</Link>
                </>
              )}
              {user?.role === 'SuperAdmin' && <Link to="/complaints" className="nav-link">All Complaints</Link>}
            </div>

            <div className="nav-actions">
              <span className="nav-user">Hello, {user?.username}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </>
        ) : (
          <div className={`nav-links ${open ? 'mobile-open' : ''}`}>
            <Link to="/login" className="nav-link">Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
