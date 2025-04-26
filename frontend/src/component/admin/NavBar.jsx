// src/component/admin/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {

  const navigate = useNavigate();
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if(confirmed) {
      //Clear user session info
      navigate("/"); //return to Login Page 
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <h1 className="app-name">Coffee Store</h1>
        <span className="logout-link" onClick={handleLogout} style={{ cursor: 'pointer'}}><img src="/images/icon/exit.png" alt="Order icon" className="icon" /></span>
      </div>
    </div>
  );
}

export default Navbar;
