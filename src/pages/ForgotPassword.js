import React, { useState } from 'react';
import { forgotPassword } from '../services/authService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse existing styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Reset link sent to your email');
      // Optionally redirect:
      // navigate('/');
    } catch (err) {
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-login-wrapper">
      <form className="erp-login-form" onSubmit={handleForgot}>
        <h2 className="title">Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a reset link</p>

        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="sign-in-btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <span className="forgot" onClick={() => navigate('/')}>
          Back to login
        </span>
      </form>
    </div>
  );
};

export default ForgotPassword;