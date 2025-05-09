import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [isLogin, setIsLogin] = useState(true);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const url = isLogin ? '/login' : '/signup';
    const res = await axios.post(`http://localhost:5000${url}`, form);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    }
  };
/*asf*/
  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/profile', { headers: { Authorization: token } })
        .then(res => setProfile(res.data))
        .catch(() => setToken(null));
    }
  }, [token]);

  if (!token) {
    return (
      <div className="auth-container">
        <h2>{isLogin ? 'Login' : 'Signup'}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && <input type="text" name="username" placeholder="Username" onChange={handleChange} required />}<br />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required /><br />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required /><br />
          <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
        </form>
        <button className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Switch to Signup' : 'Switch to Login'}
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p><strong>Welcome:</strong> {profile?.username}</p>
      <p><strong>Email:</strong> {profile?.email}</p>
      <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Logout</button>
    </div>
  );
}