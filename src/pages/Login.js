// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/authService'; // ✅ Rename to avoid conflict
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // ✅ Import context
import './Login.css';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth(); // ✅ Context method to update token

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginApi(email, password); // ✅ Call API
            console.log('Login response:', response);

            const accessToken = response.data?.output?.accessToken;
            const refreshToken = response.data?.output?.refreshToken;

            if (!accessToken || !refreshToken) {
                toast.error(response.data?.message || 'Login failed: token missing');
                return;
            }

            login(accessToken); // ✅ Update context
            localStorage.setItem('refreshToken', refreshToken); // ✅ Store refresh token

            toast.success('Login successful!');
            navigate('/dashboard'); // ✅ Redirect
        } catch (err) {
            toast.error(err.message);

        }
    };

    return (
        <div className="erp-login-wrapper">
            <form className="erp-login-form" onSubmit={handleLogin}>

                <h2 className="title">Sign In</h2>
                <p className="subtitle">Access your account</p>

                <input
                    type="email"
                    placeholder="Email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span
                        className="eye-icon"
                        onClick={() => setShowPassword(prev => !prev)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </span>
                </div>

                <div className="options-row">
                    <span className="forgot" onClick={() => navigate('/forgot-password')}>
                        Forgot password?
                    </span>
                </div>

                <button type="submit" className="sign-in-btn">SIGN IN</button>


            </form>
        </div>
    );
};

export default Login;