import React, { useState } from 'react'
import './App.css'
import { Register } from './Register';
import { Login } from './Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home/home.jsx';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<Home />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path=":userid" element={<UserProfile />} />
            <Route path=":goodsid" element={<ProductDetail />} />
          </Route>
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>

  )
}

export default App
