import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login/Login';
import FormsList from './pages/FormsList/FormsList';
import FormCreate from './pages/FormCreate/FormCreate';
import Submissions from './pages/Submissions/Submissions';
import AccountsList from './pages/Accounts/AccountsList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/forms" replace />} />
          <Route path="forms" element={<FormsList />} />
          <Route path="forms/create" element={<FormCreate />} />
          <Route path="forms/:id/edit" element={<FormCreate />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="accounts" element={<AccountsList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
