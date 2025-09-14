import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import './Layout.css';

const MainLayout = () => {
  return (
    <div className="erp-layout">
      <div className="erp-body">
        <Sidebar />
        <div className="erp-main">
          <Header />
          <div className="erp-content">
            <Outlet />
          </div>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;