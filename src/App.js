// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminHome from './components/AdminHome';
import Register from './components/Register';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import StockSearchApp from './components/StockSearchApp';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/stock-search" element={<StockSearchApp />} />
        <Route path="/add-user" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
