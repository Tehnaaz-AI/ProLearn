import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../../services/testService';
import Question from '../../components/test/Question';
import Loader from '../../components/common/Loader';

const TestPage = ({ }) => {
  const { courseId, testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState('loading'); // loading, instructions, taking, result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await testService.getTestById(testId);
        setTest(data);
        setStep('instructions');
      } catch (err) {
        setError(err.message);
        setStep('error');
      }
    };
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (step !== 'taking' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && step === 'taking') {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleStart = async () => {
    try {
      setLoading(true);
      await testService.startTest(testId);
      setTimeLeft((test.duration || 30) * 60);
      setStep('taking');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = await testService.submitTest(testId, answers);
      setResult(data);
      setStep('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (step === 'loading') return <div className="max-w-4xl mx-auto px-6 py-12"><Loader text="Loading test..." /></div>;
  if (step === 'error') return <div className="max-w-4xl mx-auto px-6 py-12 text-center text-red-500">{error}</div>;

  // Instructions Step
  if (step === 'instructions') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 m-0 mb-6">{test.title}</h1>
          <p className="text-gray-600 mb-8 m-0">{test.description}</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center font-semibold">Q</span>
              <span><strong>{test.questions?.length}</strong> Questions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center font-semibold">⏱</span>
              <span><strong>{test.duration}</strong> Minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center font-semibold">✓</span>
              <span>Passing Score: <strong>{test.passingScore}%</strong></span>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-8">
            <h4 className="text-sm font-semibold text-yellow-700 m-0 mb-2">Instructions</h4>
            <ul className="text-sm text-yellow-600 list-disc pl-5 m-0 space-y-1">
              <li>Once started, the timer cannot be paused.</li>
              <li>You must submit before the time runs out.</li>
              <li>Make sure you have a stable internet connection.</li>
            </ul>
          </div>

          <button onClick={handleStart} disabled={loading} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-colors disabled:opacity-60">
            {loading ? 'Starting...' : 'Start Test'}
          </button>
        </div>
      </div>
    );
  }

  // Taking Test Step
  if (step === 'taking') {
    const answeredCount = Object.keys(answers).length;
    const totalCount = test.questions?.length || 0;
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 mb-6 sticky top-24 z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900 m-0">{test.title}</h2>
            <p className="text-xs text-gray-500 m-0">{answeredCount}/{totalCount} answered</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-900'}`}>
            {formatTimer(timeLeft)}
          </div>
        </div>

        {/* Questions */}
        {test.questions?.map((q, i) => (
          <Question
            key={q._id}
            question={q}
            index={i}
            selectedAnswer={answers[q._id]}
            onAnswerSelect={handleAnswerSelect}
          />
        ))}

        {/* Submit */}
        <div className="flex justify-end gap-3 mt-6 mb-12">
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-colors disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    );
  }

  // Result Step
  if (step === 'result') {
    const passed = result.score >= test.passingScore;
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <span className="text-5xl">{passed ? '🎉' : '😔'}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0 mb-2">{passed ? 'Congratulations!' : 'Keep Trying!'}</h2>
          <p className="text-gray-500 mb-6 m-0">{passed ? 'You have passed the test.' : 'You did not meet the passing score. You can retake the test.'}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold m-0" style={{ color: passed ? '#22c55e' : '#ef4444' }}>{result.score}%</p>
              <p className="text-xs text-gray-500 m-0 mt-1">Your Score</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-indigo-500 m-0">{result.correctAnswers}/{result.totalQuestions}</p>
              <p className="text-xs text-gray-500 m-0 mt-1">Correct Answers</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900 m-0">{test.passingScore}%</p>
              <p className="text-xs text-gray-500 m-0 mt-1">Passing Score</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => { setStep('taking'); setAnswers({}); setTimeLeft((test.duration || 30) * 60); }} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl text-sm font-medium cursor-pointer transition-colors">Retake Test</button>
            <button onClick={() => navigate(`/courses/${courseId}/learn`)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">Back to Course</button>
          </div>
        </div>

        {/* Review Answers */}
        <h3 className="text-lg font-semibold text-gray-900 m-0 mb-4">Review Answers</h3>
        {test.questions?.map((q, i) => (
          <Question
            key={q._id}
            question={{ ...q, correctAnswer: result.answers?.[q._id]?.correctAnswer ?? q.correctAnswer }}
            index={i}
            selectedAnswer={answers[q._id]}
            showResult={true}
          />
        ))}
      </div>
    );
  }
};

export default TestPage;