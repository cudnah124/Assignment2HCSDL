import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom"; 
import EF from "./employee.module.css";
import logo from "./logo.jpg";

function EmployeeDashboard() {

  const navigate = useNavigate();
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      //Clear user session info
      navigate("/"); //return to Login Page 
    }
  };

  return (
    <div>
      {/* Header with Coffee Name and Logo */} 
      <div className={EF.header}>
        <div className={EF.topBar} >
          <img src={logo} alt="Coffe logo" className={EF.logo} />
          <div className={EF.coffeeName}>Coffee Store</div>
        </div>
        <span className={EF.logoutP} onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</span>
      </div>

      {/* Navigation Bar */}
      <div className={EF.option}>
        <nav>
          <ul>
            <li><NavLink to="menu" className={({ isActive }) => isActive ? EF.active : ""}>Menu</NavLink></li>
            <li><NavLink to="voucher" className={({ isActive }) => isActive ? EF.active : ""}>Voucher</NavLink></li>
            <li><NavLink to="order" className={({ isActive }) => isActive ? EF.active : ""}>Orders</NavLink></li>
          </ul>
        </nav>
      </div>

      {/* Dynamic content here */}
      <div className={EF.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default EmployeeDashboard;
