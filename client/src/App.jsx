import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import RoutineView from './components/RoutineView';
import WeekRoutineView from './components/WeekRoutineView';
import AdminPanel from './components/AdminPanel';
import { ThemeProvider } from './components/ui/ThemeProvider';

import FacultyList from './components/FacultyList';

function App() {
  const [overtimeVisibility, setOvertimeVisibility] = React.useState({
    "Monday": false, "Tuesday": false, "Wednesday": false, "Thursday": false, "Friday": false, "Saturday": false
  });

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout><RoutineView overtimeVisibility={overtimeVisibility} setOvertimeVisibility={setOvertimeVisibility} /></DashboardLayout>} />
          <Route path="/week-routine" element={<DashboardLayout fullWidth={true}><WeekRoutineView overtimeVisibility={overtimeVisibility} setOvertimeVisibility={setOvertimeVisibility} /></DashboardLayout>} />
          <Route path="/faculty" element={<DashboardLayout><FacultyList /></DashboardLayout>} />
          <Route path="/admin" element={<DashboardLayout><AdminPanel /></DashboardLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
