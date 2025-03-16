import { Link } from 'react-router-dom';
import './styles/Home.css';

function Home() {
  return (
    <div className="home">
      <div className="logo-container">
        <h1 className="better-business-text">Better Business</h1>
      </div>
      <p>Manage your customer information efficiently</p>
      <div className="home-links">
        <Link to="/add" className="home-button">Add Customer</Link>
      </div>
    </div>
  );
}

export default Home;