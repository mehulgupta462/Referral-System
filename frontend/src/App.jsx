// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage"; // ← Add this
import DashboardPage from "./DashboardPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* ← Add this */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
};

export default App;
