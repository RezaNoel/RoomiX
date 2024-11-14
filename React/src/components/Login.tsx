import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/Css/Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ارسال درخواست به سرور برای ورود
      const data = await loginUser(username, password);
      if (data && data.token && data.refreshToken) {
        // ارسال توکن و اطلاعات پروفایل به متد login
        login(data.token, data.refreshToken);

        // بررسی پارامتر redirect در URL
        const searchParams = new URLSearchParams(location.search);
        const redirectPath = searchParams.get('redirect') || '/'; 

        navigate(redirectPath); // هدایت به مسیر مشخص‌شده
      } else {
        alert('Login failed: Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="src/assets/img/login.webp"
          alt="Beautiful Visual"
        />
      </div>
      <div className="login-right">
        <form onSubmit={handleSubmit}>
          <h2>ورود</h2>
          <input
            type="text"
            placeholder="نام کاربری"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="رمزعبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
