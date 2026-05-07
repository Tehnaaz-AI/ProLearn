import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import CourseCard from '../../components/course/CourseCard';
import AnalyticsCard from '../../components/dashboard/AnalyticsCard';
import ProgressBar from '../../components/dashboard/ProgressBar';
import Loader from '../../components/common/Loader';
import { calculateCourseProgress, getProgressStatus, estimateTimeRemaining, getTotalDuration } from '../../utils/progressHelper';
import { formatDuration } from '../../utils/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await userService.getEnrolledCourses();
        setEnrollments(data.enrollments || data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12"><Loader text="Loading dashboard..." /></div>;

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => calculateCourseProgress(e.course?.sections) === 100).length;
  const inProgressCourses = totalCourses - completedCourses;
  const avgProgress = totalCourses > 0 ? Math.round(enrollments.reduce((acc, e) => acc + calculateCourseProgress(e.course?.sections), 0) / totalCourses) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 m-0 mb-1">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 m-0">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <AnalyticsCard
          title="Enrolled Courses"
          value={totalCourses}
          trend="up"
          trendValue="+2 this month"
          color="indigo"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>}
        />
        <AnalyticsCard
          title="Completed"
          value={completedCourses}
          color="green"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
        />
        <AnalyticsCard
          title="In Progress"
          value={inProgressCourses}
          color="yellow"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>}
        />
        <AnalyticsCard
          title="Avg. Progress"
          value={`${avgProgress}%`}
          color="blue"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
        />
      </div>

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm mb-6">{error}</div>}

      {/* Continue Learning */}
      {enrollments.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold text-gray-900 m-0 mb-5">Continue Learning</h2>
          <div className="space-y-4 mb-10">
            {enrollments.map(enrollment => {
              const course = enrollment.course;
              const progress = calculateCourseProgress(course?.sections);
              const totalDuration = getTotalDuration(course?.sections);
              return (
                <Link key={enrollment._id} to={`/courses/${course?._id}/learn`} className="flex flex-col sm:flex-row gap-4 p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow no-underline text-inherit group">
                  <img src={course?.thumbnail} alt={course?.title} className="w-full sm:w-48 h-28 object-cover rounded-lg shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 m-0 mb-1 group-hover:text-indigo-500 transition-colors">{course?.title}</h3>
                    <p className="text-sm text-gray-500 m-0 mb-3">{course?.instructor?.name}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{getProgressStatus(progress)} • {estimateTimeRemaining(progress, totalDuration)}</span>
                      <span className="text-sm font-semibold text-indigo-500">{progress}%</span>
                    </div>
                    <ProgressBar progress={progress} size="sm" showLabel={false} />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 mb-10">
          <span className="text-6xl block mb-4">📖</span>
          <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6 m-0">Explore our catalog and start learning today.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium no-underline transition-colors">Browse Courses</Link>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;