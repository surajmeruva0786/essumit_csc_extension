import { Routes, Route } from 'react-router'
import { ThemeProvider } from './app/context/ThemeContext'
import Layout from './components/Layout'
import Dashboard from './app/screens/Dashboard'
import AttendanceTrends from './app/screens/AttendanceTrends'
import Notifications from './app/screens/Notifications'
import AssignmentCalendar from './app/screens/AssignmentCalendar'
import PersonalizedDashboard from './app/screens/PersonalizedDashboard'
import CgpaTracker from './app/screens/CgpaTracker'
import Timetable from './app/screens/Timetable'
import SemesterComparison from './app/screens/SemesterComparison'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<AttendanceTrends />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/assignments" element={<AssignmentCalendar />} />
          <Route path="/dashboard" element={<PersonalizedDashboard />} />
          <Route path="/cgpa" element={<CgpaTracker />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/comparison" element={<SemesterComparison />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}
