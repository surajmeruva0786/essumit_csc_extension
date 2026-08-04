import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import { NotificationProvider } from './app/context/NotificationContext'
import Dashboard from './screens/Dashboard'
import AttendanceTrends from './screens/AttendanceTrends'
import Notifications from './screens/Notifications'
import AssignmentCalendar from './screens/AssignmentCalendar'
import PersonalizedDashboard from './screens/PersonalizedDashboard'
import CgpaTracker from './screens/CgpaTracker'
import Timetable from './screens/Timetable'
import SemesterComparison from './screens/SemesterComparison'

export default function App() {
  return (
    <NotificationProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<AttendanceTrends />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/assignments" element={<AssignmentCalendar />} />
          <Route path="/dashboard" element={<PersonalizedDashboard />} />
          <Route path="/cgpa" element={<CgpaTracker />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/comparison" element={<SemesterComparison />} />
        </Routes>
      </Layout>
    </NotificationProvider>
  )
}
