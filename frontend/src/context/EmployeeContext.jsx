import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Context to manage employee data
export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
    const [employees, setEmployees] = useState([]);

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
            addEmployee, 
            updateEmployee, 
            deleteEmployee 
        }}>
            {children}
        </EmployeeContext.Provider>
    );
};