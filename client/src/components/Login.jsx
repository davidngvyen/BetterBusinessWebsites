import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';
import googleIcon from '../assets/google-icon.png';

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Redirect to backend Google auth route
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="login-container">
      <h1>Welcome to Better Business</h1>
      <div className="login-content">
        <p>Sign in to manage your customer database</p>
        <button 
          onClick={handleGoogleLogin} 
          className="google-login-button"
        >
          <img src={googleIcon} alt="Google" className="google-icon" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;