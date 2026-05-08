import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-8xl block mb-6">🔍</span>
        <h1 className="text-6xl font-bold text-gray-900 m-0 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 m-0 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto m-0">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium no-underline transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;