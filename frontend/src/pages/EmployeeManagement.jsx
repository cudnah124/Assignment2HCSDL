import React, { useContext, useState, useEffect, useRef} from "react";
import '../styles/format.css';  
import axios from 'axios';
import { EmployeeContext } from "../context/EmployeeContext";


function EmployeeManage() {
  //Use EmployeeContext
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useContext(EmployeeContext);
  const [newEmp, setNewEmp] = useState({ id: '', name: '', phone: '', email: '', address: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [empToDelete, setEmpToDelete] = useState(null);

  //Calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState([]); // Lưu ca làm của nhân viên
  const [editShift, setEditShift] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/calendar'); 
        const data = response.data; // lấy dữ liệu JSON
  
        const formattedShifts = data.map((shift) => ({
          id: shift.MaCa,
          date: new Date(shift.NgayLam),
          details: `${shift.NhanVienLam} (${shift.GioLam} - ${shift.GioTan})`
        }));
  
        setShifts(formattedShifts);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };
  
    fetchShifts();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const getFirstDayOfMonth = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return firstDay;
  };

  const getLastDayOfMonth = () => {
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return lastDay;
  };

  const handleEditShift = (shift) => {
    setEditShift(shift);
  };
  const handleSaveShift = () => {
    // Lưu ca làm đã chỉnh sửa
    const updatedShifts = shifts.map(shift => 
      shift.id === editShift.id ? { ...shift, details: editShift.details } : shift
    );
    setShifts(updatedShifts);
    setEditShift(null);  // Đóng form chỉnh sửa
  };
  // Hàm để tạo các ngày trong tháng
  const generateCalendar = () => {
    const firstDay = getFirstDayOfMonth();
    const lastDay = getLastDayOfMonth();
    const daysInMonth = [];
    let day = new Date(firstDay);
    while (day <= lastDay) {
      daysInMonth.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return daysInMonth;
  };
  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + delta)));
  };

  // Hàm thêm ca làm
  const addShift = (date) => {
    const shiftDetails = prompt("Enter shift details (e.g. 9:00 AM - 5:00 PM):");
    if (shiftDetails) {
      const newShift = { date, details: shiftDetails };
      setShifts([...shifts, newShift]);
    }
  };

  //End Calender


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
      {/* Lịch */}
      <div>
      <div className="calendar-header">
      <button className="calendar-nav-button" onClick={() => changeMonth(-1)}>❮</button>

      <h3 className="calendar-title" onClick={() => setShowDatePicker(!showDatePicker)}>
        {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
      </h3>

      <button className="calendar-nav-button" onClick={() => changeMonth(1)}>❯</button>

      {showDatePicker && (
        <div className="date-picker-popup" ref={datePickerRef}>
          <input
            type="month"
            value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-');
              setCurrentDate(new Date(year, month - 1));
              setShowDatePicker(false);
            }}
          />
        </div>
      )}
    </div>
        <div className="calendar-grid">
          {generateCalendar().map((day) => (
            <div
              key={day.toString()}
              className="calendar-day"
              onClick={() => addShift(day)}
            >
              <span className="calendar-day-number">{day.getDate()}</span>
              {/* Hiển thị ca làm nếu có */}
              {shifts.filter(shift => shift.date.toDateString() === day.toDateString()).map((shift, index) => (
                <div key={index} className="shift-details"  onClick={(e) => { e.stopPropagation(); handleEditShift(shift); }}>
                  {shift.details}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Modal chỉnh sửa ca làm */}
      {editShift && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Shift</h3>
            <textarea
              value={editShift.details}
              onChange={(e) => setEditShift({ ...editShift, details: e.target.value })}
              rows={3}
            />
            <button onClick={handleSaveShift}>Save</button>
            <button onClick={() => setEditShift(null)} style={{ marginLeft: '10px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManage;
