import { Link } from 'react-router-dom';

const QuizCard = ({ test, courseId }) => {
  const { _id, title, description, questionCount, duration, passingScore, attempts, maxAttempts, bestScore } = test;
  const isAttemptAllowed = !maxAttempts || (attempts || 0) < maxAttempts;

  return (
    <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-xl transition-shadow duration-200 hover:shadow-md">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
      </div>

      <div className="flex-1">
        <h4 className="text-base font-semibold text-gray-900 m-0 mb-1">{title}</h4>
        <p className="text-[13px] text-gray-500 m-0 mb-3 line-clamp-2">{description}</p>
        <div className="flex gap-4 flex-wrap text-xs text-gray-500">
          <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>{duration} min</span>
          <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /></svg>{questionCount} questions</span>
          <span>Passing: {passingScore}%</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3 shrink-0">
        {bestScore !== null && bestScore !== undefined && (
          <div className="text-right">
            <span className="block text-[11px] text-gray-500 uppercase tracking-wide">Best Score</span>
            <span className={`text-xl font-bold ${bestScore >= passingScore ? 'text-green-500' : 'text-red-500'}`}>{bestScore}%</span>
          </div>
        )}
        {isAttemptAllowed ? (
          <Link to={`/courses/${courseId}/tests/${_id}`} className="px-6 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-medium no-underline hover:bg-indigo-600 transition-colors">{attempts > 0 ? 'Retake Test' : 'Start Test'}</Link>
        ) : (
          <div className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-lg text-[13px]">Max attempts reached</div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;