import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LP from '../../styles/login.module.css';
import backgroundImage from './background.jpg';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (role) => async (e) => {
    e.preventDefault();
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username,
      password,
      role
    });
    if (response.data.success) {
        alert(response.data.message);
        navigate(role === 'manager' ? '/admin' : '/employee/menu');
      }
    } catch (err) {
        console.error('Error details:', err.response);
      alert(err.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div
      className={LP.wrapper}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={LP.content} > 

        <form onSubmit={(e) => e.preventDefault()}>
          <h1 className={LP.title}>Welcome</h1>

          <div className={LP.box}>
            <div className={LP.icon}><i className='bx bx-user-circle'></i></div>
            <div className={LP.inputBox}>
              <label className={LP.label}>Enter your name</label>
              <input
                type="text"
                className={LP.input}
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className={LP.box}>
            <div className={LP.icon}><i className='bx bx-lock'></i></div>
            <div className={LP.inputBox}>
              <label className={LP.label}>Enter your Password</label>
              <input
                type="password"
                className={LP.input}
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className={LP.optionBoxes}>
            <button type="button" className={LP.optionBox} onClick={handleLogin('manager')}>Login as Admin</button>
            <button type="button" className={LP.optionBox} onClick={handleLogin('staff')}>Login as Employee</button>
          </div>
        </form>
      </div >
    </div>
  );
}

export default Login;
