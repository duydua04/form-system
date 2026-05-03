import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { FileText, Clock, User, Bell } from 'lucide-react';
import { authService } from '../services/auth.service';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    authService.getUserMe()
      .then(data => setUser(data))
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate]);

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? 'U';

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>TÊN BRAND</span>
          <small>SW Portal v2.0</small>
        </div>

        <div className="nav-section">
          <div className="nav-label">CÔNG VIỆC</div>
          <Link to="/forms" className={`nav-item ${isActive('/forms') ? 'active' : ''}`}>
            <FileText className="nav-icon" />
            Danh sách form
          </Link>
          <Link to="/submissions" className={`nav-item ${isActive('/submissions') ? 'active' : ''}`}>
            <Clock className="nav-icon" />
            Lịch sử nộp
          </Link>
        </div>

        <div className="nav-section">
          <div className="nav-label">CÀI ĐẶT</div>
          <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <User className="nav-icon" />
            Hồ sơ
          </Link>
          <Link to="/notifications" className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}>
            <Bell className="nav-icon" />
            Thông báo
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">
            Danh sách Form <span>/ Đang hoạt động</span>
          </div>

          <div className="topbar-right">
            <div className="user-info">
              <div className="user-text">
                <span className="user-name">{user.full_name || user.email}</span>
                <span className="user-role">Nhân viên SW</span>
              </div>
              <div className="avatar">{initials}</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
