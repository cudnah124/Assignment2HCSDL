import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Context to manage employee data
export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
          try {
            const res = await axios.get('http://localhost:5000/api/employees');
            const formattedEmployees = res.data.map(emp => ({
                id: emp.MaNV,
                name: `${emp.Ho} ${emp.Ten}`,
                phone: emp.SDT,
                email: emp.Email,
                address: `${emp.SoNha} ${emp.Duong}, ${emp.Quan}, ${emp.ThanhPho}`
              }));
            setEmployees(formattedEmployees);
          } catch (err) {
            console.error('Lỗi lấy nhân viên:', err);
          }
        };
        fetchEmployees();
      }, []);
      useEffect(() => {
        const fetchShifts = async () => {
          try {
            const response = await axios.get('http://localhost:5000/api/calendar'); 
            const data = response.data; // lấy dữ liệu JSON
      
            const formattedShifts = data.map((shift) => ({
              id: shift.MaCa,
              date: new Date(shift.NgayLam),
              NhanVienLam: shift.NhanVienLam || null,  // Nếu không có nhân viên, gán null
              GioLam: shift.GioLam,
              GioTan: shift.GioTan,
              details: `${shift.NhanVienLam ? shift.NhanVienLam : 'No employee assigned'} (${shift.GioLam} - ${shift.GioTan})`
            }));
            setShifts(formattedShifts);
          } catch (error) {
            console.error('Error fetching shifts:', error);
          }
        };
      
        fetchShifts();
      }, []);
    //Calendar
    const addShift = async (newShift) => {
        try {
            console.log(newShift.date)
            const shiftForDB = {
                NgayLam: newShift.Ngay,
                GioLam: newShift.GioLam,
                GioTan: newShift.GioTan,
                MaNV: newShift.MaNV // Array các MaNV
            };

            await axios.post('http://localhost:5000/api/calendar', shiftForDB);

            setShifts(prev => [...prev, newShift]);
            window.location.reload();
        } catch (err) {
            console.error('Lỗi thêm ca làm:', err);
        }
    };
    
    const updateShift = async (updateShift) => {
        try {
            const shiftForDB = {
                NgayLam: updateShift.date.toISOString().split('T')[0],
                GioLam: updateShift.GioLam,
                GioTan: updateShift.GioTan,
                MaNV: updateShift.MaNV,
                MaCa: updateShift.id // Array các MaNV
            };
            
            // Sửa lại URL để sử dụng MaCa thay vì MaNV
            await axios.put(`http://localhost:5000/api/calendar/${updateShift.id}`, shiftForDB);
            
            // Cập nhật lại danh sách ca làm trong state
            setShifts(prev =>
                prev.map(shift => shift.id === updateShift.id ? { ...shift, ...updateShift } : shift)
            );
            window.location.reload();
        } catch (err) {
            console.error('Lỗi cập nhật ca làm:', err);
        }
    };

    const deleteShift = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/calendar/${id}`);
            setShifts(prev => prev.filter(shift => shift.id !== id));
        } catch (err) {
            console.error('Lỗi xóa ca làm:', err);
        }
    };

    //Add employee 
    const addEmployee = async (newEmp) => {
        try {
            const [soNha, ...duongParts] = newEmp.address.split(',')[0].trim().split(' ');
            const duong = duongParts.join(' ');
            const quan = newEmp.address.split(',')[1]?.trim();
            const thanhPho = newEmp.address.split(',')[2]?.trim();
            const [ho, ...tenParts] = newEmp.name.trim().split(' ');
            const ten = tenParts.join(' ');
    
            const empForDB = {
                MaNV: newEmp.id,
                Ho: ho,
                Ten: ten,
                SDT: newEmp.phone,
                Email: newEmp.email,
                SoNha: soNha,
                Duong: duong,
                Quan: quan,
                ThanhPho: thanhPho
            };
    
            await axios.post('http://localhost:5000/api/employees', empForDB);
    
            // Thêm vào state nếu thêm thành công trên server
            setEmployees(prev => [...prev, newEmp]);
        } catch (err) {
            console.error('Lỗi thêm nhân viên:', err);
        }
    };
    //Update employee info
    const updateEmployee = async (updateEmp) => {
        try {
            const [soNha, ...duongParts] = updateEmp.address.split(',')[0].trim().split(' ');
            const duong = duongParts.join(' ');
            const quan = updateEmp.address.split(',')[1]?.trim();
            const thanhPho = updateEmp.address.split(',')[2]?.trim();
            const [ho, ...tenParts] = updateEmp.name.trim().split(' ');
            const ten = tenParts.join(' ');
    
            const empForDB = {
                MaNV: updateEmp.id,
                Ho: ho,
                Ten: ten,
                SDT: updateEmp.phone,
                Email: updateEmp.email,
                SoNha: soNha,
                Duong: duong,
                Quan: quan,
                ThanhPho: thanhPho
            };
    
            await axios.put(`http://localhost:5000/api/employees/${updateEmp.id}`, empForDB);
    
            setEmployees(prev =>
                prev.map(emp => emp.id === updateEmp.id ? updateEmp : emp)
            );
        } catch (err) {
            console.error('Lỗi cập nhật nhân viên:', err);
        }
    };
    //Delete employee 
    const deleteEmployee = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/employees/${id}`);
            setEmployees(prev => prev.filter(emp => emp.id !== id));
        } catch (err) {
            console.error('Lỗi xóa nhân viên:', err);
        }
    };

    return (
        <EmployeeContext.Provider value={{ 
            employees, 
            shifts,
            addEmployee, 
            updateEmployee, 
            deleteEmployee ,
            addShift,
            updateShift,
            deleteShift
        }}>
            {children}
        </EmployeeContext.Provider>
    );
};