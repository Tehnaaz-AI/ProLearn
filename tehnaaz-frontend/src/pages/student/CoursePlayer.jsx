import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import lectureService from '../../services/lectureService';
import testService from '../../services/testService';
import VideoPlayer from '../../components/course/VideoPlayer';
import SectionList from '../../components/course/SectionList';
import QuizCard from '../../components/test/QuizCard';
import ProgressBar from '../../components/dashboard/ProgressBar';
import Loader from '../../components/common/Loader';
import { calculateCourseProgress, getNextLecture, estimateTimeRemaining, getTotalDuration } from '../../utils/progressHelper';
import { formatDuration } from '../../utils/helpers';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseById(courseId);
        setCourse(data);

        const testsData = await testService.getTestsByCourse(courseId);
        setTests(testsData);

        const next = getNextLecture(data.sections);
        if (next) selectLecture(next);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const selectLecture = async (lecture) => {
    setCurrentLecture(lecture);
    try {
      const data = await lectureService.getLectureVideoUrl(lecture._id);
      setVideoUrl(data.url);
    } catch (err) {
      setVideoUrl('');
    }
    setSidebarOpen(false);
  };

  const handleLectureEnd = async () => {
    if (currentLecture && !currentLecture.isCompleted) {
      try {
        await lectureService.markLectureComplete(currentLecture._id);
        setCourse(prev => {
          const updatedSections = prev.sections.map(sec => ({
            ...sec,
            lectures: sec.lectures.map(lec => lec._id === currentLecture._id ? { ...lec, isCompleted: true } : lec)
          }));
          return { ...prev, sections: updatedSections };
        });
      } catch {}
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12"><Loader text="Loading course..." /></div>;
  if (error) return <div className="max-w-7xl mx-auto px-6 py-12 text-center text-red-500">{error}</div>;

  const progress = calculateCourseProgress(course.sections);
  const totalDuration = getTotalDuration(course.sections);

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      {/* Mobile Toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 mb-4 cursor-pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        Course Content
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Main Video Area */}
        <div>
          <div className="bg-black rounded-2xl overflow-hidden mb-6">
            {currentLecture ? (
              <VideoPlayer
                src={videoUrl}
                title={currentLecture.title}
                onEnded={handleLectureEnd}
              />
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center text-white bg-gray-900">
                <span className="text-5xl mb-4">▶️</span>
                <p className="text-lg m-0">Select a lecture to start learning</p>
              </div>
            )}
          </div>

          {/* Current Lecture Info */}
          {currentLecture && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 m-0 mb-2">{currentLecture.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {currentLecture.duration && <span>Duration: {formatDuration(currentLecture.duration)}</span>}
                {currentLecture.isCompleted && <span className="text-green-500 font-medium">✓ Completed</span>}
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-900 m-0">Course Progress</h3>
              <span className="text-sm text-gray-500">{estimateTimeRemaining(progress, totalDuration)}</span>
            </div>
            <ProgressBar progress={progress} size="lg" />
          </div>

          {/* Tests Section */}
          {tests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 m-0 mb-4">Course Tests</h3>
              <div className="space-y-4">
                {tests.map(test => (
                  <QuizCard key={test._id} test={test} courseId={courseId} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Sections */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl">
            <SectionList
              sections={course.sections}
              onLectureSelect={selectLecture}
              currentLectureId={currentLecture?._id}
              isEnrolled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;