import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import CountdownApp from './apps/countdown/CountdownApp';
import TodoApp from './apps/todo/TodoApp';
import './App.css';

function App() {
  return (
    <Router basename="/productivity">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/countdown" element={<CountdownApp />} />
        <Route path="/todo" element={<TodoApp />} />
        {/* Future apps can be added here */}
        {/* <Route path="/habit-tracker" element={<HabitTracker />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
