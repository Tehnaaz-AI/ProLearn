import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleRoute from '../components/common/RoleRoute';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Home from '../pages/student/Home';
import CourseDetails from '../pages/student/CourseDetails';
import CoursePlayer from '../pages/student/CoursePlayer';
import StudentDashboard from '../pages/student/StudentDashboard';
import TestPage from '../pages/student/TestPage';
import ResultPage from '../pages/student/ResultPage';
import PaymentHistory from '../pages/student/PaymentHistory';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Protected Student Routes */}
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/courses/:courseId/learn" element={<CoursePlayer />} />
            <Route path="/courses/:courseId/tests/:testId" element={<TestPage />} />
            <Route path="/results/:attemptId" element={<ResultPage />} />
            <Route path="/student/payment-history" element={<PaymentHistory />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;