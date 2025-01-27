// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminHome from './components/AdminHome';
import Register from './components/Register';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import StockSearchApp from './components/StockSearchApp';
import MasterHome from './components/MasterHome';
import UserHome from './components/UserHome';
import UserPortfolio from './components/UserPortfolio';
import BuyStocks from './components/BuyStocks';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/master-home" element={<MasterHome />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/user-portfolio" element={<UserPortfolio />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/stock-search" element={<StockSearchApp />} />
        <Route path="/add-user" element={<Register />} />
        <Route path="/buy-stocks" element={<BuyStocks />} />
      </Routes>
    </Router>
  );
};

export default App;
