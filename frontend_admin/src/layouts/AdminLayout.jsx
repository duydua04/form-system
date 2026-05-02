import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutList, FileDown, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic here
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <span>FormAdmin</span>
          <small>Quản trị hệ thống</small>
        </div>
        <div className="nav-section">
          <div className="nav-label">Quản lý</div>
          
          <NavLink 
            to="/forms" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutList className="nav-icon" />
            Quản lý Form
          </NavLink>
          
          <NavLink 
            to="/submissions" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FileDown className="nav-icon" />
            Dữ liệu nộp
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">Hệ thống Form</div>
          <div className="topbar-right">
            <div className="info-pill">
              <div className="status-dot active"></div>
              Admin
            </div>
            <div className="avatar">AD</div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout} title="Đăng xuất">
              <LogOut className="icon" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
