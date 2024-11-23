import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AddProduct from './AddProduct';
import Checkout from './Checkout';
import ViewStock from './ViewStock';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Shop Header */}
        <header className="app-header">
          <h1>RA-MODA</h1>
          <p className="tagline">Your Fashion, Our Passion</p>
        </header>

        {/* Navigation Links */}
        <nav className="navbar">
          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/" className="nav-link">Add Product</Link>
            </li>
            <li className="nav-item">
              <Link to="/checkout" className="nav-link">Process Checkout</Link>
            </li>
            <li className="nav-item">
              <Link to="/view-stock" className="nav-link">View Stock</Link>
            </li>
          </ul>
        </nav>

        <hr />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<AddProduct />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/view-stock" element={<ViewStock />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
