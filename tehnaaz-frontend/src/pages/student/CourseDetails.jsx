import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import SectionList from '../../components/course/SectionList';
import ReviewList from '../../components/course/ReviewList';
import PaymentButton from '../../components/payment/PaymentButton';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDuration, formatNumber, getStarArray, getTotalDuration, getTotalLecturesCount } from '../../utils/helpers';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseById(courseId);
        setCourse(data);

        if (isAuthenticated) {
          const status = await enrollmentService.checkEnrollment(courseId);
          setIsEnrolled(status.isEnrolled || false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, isAuthenticated]);

  const handleFreeEnrollment = async () => {
    try {
      setEnrolling(true);
      await enrollmentService.enrollInFreeCourse(courseId);
      setIsEnrolled(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsEnrolled(true);
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12"><Loader text="Loading course details..." /></div>;
  if (error || !course) return <div className="max-w-7xl mx-auto px-6 py-12 text-center text-red-500">{error || 'Course not found'}</div>;

  const { title, description, thumbnail, instructor, category, rating, reviewCount, studentCount, price, originalPrice, isPaid, level, language, sections, updatedAt } = course;
  const stars = getStarArray(rating || 0);
  const totalDuration = getTotalDuration(sections);
  const totalLectures = getTotalLecturesCount(sections);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-gray-200">
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold uppercase">{category?.name || category}</span>
              {level && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{level}</span>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 m-0 mb-4">{title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <p className="text-sm text-gray-600 m-0">Created by <span className="font-semibold text-gray-900">{instructor?.name}</span></p>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">Updated {updatedAt?.split('T')[0]}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex">{stars.map((type, i) => <span key={i} className={`text-lg ${type !== 'empty' ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
              <span className="text-lg font-semibold text-yellow-500">{rating?.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({formatNumber(reviewCount)} ratings)</span>
              <span className="text-sm text-gray-500">{formatNumber(studentCount)} students</span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-xl font-semibold text-gray-900 m-0 mb-3">About this course</h3>
            <p className="text-gray-600 leading-relaxed m-0 whitespace-pre-line">{description}</p>
          </div>

          {/* Course Content */}
          <SectionList sections={sections} isEnrolled={isEnrolled} />

          {/* Reviews */}
          <ReviewList courseId={courseId} />
        </div>

        {/* Sidebar - Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-end gap-3 mb-4">
                {isPaid ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900">{formatCurrency(price)}</span>
                    {originalPrice > price && <span className="text-lg text-gray-500 line-through mb-1">{formatCurrency(originalPrice)}</span>}
                  </>
                ) : (
                  <span className="text-3xl font-bold text-green-500">Free</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEnrolled ? (
              <button
                onClick={() => navigate(`/courses/${courseId}/learn`)}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-colors mb-3"
              >
                Go to Course
              </button>
            ) : (
              <>
                {isPaid ? (
                  <PaymentButton course={course} onEnrollmentSuccess={handlePaymentSuccess} />
                ) : (
                  <button
                    onClick={handleFreeEnrollment}
                    disabled={enrolling || !isAuthenticated}
                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-colors mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                  </button>
                )}
                {!isAuthenticated && (
                  <p className="text-center text-xs text-gray-500 m-0">Please <a href="/login" className="text-indigo-500 hover:underline">log in</a> to enroll.</p>
                )}
              </>
            )}

            <div className="h-px bg-gray-100 my-5" />

            {/* Course Meta */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 m-0">This course includes:</h4>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span>{formatDuration(totalDuration)} of video content</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                <span>{totalLectures} lectures</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                <span>Access on mobile and desktop</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <span>Certificate of completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;