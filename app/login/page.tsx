'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import './LoginPage.css'; 
import logoImg from '../assets/logo.jpeg';   
import loginImg from '../assets/bg_login.jpeg';     

const demoAccounts = [
  {
    username: 'admin@wisdomecho.edu',
    password: '@Admin88',
    role: 'Administrator',
  },
  {
    username: 'livana@wisdomecho.edu',
    password: '@student001',
    role: 'Private Student',
  },
];

const validUsers = demoAccounts.map(({ username, password }) => ({
  username,
  password,
}));

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);

      const isValidUser = validUsers.some(
        (user) => user.username === username && user.password === password
      );

      if (isValidUser) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        router.push('/dashboard');
      } else {
        setErrorMsg('Invalid username or password. Please try again.');
      }
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE (GAMBAR) */}
      <div className="login-left">
        <img src={loginImg.src} alt="Wisdom Echo" />
        <div className="login-left-overlay"></div>
        <div className="login-left-content">
          <h1>Welcome Back.</h1>
          <p>
            Wisdom in Character, Echoing in the Future — sign in to access
            your classes, materials, and progress.
          </p>
          <div className="login-accent-line"></div>
        </div>
      </div>

      {/* RIGHT SIDE (FORM DALAM KOTAK) */}
      <div className="login-right">
        
        {/* INI KOTAKNYA */}
        <div className="login-box">
          
          <div className="login-header">
            <div className="login-logo">
              <img src={logoImg.src} alt="Wisdom Echo Logo" />
            </div>
            <h2>Log In</h2>
            <p>Access your student portal</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email / Username</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="login-btn">
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                    style={{ marginRight: '8px' }}
                  />{' '}
                  Signing in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {errorMsg && <div className="error-message">{errorMsg}</div>}
          
          <div className="login-footer">
            <Link href="/">&larr; Back to Home</Link>
          </div>

        </div>
        {/* BATAS KOTAK */}
        
      </div>
    </div>
  );
}