import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import courseService from '../../services/courseService';
import CourseCard from '../../components/course/CourseCard';
import Loader from '../../components/common/Loader';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, catData] = await Promise.all([
          courseService.getAllCourses({ category: searchParams.get('category') || '' }),
          courseService.getCategories()
        ]);
        setCourses(coursesData.courses || coursesData);
        setCategories(catData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleCategoryFilter = (cat) => {
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ category: cat });
    setActiveCategory(cat);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 m-0 mb-4">
          Learn Without Limits
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto m-0 mb-8">
          Start, switch, or advance your career with thousands of courses from world-class universities and companies.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><span className="text-xl">📚</span> 500+ Courses</span>
            <span className="flex items-center gap-1.5"><span className="text-xl">👨‍🏫</span> 100+ Instructors</span>
            <span className="flex items-center gap-1.5"><span className="text-xl">👨‍🎓</span> 50k+ Students</span>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategoryFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${activeCategory === 'all' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          All Courses
        </button>
        {categories.map(cat => (
          <button
            key={cat._id || cat}
            onClick={() => handleCategoryFilter(cat._id || cat.name || cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${activeCategory === (cat._id || cat.name || cat) ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {cat.name || cat}
          </button>
        ))}
      </div>

      {/* Loading & Error */}
      {loading && <Loader text="Loading courses..." />}
      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm text-center">{error}</div>}

      {/* Course Grid */}
      {!loading && !error && (
        <>
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">📭</span>
              <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">No courses found</h3>
              <p className="text-gray-500 m-0">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;