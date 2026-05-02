import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { authService } from '../../services/auth.service';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.loginAdmin(formData.email, formData.password);
      if (response.success) {
        navigate('/forms');
      }
    } catch (err) {
      // Handle error based on ErrorResponse from error_helper
      let errMsg = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      if (err.details && err.details.length > 0) {
        errMsg += ' (' + err.details.map(d => `${d.field}: ${d.issue}`).join(', ') + ')';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>FormAdmin</h1>
          <p>Đăng nhập để quản trị hệ thống</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email đăng nhập <span className="required-star">*</span></label>
            <input 
              type="email" 
              name="email"
              placeholder="Nhập email đăng nhập" 
              value={formData.email}
              onChange={handleChange}
              autoFocus
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mật khẩu <span className="required-star">*</span></label>
            <input 
              type="password" 
              name="password"
              placeholder="Nhập mật khẩu" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            <LogIn className="icon" />
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
