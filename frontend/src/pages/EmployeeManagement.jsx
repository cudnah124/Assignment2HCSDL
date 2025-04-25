import React, { useContext, useState} from "react";
import '../styles/format.css';  
import { EmployeeContext } from "../context/EmployeeContext";


function EmployeeManage() {
  //Use EmployeeContext
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useContext(EmployeeContext);
  const [newEmp, setNewEmp] = useState({ id: '', name: '', phone: '', email: '', address: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [empToDelete, setEmpToDelete] = useState(null);

  console.log(employees);

  //Handle when click edit or delete button
  const handleEditClick = (emp) => {
    setEditingEmp(emp);
  };

  const handleDeleteClick = (emp) => {
    setEmpToDelete(emp);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = () => {
    if (empToDelete && empToDelete.id) {
      deleteEmployee(empToDelete.id);
    }
    setShowDeleteConfirm(false);
    setEmpToDelete(null);
  };
  
  //Handle updated info 
  const handleEditSave = () => {
    updateEmployee(editingEmp);
    setEditingEmp(null);
  };

  //Add new employee
  const handleAddSave = () => {
    if (newEmp.id && newEmp.name) {
      addEmployee(newEmp);
      setNewEmp({ id: ' ', name: '', phone: '', email: '', address: '' });
      setShowAddForm(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h2>Employee Management</h2>
      </div>

      <div className="table">
        <div className="employee-row header">
          <span>ID</span>
          <span>Name</span>
          <span>Phone</span>
          <span>Email</span>
          <span>Actions <button onClick={() => setShowAddForm(true)}>+</button></span>
        </div>

        {employees.map((emp) => (
          <div className="employee-row" key={emp.id}>
            <span>{emp.id}</span>
            <span>{emp.name}</span>
            <span>{emp.phone}</span>
            <span>{emp.email}</span>
            <span className="action-icons">
              <img src="/images/icon/edit.png" alt="Edit" onClick={() => handleEditClick(emp)} />
              <img src="/images/icon/delete.png" alt="Delete" onClick={() => handleDeleteClick(emp)} />
            </span>
          </div>
        ))}
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Add New Employee</h3>
            <label>ID:</label>
            <input value={newEmp.id} onChange={(e) => setNewEmp({ ...newEmp, id: e.target.value })} /><br />
            <label>Name:</label>
            <input value={newEmp.name} onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })} /><br />
            <label>Phone:</label>
            <input value={newEmp.phone} onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })} /><br />
            <label>Email:</label>
            <input value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} /><br />
            <label>Address:</label>
            <input value={newEmp.address} onChange={(e) => setNewEmp({ ...newEmp, address: e.target.value })} /><br />

            <button onClick={handleAddSave}>Add</button>
            <button onClick={() => setShowAddForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit popup to edit employee info */}
      {editingEmp && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Edit Employee</h3>
            <label>ID: {editingEmp.id}</label><br />
            <label>Name:</label>
            <input
              value={editingEmp.name}
              onChange={(e) => setEditingEmp({ ...editingEmp, name: e.target.value })}
            /><br />
            <label>Phone:</label>
            <input
              value={editingEmp.phone}
              onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
            /><br />
            <label>Email:</label>
            <input
              value={editingEmp.email}
              onChange={(e) => setEditingEmp({ ...editingEmp, email: e.target.value })}
            /><br />
            <label>Address:</label>
            <input
              value={editingEmp.address}
              onChange={(e) => setEditingEmp({ ...editingEmp, address: e.target.value })}
            /><br />

            <button onClick={handleEditSave}>Save</button>
            <button onClick={() => setEditingEmp(null)} style={{ marginLeft: '10px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete employee <b>{empToDelete.name}</b>?</p>
            <button onClick={handleDeleteConfirm}>Yes, Delete</button>
            <button onClick={() => setShowDeleteConfirm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManage;
