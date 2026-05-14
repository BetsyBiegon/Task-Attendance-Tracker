import React from 'react';
import Header from './components/Header';
import AttendancePanel from './components/AttendancePanel';
import TaskBoard from './components/TaskBoard';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="container">
      <Header />
      <main className="grid grid-cols-2">
        <AttendancePanel />
        <TaskBoard />
      </main>
    </div>
  );
};

export default App;
