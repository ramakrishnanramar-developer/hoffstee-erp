import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { toast } from 'react-toastify';
import './Login.css'; // Reuse existing styles

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      toast.success('Password reset successful');
      navigate('/');
    } catch (err) {
      toast.error('Reset failed. Try again or request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-login-wrapper">
      <form className="erp-login-form" onSubmit={handleReset}>
        <h2 className="title">Reset Password</h2>
        <p className="subtitle">Enter your new password below</p>

        <input
          type="password"
          placeholder="New password"
          className="input-field"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="sign-in-btn" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <span className="forgot" onClick={() => navigate('/')}>
          Back to login
        </span>
      </form>
    </div>
  );
};

export default ResetPassword;