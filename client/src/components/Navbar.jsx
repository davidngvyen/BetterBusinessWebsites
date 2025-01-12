import { Link } from 'react-router-dom';
import './styles/Navbar.css';

function Navbar() {
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
      </ul>
    </nav>
  );
}

export default Navbar;