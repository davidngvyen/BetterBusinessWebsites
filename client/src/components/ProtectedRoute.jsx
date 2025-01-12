import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    fetch('http://localhost:5000/auth/user', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => navigate('/login'));
  }, [navigate]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;