import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Login from './pages/Login/Login';
import FormsList from './pages/FormsList/FormsList';
import FormDetail from './pages/FormDetail/FormDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected - User layout */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Navigate to="/forms" replace />} />
          <Route path="forms" element={<FormsList />} />
          <Route path="forms/:id" element={<FormDetail />} />
          <Route path="submissions" element={<div>Lịch sử nộp (Coming Soon)</div>} />
          <Route path="profile" element={<div>Hồ sơ (Coming Soon)</div>} />
          <Route path="notifications" element={<div>Thông báo (Coming Soon)</div>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/forms" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
