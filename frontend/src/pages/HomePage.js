import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to TMS</h1>
        <p className="subtitle">Complaint Management System</p>

        {isAuthenticated ? (
          <div className="welcome-section">
            <h2>Hello, {user?.username}!</h2>
            <p>Role: {user?.role}</p>
            
            {user?.role === 'SuperAdmin' && (
              <div className="admin-info">
                <p>You have access to all master screens.</p>
                <p>Navigate using the menu above to manage:</p>
                <ul>
                  <li>Departments</li>
                  <li>Programmes</li>
                  <li>Blocks</li>
                  <li>Rooms</li>
                  <li>Roles</li>
                  <li>Users</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="login-prompt">
            <p>Please login to access the system</p>
          </div>
        )}
      </div>

      <style>{`
        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 20px;
          text-align: center;
          min-height: calc(100vh - 60px);
        }

        .home-content {
          background: white;
          padding: 3rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .home-content h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        .welcome-section h2 {
          color: #333;
          margin-bottom: 1rem;
        }

        .admin-info {
          text-align: left;
          background-color: #e7f3ff;
          padding: 2rem;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          margin-top: 2rem;
        }

        .admin-info ul {
          list-style: none;
          padding-left: 0;
        }

        .admin-info li {
          padding: 0.5rem 0;
          color: #333;
        }

        .login-prompt {
          color: #666;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
