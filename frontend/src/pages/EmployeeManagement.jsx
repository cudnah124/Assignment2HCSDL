import React, { useContext, useState, useEffect, useRef} from "react";
import '../styles/format.css';  
// import axios from 'axios';
import { EmployeeContext } from "../context/EmployeeContext";


function EmployeeManage() {
  //Use EmployeeContext
  const { shifts, addShift, updateShift, deleteShift, employees, addEmployee, updateEmployee, deleteEmployee } = useContext(EmployeeContext);
  const [newEmp, setNewEmp] = useState({ id: '', name: '', phone: '', email: '', address: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [empToDelete, setEmpToDelete] = useState(null);

  //Calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newShift, setNewShift] = useState({ MaNV: '', name: '', GioLam: '', GioTan: '', Ngay: '' });
  const [showAddShiftForm, setShowAddShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null)
  const [ShiftToDelete, setShiftToDelete] = useState(null);
  const [showShiftDeleteConfirm, setShowShiftDeleteConfirm] = useState(false);
  const datePickerRef = useRef(null);
  
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

  const handleShiftEditClick = (shift) => {
    setShowDatePicker(false);
    setEditingShift(shift);
  };

  const handleShiftDeleteClick = (shift) => {
    setShiftToDelete(shift);
    setShowShiftDeleteConfirm(true);
  };
  
  const handleShiftDeleteConfirm = () => {
    if (ShiftToDelete && ShiftToDelete.id) {
      deleteShift(ShiftToDelete.id);
    }
    setShowShiftDeleteConfirm(false);
    setShiftToDelete(null);
  };
  
  //Handle updated info 
  const handleShiftEditSave = () => {
    updateShift(editingShift);
    setEditingShift(null);
  };

  //Add new employee
  const handleShiftAddSave = () => {
    console.log(newShift)
    if (newShift.MaNV && newShift.name) {
      addShift(newShift);
      setNewShift({ MaNV: '', name: '', GioLam: '', GioTan: '', Ngay: '' });
      setShowAddShiftForm(false);
    }
  }

  //End Calender


  //Handle when click edit or delete button
  const handleEditClick = (emp) => {
    setShowDatePicker(false);
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
              onClick={() => {
                setNewShift({
                  ...newShift,
                  Ngay: day.toLocaleDateString('en-CA'),  // Chuyển thành 'yyyy-mm-dd'
                });
                setShowAddShiftForm(true); // Hiển thị form thêm ca làm
              }}
            >
              <span className="calendar-day-number">{day.getDate()}</span>

              {/* Hiển thị ca làm nếu có */}
              {shifts
                .filter(shift => {
                  // Kiểm tra nếu shift.date là một đối tượng Date hợp lệ
                  return shift.date instanceof Date && !isNaN(shift.date) && shift.date.toDateString() === day.toDateString();
                })
                .map((shift, index) => (
                  <div key={index} className="shift-details" style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Nội dung shift, click để edit */}
                    <div 
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShiftEditClick(shift);
                      }}
                    >
                      {shift.NhanVienLam ? shift.details : 'No employee assigned'}
                    </div>

                    {/* Nút delete */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShiftDeleteClick(shift); // mở popup confirm xóa
                      }}
                      style={{
                        marginLeft: '5px',
                        backgroundColor: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
      {/* Modal chỉnh sửa ca làm */}
      {editingShift && (
        <div className="editshift-overlay">
          <div className="editshift-content">
            <h3>Edit Shift</h3>

            <label>Employee:</label>
            <select
              value={editingShift.MaNV || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedEmp = employees.find(emp => emp.id === selectedId);
                if (selectedEmp) {
                  setEditingShift({
                    ...editingShift,
                    MaNV: selectedEmp.id,
                    name: selectedEmp.name
                  });
                }
              }}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <br />

            <label>Start Time:</label>
            <input
              type="time"
              value={editingShift.GioLam || ''}
              onChange={(e) => setEditingShift({ ...editingShift, GioLam: e.target.value })}
            />
            <br />

            <label>End Time:</label>
            <input
              type="time"
              value={editingShift.GioTan || ''}
              onChange={(e) => setEditingShift({ ...editingShift, GioTan: e.target.value })}
            />
            <br />

            <button onClick={handleShiftEditSave}>Save</button>
            <button onClick={() => setEditingShift(null)} style={{ marginLeft: '10px' }}>Cancel</button>
          </div>
        </div>
      )}

    {showAddShiftForm && (
        <div className="addshift-container">
          <div className="addshift-overlay">
            <div className="addshift-content">
              <h3>Add Shift for {''}</h3>

              
              <label>Employee:</label>
              <select
                value={newShift.id}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedEmp = employees.find(emp => emp.id === selectedId);
                  if (selectedEmp) {
                    setNewShift({
                      ...newShift,
                      MaNV: selectedEmp.id,
                      name: selectedEmp.name
                    });
                  }
                }}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select><br />

             
              <label>Start Time:</label>
              <input
                type="time"
                value={newShift.GioLam}
                onChange={(e) => setNewShift({ ...newShift, GioLam: e.target.value })}
              /><br />
              <label>End Time:</label>
              <input
                type="time"
                value={newShift.GioTan}
                onChange={(e) => setNewShift({ ...newShift, GioTan: e.target.value })}
              /><br />

              <button onClick={handleShiftAddSave}>Save Shift</button>
              <button onClick={() => setShowAddShiftForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showShiftDeleteConfirm && (
        <div className="popup-overlay">
          <div className="popup-content">
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete shift <b>{ShiftToDelete.NhanVienLam}</b>?</p>
          <button onClick={handleShiftDeleteConfirm}>Yes, Delete</button>
          <button onClick={() => setShowShiftDeleteConfirm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManage;
