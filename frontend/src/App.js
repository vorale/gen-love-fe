// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatPage from './pages/Chat'; // 引入 ChatPage

function App() {
  return (
    <Router>
      <Routes>
        {/* 设置默认路由为 ChatPage */}
        <Route path="/" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
