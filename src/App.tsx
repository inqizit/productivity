import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './themes/ThemeContext';
import Homepage from './components/Homepage';
import CountdownApp from './apps/countdown/CountdownApp';
import TodoApp from './apps/todo/TodoApp';
import PomodoroApp from './apps/pomodoro/PomodoroApp';
import ChatApp from './apps/chat/ChatApp';
import ExerciseApp from './apps/exercise/ExerciseApp';
import ScheduleApp from './apps/schedule/ScheduleApp';
import ThemeSettings from './components/ThemeSettings';
import './App.css';
import './themes/globalTheme.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router basename="/productivity">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/countdown" element={<CountdownApp />} />
          <Route path="/todo" element={<TodoApp />} />
          <Route path="/pomodoro" element={<PomodoroApp />} />
          <Route path="/chat" element={<ChatApp />} />
          <Route path="/exercise" element={<ExerciseApp />} />
          <Route path="/schedule" element={<ScheduleApp />} />
          <Route path="/settings/themes" element={<ThemeSettings />} />
          {/* Future apps can be added here */}
          {/* <Route path="/habit-tracker" element={<HabitTracker />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
