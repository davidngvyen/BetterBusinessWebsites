import { Link, useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import './styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/auth/logout', {
        withCredentials: true
      });
      
      // Clear all local storage and session data
      localStorage.clear();
      sessionStorage.clear();

      // Clear any cookies by setting them to expire
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirect to login page
      navigate('/login');
      
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <img src="/BB.png" alt="Better Business" className="logo" />
      </Link>
      <h1>Better Business</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/add">Add Customer</Link></li>
        <li><Link to="/customers">View Customers</Link></li>
        <li><Link to="/calendar">Calendar</Link></li>
        <li>
          <Tooltip title="Logout">
            <IconButton 
              onClick={handleLogout}
              className="logout-button"
              size="large"
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;