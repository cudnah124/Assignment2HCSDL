import React from 'react'; 
import { Outlet } from 'react-router-dom';
import SideBar from "./SideBar"; //sidebar component
import NavBar from "./NavBar"; 
import './admin.css';

function Admin() {
  return ( 
    <div className="header_admin">
      <SideBar /> {/* Sidebar will be on the left */}
      <div className="main-content">
        <NavBar /> {/* Navbar will be on the top */}
        <main className="content-area">
          <Outlet /> {/* Content from nested routes will go here */}
          
        </main>
      </div>
    </div> 
  );
}

export default Admin;
