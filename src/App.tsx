import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import CountdownApp from './apps/countdown/CountdownApp';
import TodoApp from './apps/todo/TodoApp';
import PomodoroApp from './apps/pomodoro/PomodoroApp';
import ChatApp from './apps/chat/ChatApp';
import './App.css';

const App: React.FC = () => {
  return (
    <Router basename="/productivity">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/countdown" element={<CountdownApp />} />
        <Route path="/todo" element={<TodoApp />} />
        <Route path="/pomodoro" element={<PomodoroApp />} />
        <Route path="/chat" element={<ChatApp />} />
        {/* Future apps can be added here */}
        {/* <Route path="/habit-tracker" element={<HabitTracker />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
