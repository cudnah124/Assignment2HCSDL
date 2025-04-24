// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './component/login/login';
import Admin from './component/admin/admin';
import Employee from './component/employee/employee';
import DrinkManagement from './pages/DrinkManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import Report from './pages/Report';
import Order from './pages/OrderStatus';
import Menu from './pages/Menu';
import Voucher from './pages/Vouchers';
import { OrderProvider } from './context/OrderContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { DrinkProvider } from './context/DrinkContext';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for Login */}
        <Route path="/" element={<Login />} />

        {/* Admin Route with Nested Routes */}
        <Route path="/admin" element={
          <EmployeeProvider>
            <DrinkProvider>
              <Admin />
            </DrinkProvider>
          </EmployeeProvider>
        }>
          <Route path="drinkmanagement" element={<DrinkManagement />} />
          <Route path="employeemanagement" element={<EmployeeManagement />} />
          <Route path="report" element={<Report />} />
          <Route path="order" element={<Order />} />
        </Route>

        {/* Employee Route with Nested Routes */}
        <Route path="/employee" element={
          <OrderProvider>
            <DrinkProvider> {/* Bọc DrinkProvider ở đây */}
              <Employee />
            </DrinkProvider>
          </OrderProvider>
        }>
          <Route path="menu" element={<Menu />} /> {/* Menu được bọc trong DrinkProvider */}
          <Route path="voucher" element={<Voucher />} />
        </Route>
      </Routes>
    </Router>
  );
}



export default App;
