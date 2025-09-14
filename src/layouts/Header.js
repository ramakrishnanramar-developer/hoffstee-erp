import React, { useState, useEffect } from 'react';
import {
  FiBell,
  FiSettings,
  FiSun,
  FiSearch,
  FiUser,
  FiDollarSign,
  FiHelpCircle,
  FiLogOut
} from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../services/authService';
import { getUserIdFromToken } from '../utils/jwtUtils';
import defaultAvatar from '../assets/logo.jpg';
import './Header.css';

const Header = () => {
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = getUserIdFromToken();
      if (!userId) return;

      try {
        const userData = await getUserById(userId);
        console.log("UserData Details:", userData);
        setUser(userData);
      } catch (err) {
        console.warn('Failed to fetch user info:', err);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="erp-header">
      {/* Left Section */}
      <div className="erp-left">
        <div className="erp-search">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search" />
          <span className="shortcut">⌘K</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="erp-right">
        <div className="erp-icons">
          <FaGithub className="erp-icon" />
          <FiBell className="erp-icon" />
          <FiSun className="erp-icon" />
        </div>

        <div className="erp-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="erp-avatar-wrapper">
            <img
              src={user?.imagePath || defaultAvatar}
              alt="User"
              className="erp-avatar"
            />
            <span className="status-dot" />
          </div>

          {dropdownOpen && (
            <div className="erp-dropdown">
              <div className="erp-dropdown-header">
                <img
                  src={user?.imagePath || defaultAvatar}
                  alt="User"
                  className="dropdown-avatar"
                />
                <div>
                  <div className="dropdown-name">{user?.name || 'User'}</div>
                  <div className="dropdown-role">{user?.role || 'Role'}</div>
                </div>
              </div>

              <div className="erp-dropdown-item">
                <FiUser className="dropdown-icon" />
                <span>Profile</span>
              </div>
              <div className="erp-dropdown-item">
                <FiSettings className="dropdown-icon" />
                <span>Settings</span>
              </div>
              <div className="erp-dropdown-item">
                <FiDollarSign className="dropdown-icon" />
                <span>Pricing</span>
              </div>
              <div className="erp-dropdown-item">
                <FiHelpCircle className="dropdown-icon" />
                <span>FAQ</span>
              </div>
              <div className="erp-dropdown-item" onClick={logout}>
                <FiLogOut className="dropdown-icon" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;