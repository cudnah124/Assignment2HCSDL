// src/component/admin/Sidebar.jsx
import React from 'react'; 
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="side-nav">
      <div className="user">
        <img src="/images/user.jpg" alt="User" className="user-img" />
        <div className="user-info">
          <div>
            <h2>sManager</h2>
            <p>sManage@gmail.com</p>
          </div>
        </div>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/admin/employeemanagement">
            <img src="/images/icon/members.png" alt="Employee icon" className="icon" />
            Employee Management
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/drinkmanagement">
            <img src="/images/icon/dashboard.png" alt="Product icon" className="icon" />
            Drinks Management
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/report">
            <img src="/images/icon/reports.png" alt="Sales icon" className="icon" />
            Report 
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/order">
            <img src="/images/icon/product.png" alt="Order icon" className="icon" />
            Order Management
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
