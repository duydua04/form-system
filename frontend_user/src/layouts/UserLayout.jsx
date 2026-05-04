import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { FileText, Clock, LogOut } from 'lucide-react'; // Đã import LogOut
import { authService } from '../services/auth.service';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getUserMe()
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate]);

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    // 1. Gọi API để backend xóa session/cookie (nếu có)
    await authService.logout();

    // 2. Xóa dữ liệu local (token, thông tin user...)
    // localStorage.removeItem('token'); // Bỏ comment nếu bạn lưu token ở localStorage

    // 3. Điều hướng về trang đăng nhập
    navigate('/login', { replace: true });
  };

  if (loading) return null; // Hoặc một component loading spinner
  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? 'U';

  const isActive = (path) => location.pathname.startsWith(path);

  // Logic tự động đổi title theo trang
  const getPageTitle = () => {
    if (location.pathname.startsWith('/forms')) return { main: 'Danh sách Form', sub: 'Đang hoạt động' };
    if (location.pathname.startsWith('/submissions')) return { main: 'Lịch sử nộp', sub: 'Các form đã gửi' };
    return { main: 'Trang chủ', sub: '' };
  };

  const pageTitle = getPageTitle();

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>TOPCV FORM</span>
          <small>For SW Employees</small>
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
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="topbar-title">
            {pageTitle.main} {pageTitle.sub && <span>/ {pageTitle.sub}</span>}
          </div>

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-text" style={{ textAlign: 'right' }}>
                <span className="user-name" style={{ display: 'block', fontWeight: 600, fontSize: '14px' }}>
                  {user.full_name || user.email}
                </span>
                <span className="user-role" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Nhân viên SW
                </span>
              </div>
              <div className="avatar" style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'var(--primary-color)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                {initials}
              </div>
            </div>

            {/* Nút Đăng Xuất (Giống Admin) */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Đăng xuất"
              style={{
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--danger)';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <LogOut size={18} />
            </button>

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