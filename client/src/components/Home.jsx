import { Link } from 'react-router-dom';
import './styles/Home.css';

function Home() {
  return (
    <div className="home">
      <h1>Welcome to Better Business</h1>
      <p>Manage your customer information efficiently</p>
      <div className="home-links">
        <Link to="/add" className="home-button">Add Customer</Link>
      </div>
    </div>
  );
}

export default Home;