import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import CountdownApp from './apps/countdown/CountdownApp';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/countdown" element={<CountdownApp />} />
        {/* Future apps can be added here */}
        {/* <Route path="/todo" element={<TodoApp />} /> */}
        {/* <Route path="/habit-tracker" element={<HabitTracker />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
