import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import FormsList from './pages/FormsList';
import Submissions from './pages/Submissions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/forms" replace />} />
          <Route path="forms" element={<FormsList />} />
          <Route path="submissions" element={<Submissions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
